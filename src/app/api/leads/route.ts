import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendLead } from "@/lib/leads-db";
import { sendDocumentToVisitor, sendLeadNotification } from "@/lib/mailer";
import { createDownloadToken } from "@/lib/download-token";
import { getProjectBySlug } from "@/lib/projects";
import { getLocalizedProjectBySlug } from "@/lib/i18n/localize";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// Generous for a person (someone requesting every brochure on a couple of
// projects), tight enough that a bot can't flood the lead sheet or burn
// through the Gmail daily sending limit.
const LEADS_PER_IP = 8;
const LEADS_WINDOW_MS = 10 * 60 * 1000;

// Brochure emails to any one address per day. Without a cap, the form could
// be used to send our emails to someone else's inbox over and over.
const DOC_EMAILS_PER_ADDRESS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(2000).optional(),
  projectSlug: z.string().trim().max(80).optional(),
  documentId: z.string().trim().max(80).optional(),
  source: z.enum(["gated-download", "general-enquiry"]),
  contactMethod: z.enum(["whatsapp", "call", "email"]).optional(),
  purpose: z.enum(["live", "invest"]).optional(),
  locale: z.enum(["en", "sr", "tr", "ar", "fa"]).optional(),
  // Honeypot: hidden from people, so anything in it came from a bot.
  leave_blank: z.string().max(500).optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = rateLimit(`lead:${ip}`, LEADS_PER_IP, LEADS_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, code: "rate_limited", error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form fields and try again." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // A filled honeypot gets a normal-looking success so the bot has nothing to
  // adapt to — but nothing is saved or emailed.
  if (data.leave_blank) {
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return NextResponse.json(
      { ok: false, code: "verification_failed", error: "Please complete the security check and try again." },
      { status: 400 }
    );
  }

  const project = data.projectSlug ? getProjectBySlug(data.projectSlug) : undefined;
  const document = project?.documents.find((d) => d.id === data.documentId);

  if (data.documentId && !document) {
    return NextResponse.json({ ok: false, error: "Requested document not found." }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  try {
    await appendLead({
      submittedAt,
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectName: project?.name ?? "General enquiry",
      documentLabel: document?.label ?? "",
      source: data.source,
      message: data.message ?? "",
      contactMethod: data.contactMethod ?? "",
      purpose: data.purpose ?? "",
      locale: data.locale ?? "",
    });
  } catch (err) {
    console.error("Failed to save lead to the database:", err);
    // Continue — we still want to try emailing.
  }

  // Brochure requests: email the visitor a signed 7-day download link right
  // away, in the language they asked from. The sales team gets the same link.
  let documentDownloadUrl: string | undefined;
  let visitorEmailed = false;
  if (project && document) {
    const token = createDownloadToken(project.slug, document.id);
    documentDownloadUrl = `${request.nextUrl.origin}/api/documents/${project.slug}/${document.id}?token=${token}`;

    const locale = data.locale ?? "en";
    const localized = getLocalizedProjectBySlug(project.slug, locale) ?? project;
    const localizedDoc = localized.documents.find((d) => d.id === document.id) ?? document;
    if (rateLimit(`doc-email:${data.email.toLowerCase()}`, DOC_EMAILS_PER_ADDRESS, DAY_MS).ok) {
      try {
        visitorEmailed = await sendDocumentToVisitor({
          to: data.email,
          name: data.name,
          projectName: localized.name,
          documentLabel: localizedDoc.label,
          url: documentDownloadUrl,
          locale,
        });
      } catch (err) {
        console.error("Failed to email the document to the visitor:", err);
      }
    }
  }

  try {
    await sendLeadNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectName: project?.name,
      documentLabel: document?.label,
      documentDownloadUrl,
      visitorEmailed,
      message: data.message,
      contactMethod: data.contactMethod,
      purpose: data.purpose,
      locale: data.locale,
      source: data.source,
      submittedAt,
    });
  } catch (err) {
    console.error("Failed to send lead notification email:", err);
    // Don't fail the request — the lead is already saved.
  }

  return NextResponse.json({ ok: true, emailed: visitorEmailed });
}

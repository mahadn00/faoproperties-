import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendLead } from "@/lib/leads-store";
import { sendLeadNotification } from "@/lib/mailer";
import { createDownloadToken } from "@/lib/download-token";
import { getProjectBySlug } from "@/lib/projects";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(2000).optional(),
  projectSlug: z.string().trim().max(80).optional(),
  documentId: z.string().trim().max(80).optional(),
  source: z.enum(["gated-download", "general-enquiry"]),
});

export async function POST(request: NextRequest) {
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
    });
  } catch (err) {
    console.error("Failed to save lead to Excel:", err);
    // Continue — we still want to try emailing.
  }

  // Never handed to the visitor — the sales team follows up and shares the
  // document directly, so this link only ever goes into the internal email.
  let documentDownloadUrl: string | undefined;
  if (project && document) {
    const token = createDownloadToken(project.slug, document.id);
    documentDownloadUrl = `${request.nextUrl.origin}/api/documents/${project.slug}/${document.id}?token=${token}`;
  }

  try {
    await sendLeadNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectName: project?.name,
      documentLabel: document?.label,
      documentDownloadUrl,
      message: data.message,
      source: data.source,
      submittedAt,
    });
  } catch (err) {
    console.error("Failed to send lead notification email:", err);
    // Don't fail the request — the lead is already saved.
  }

  return NextResponse.json({ ok: true });
}

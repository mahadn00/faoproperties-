import nodemailer from "nodemailer";
import { SITE_NAME } from "./constants";
import { formatDubai } from "./date-utils";
import { documentEmail } from "./i18n/emails";
import type { Locale } from "./i18n/dictionary";
import { CONTACT_METHOD_LABEL, PURPOSE_LABEL } from "./lead-status";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export type LeadEmailPayload = {
  name: string;
  email: string;
  phone: string;
  projectName?: string;
  documentLabel?: string;
  documentDownloadUrl?: string; // the signed link — sent to the visitor too when visitorEmailed
  visitorEmailed?: boolean;
  message?: string;
  contactMethod?: string;
  purpose?: string;
  locale?: string;
  source: string;
  submittedAt: string;
};

export async function sendLeadNotification(lead: LeadEmailPayload) {
  const t = getTransporter();
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!t || !to) {
    return { sent: false, reason: "SMTP not configured" as const };
  }

  const subject = lead.projectName
    ? `New lead: ${lead.name} — ${lead.projectName}`
    : `New lead: ${lead.name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1b2233;">
      <h2 style="margin-bottom: 4px;">New website lead</h2>
      <p style="color:#5c6474; margin-top:0;">${escapeHtml(formatDubai(lead.submittedAt))}</p>
      <table cellpadding="6" style="border-collapse: collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(lead.name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(lead.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(lead.phone)}</td></tr>
        <tr><td><strong>Contact via</strong></td><td>${escapeHtml(CONTACT_METHOD_LABEL[lead.contactMethod ?? ""] ?? "—")}</td></tr>
        <tr><td><strong>Purpose</strong></td><td>${escapeHtml(PURPOSE_LABEL[lead.purpose ?? ""] ?? "—")}</td></tr>
        <tr><td><strong>Site language</strong></td><td>${escapeHtml((lead.locale || "en").toUpperCase())}</td></tr>
        <tr><td><strong>Project</strong></td><td>${escapeHtml(lead.projectName || "General enquiry")}</td></tr>
        <tr><td><strong>Requested document</strong></td><td>${escapeHtml(lead.documentLabel || "—")}</td></tr>
        <tr><td><strong>Source</strong></td><td>${escapeHtml(lead.source)}</td></tr>
        <tr><td valign="top"><strong>Message</strong></td><td>${escapeHtml(lead.message || "—")}</td></tr>
      </table>
      ${
        lead.documentDownloadUrl
          ? `<p style="margin-top:16px;">${
              lead.visitorEmailed
                ? "The visitor was emailed this document automatically. Same link, for reference:"
                : "This visitor did not receive the file automatically — please send it directly."
            }
             <br /><a href="${escapeHtml(lead.documentDownloadUrl)}">Download ${escapeHtml(lead.documentLabel || "document")}</a>
             <br /><span style="color:#5c6474; font-size:12px;">Link valid for 7 days, for internal use only — do not forward.</span></p>`
          : ""
      }
    </div>
  `;

  await t.sendMail({
    from: `"Website Leads" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return { sent: true as const };
}

/**
 * Emails the requested brochure / price list straight to the visitor, in the
 * site language they asked from. Returns false when SMTP isn't configured
 * (the sales team then follows up by hand, as before).
 */
export async function sendDocumentToVisitor(input: {
  to: string;
  name: string;
  projectName: string;
  documentLabel: string;
  url: string;
  locale: Locale;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const { subject, html, text } = documentEmail(input.locale, input);
  await t.sendMail({
    from: `"${SITE_NAME}" <${process.env.SMTP_USER}>`,
    to: input.to,
    // Replies go to the sales inbox, not the sending account.
    replyTo: process.env.LEAD_NOTIFY_EMAIL || undefined,
    subject,
    html,
    text,
  });
  return true;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

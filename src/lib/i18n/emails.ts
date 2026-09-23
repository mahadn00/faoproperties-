import { CONTACT_EMAIL, SITE_NAME, WHATSAPP_DISPLAY } from "../constants";
import { isRtlLocale, type Locale } from "./dictionary";

// The email a visitor receives after requesting a brochure / price list, in
// the language of the page they asked from. Kept separate from dictionary.ts,
// which ships to the browser — this is only ever used on the server.

type DocumentEmailInput = { name: string; projectName: string; documentLabel: string; url: string };

const COPY: Record<
  Locale,
  {
    subject: (doc: string, project: string) => string;
    greeting: (name: string) => string;
    intro: (doc: string, project: string) => string;
    button: (doc: string) => string;
    outro: string;
    signOff: string;
  }
> = {
  en: {
    subject: (doc, project) => `Your ${doc} — ${project}`,
    greeting: (name) => `Hi ${name},`,
    intro: (doc, project) => `Thanks for your interest in ${project}. Here's the ${doc} you asked for:`,
    button: (doc) => `Download ${doc}`,
    outro: `The link works for 7 days. Reply to this email or message us on WhatsApp (${WHATSAPP_DISPLAY}) if you'd like prices, availability or a call with our team.`,
    signOff: `The ${SITE_NAME} team`,
  },
  sr: {
    subject: (doc, project) => `${doc} — ${project}`,
    greeting: (name) => `Zdravo ${name},`,
    intro: (doc, project) => `Hvala na interesovanju za ${project}. Evo dokumenta koji ste tražili (${doc}):`,
    button: (doc) => `Preuzmite: ${doc}`,
    outro: `Link važi 7 dana. Odgovorite na ovaj email ili nam pišite na WhatsApp (${WHATSAPP_DISPLAY}) ako želite cene, dostupnost ili razgovor sa našim timom.`,
    signOff: `Tim ${SITE_NAME}`,
  },
  tr: {
    subject: (doc, project) => `${project}: ${doc}`,
    greeting: (name) => `Merhaba ${name},`,
    intro: (doc, project) => `${project} ile ilgilendiğiniz için teşekkür ederiz. İstediğiniz belge (${doc}) aşağıda:`,
    button: (doc) => `${doc} indir`,
    outro: `Bağlantı 7 gün geçerlidir. Fiyatlar, müsaitlik veya ekibimizle görüşme için bu e-postayı yanıtlayabilir ya da bize WhatsApp'tan (${WHATSAPP_DISPLAY}) yazabilirsiniz.`,
    signOff: `${SITE_NAME} ekibi`,
  },
  ar: {
    subject: (doc, project) => `${doc} — ${project}`,
    greeting: (name) => `مرحبًا ${name}،`,
    intro: (doc, project) => `شكرًا لاهتمامك بمشروع ${project}. إليك المستند الذي طلبته (${doc}):`,
    button: (doc) => `تحميل ${doc}`,
    outro: `الرابط صالح لمدة 7 أيام. يمكنك الرد على هذا البريد أو مراسلتنا عبر واتساب (${WHATSAPP_DISPLAY}) للاستفسار عن الأسعار والوحدات المتاحة أو لترتيب مكالمة مع فريقنا.`,
    signOff: `فريق ${SITE_NAME}`,
  },
  fa: {
    subject: (doc, project) => `${doc} — ${project}`,
    greeting: (name) => `سلام ${name}،`,
    intro: (doc, project) => `از علاقه شما به ${project} سپاسگزاریم. مدرک درخواستی شما (${doc}):`,
    button: (doc) => `دانلود ${doc}`,
    outro: `این لینک 7 روز معتبر است. برای قیمت‌ها، واحدهای موجود یا گفت‌وگو با تیم ما، به همین ایمیل پاسخ دهید یا در واتساپ (${WHATSAPP_DISPLAY}) به ما پیام دهید.`,
    signOff: `تیم ${SITE_NAME}`,
  },
};

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function documentEmail(locale: Locale, { name, projectName, documentLabel, url }: DocumentEmailInput) {
  const c = COPY[locale];
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const align = dir === "rtl" ? "right" : "left";
  const e = escapeHtml;

  const html = `
    <div dir="${dir}" lang="${locale}" style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1b2233; text-align: ${align}; max-width: 560px;">
      <p>${e(c.greeting(name))}</p>
      <p>${e(c.intro(documentLabel, projectName))}</p>
      <p style="margin: 24px 0;">
        <a href="${e(url)}" style="display: inline-block; background: #0a1220; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: bold;">${e(c.button(documentLabel))}</a>
      </p>
      <p style="color: #5c6474;">${e(c.outro)}</p>
      <p>— ${e(c.signOff)}<br /><span style="color: #5c6474; font-size: 13px;">${e(CONTACT_EMAIL)} · ${e(WHATSAPP_DISPLAY)}</span></p>
    </div>
  `;
  const text = [c.greeting(name), "", c.intro(documentLabel, projectName), url, "", c.outro, "", `— ${c.signOff}`].join("\n");

  return { subject: c.subject(documentLabel, projectName), html, text };
}

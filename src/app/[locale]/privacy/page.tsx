import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTACT_EMAIL, OFFICE_ADDRESS, SITE_NAME, WHATSAPP_DISPLAY } from "@/lib/constants";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo";

// Plain-language privacy policy. It only describes what this codebase does,
// and the analytics / bot-check sections appear only when those features are
// switched on (they're env-gated), so the page can't drift from reality.
// The body is English for now; other languages show a one-line notice.
// Before relying on it legally, have the client review it — especially
// retention and who leads are shared with.

const LAST_UPDATED = "23 September 2026";
const ANALYTICS_ON = Boolean(process.env.NEXT_PUBLIC_GA_ID);
const TURNSTILE_ON = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildPageMetadata({
    locale,
    path: "/privacy",
    title: dictionary[locale].footer.privacy,
    description: `How ${SITE_NAME} collects, uses and protects the details you share through this website.`,
  });
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = dictionary[locale];

  return (
    <>
      <section className="bg-[var(--color-ink)]">
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-36 md:px-10">
          <h1 className="font-display text-4xl text-white md:text-5xl">{t.footer.privacy}</h1>
          {t.privacyPage.englishOnly && <p className="mt-4 text-sm text-white/70">{t.privacyPage.englishOnly}</p>}
        </div>
      </section>

      <article
        lang="en"
        dir="ltr"
        className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-[15px] leading-relaxed text-[var(--color-text-muted)] md:px-10 [&_h2]:font-display [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-[var(--color-text)] [&_li]:ms-5 [&_li]:list-disc [&_ul]:space-y-1.5"
      >
        <p className="text-sm">Last updated: {LAST_UPDATED}</p>

        <section>
          <h2>Who we are</h2>
          <p>
            This website is run by {SITE_NAME}, a real-estate agency based at {OFFICE_ADDRESS.street},{" "}
            {OFFICE_ADDRESS.city}, {OFFICE_ADDRESS.country}. You can reach us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-gold-deep)] underline">
              {CONTACT_EMAIL}
            </a>{" "}
            or on WhatsApp at {WHATSAPP_DISPLAY}.
          </p>
        </section>

        <section>
          <h2>What we collect</h2>
          <p>When you send an enquiry or request a brochure, price list or other document, we receive:</p>
          <ul className="mt-3">
            <li>your name, email address and phone/WhatsApp number;</li>
            <li>your message, if you write one;</li>
            <li>which project and document you asked about, and when.</li>
          </ul>
          <p className="mt-3">
            To stop automated spam, your IP address is used to limit how many enquiries can be sent in a short
            time. It is held briefly in the server&apos;s memory and is not saved with your enquiry.
          </p>
        </section>

        <section>
          <h2>How we use it</h2>
          <p>
            Only to answer your enquiry: to contact you about the projects you asked about, send you the documents
            you requested, and follow up on your interest. We don&apos;t sell your details.
          </p>
        </section>

        <section>
          <h2>Where it goes</h2>
          <ul>
            <li>Your enquiry is stored in our database on the server that runs this website.</li>
            <li>A copy is emailed to our sales team, using Google&apos;s Gmail service.</li>
            <li>
              If you message us on WhatsApp, that conversation is handled by WhatsApp (Meta) under its own privacy
              policy.
            </li>
            {TURNSTILE_ON && (
              <li>
                Our forms use Cloudflare Turnstile to tell people from bots. It checks information about your browser
                and connection when a form loads.
              </li>
            )}
          </ul>
        </section>

        {ANALYTICS_ON && (
          <section>
            <h2>Analytics and cookies</h2>
            <p>
              We use Google Analytics to understand how the site is used — for example which pages are visited, and
              when an enquiry form is sent or a WhatsApp or email link is clicked. Google Analytics sets cookies in
              your browser to do this. It doesn&apos;t receive the details you type into our forms.
            </p>
          </section>
        )}

        <section>
          <h2>How long we keep it</h2>
          <p>
            We keep enquiry details for as long as we need them to follow up on your enquiry and to meet our legal
            obligations, and then delete them. You can ask us to delete them sooner at any time.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            You can ask us what personal data we hold about you, and ask us to correct it, delete it, or stop using
            it to contact you. Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-gold-deep)] underline">
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll respond as soon as we can. We handle personal data in line with the UAE&apos;s Federal
            Decree-Law No. 45 of 2021 on the Protection of Personal Data.
          </p>
        </section>
      </article>
    </>
  );
}

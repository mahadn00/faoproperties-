import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SetHtmlLang from "@/components/SetHtmlLang";
import { dictionary } from "@/lib/i18n/dictionary";

export default function SerbianMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = dictionary.sr;
  return (
    <>
      <SetHtmlLang lang="sr-Latn-RS" />
      <Header locale="sr" />
      <main className="flex-1">{children}</main>
      <Footer locale="sr" />
      <WhatsAppButton message={t.whatsapp.defaultMessage} ariaLabel={t.whatsapp.ariaLabel} />
    </>
  );
}

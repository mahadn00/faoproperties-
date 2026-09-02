import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SetHtmlLang from "@/components/SetHtmlLang";
import { dictionary } from "@/lib/i18n/dictionary";

export default function TurkishMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = dictionary.tr;
  return (
    <>
      <SetHtmlLang lang="tr" />
      <Header locale="tr" />
      <main className="flex-1">{children}</main>
      <Footer locale="tr" />
      <WhatsAppButton message={t.whatsapp.defaultMessage} ariaLabel={t.whatsapp.ariaLabel} />
    </>
  );
}

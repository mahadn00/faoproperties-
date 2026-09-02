import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SetHtmlLang from "@/components/SetHtmlLang";
import { dictionary } from "@/lib/i18n/dictionary";

export default function ArabicMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = dictionary.ar;
  return (
    <>
      <SetHtmlLang lang="ar" dir="rtl" />
      <Header locale="ar" />
      <main className="flex-1">{children}</main>
      <Footer locale="ar" />
      <WhatsAppButton message={t.whatsapp.defaultMessage} ariaLabel={t.whatsapp.ariaLabel} />
    </>
  );
}

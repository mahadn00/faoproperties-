import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SetHtmlLang from "@/components/SetHtmlLang";
import { dictionary } from "@/lib/i18n/dictionary";

export default function PersianMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = dictionary.fa;
  return (
    <>
      <SetHtmlLang lang="fa" dir="rtl" />
      <Header locale="fa" />
      <main className="flex-1">{children}</main>
      <Footer locale="fa" />
      <WhatsAppButton message={t.whatsapp.defaultMessage} ariaLabel={t.whatsapp.ariaLabel} />
    </>
  );
}

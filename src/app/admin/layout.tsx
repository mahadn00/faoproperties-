import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Admin | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text-on-dark)]">
      {children}
    </div>
  );
}

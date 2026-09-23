import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Admin | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

// A root layout of its own: the public site's root layout lives under
// app/[locale], and the admin area isn't localized.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text-on-dark)]">
        {children}
      </body>
    </html>
  );
}

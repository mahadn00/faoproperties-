// Thin wrapper over GA4's gtag(). A no-op unless NEXT_PUBLIC_GA_ID is set (see
// components/Analytics.tsx), so callers never need to check.

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function track(event: string, params?: Record<string, string | number | undefined>) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag?: Gtag }).gtag?.("event", event, params);
}

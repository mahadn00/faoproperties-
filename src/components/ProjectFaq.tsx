import type { FaqItem } from "@/lib/seo";

// Renders as plain visible text (not an accordion) on purpose — the
// FAQPage JSON-LD emitted alongside this component must match what's
// actually visible on the page, and this content is exactly what AI answer
// engines and Google's AI Overviews are most likely to lift and cite.
export default function ProjectFaq({ heading, items }: { heading: string; items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">{heading}</h2>
      <div className="rule-gold mt-4 mb-6" />
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.question}>
            <h3 className="text-base font-medium text-[var(--color-text)]">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

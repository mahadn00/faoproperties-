import { ExternalLink } from "lucide-react";
import type { Project } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function MapEmbed({
  location,
  locale = "en",
}: {
  location: Project["location"];
  locale?: Locale;
}) {
  const t = dictionary[locale].map;
  const src = `https://www.google.com/maps?q=${location.embedLat},${location.embedLng}&z=15&output=embed`;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-[var(--color-sand-line)]">
        <iframe
          title="Project location"
          src={src}
          width="100%"
          height="360"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-[var(--color-text-muted)]">
          {location.label}
          {location.approximate ? ` (${t.approximate})` : ""}
        </p>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-deep)] hover:underline"
        >
          {t.openInMaps}
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

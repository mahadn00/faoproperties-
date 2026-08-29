"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { GalleryImage } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function Gallery({
  images,
  locale = "en",
}: {
  images: GalleryImage[];
  locale?: Locale;
}) {
  const t = dictionary[locale].gallery;
  const CATEGORY_LABELS: Record<GalleryImage["category"], string> = {
    exterior: t.categories.exterior,
    interior: t.categories.interior,
    amenity: t.categories.amenity,
    location: t.categories.location,
  };
  const [filter, setFilter] = useState<GalleryImage["category"] | "all">("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const present = new Set(images.map((img) => img.category));
    return (Object.keys(CATEGORY_LABELS) as GalleryImage["category"][]).filter((c) =>
      present.has(c)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, locale]);

  const filtered = useMemo(
    () => (filter === "all" ? images : images.filter((img) => img.category === filter)),
    [images, filter]
  );

  const open = (i: number) => setActiveIndex(i);
  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  const next = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length));

  // Keyboard navigation + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, filtered.length]);

  // Keep the active thumbnail scrolled into view in the lightbox rail.
  useEffect(() => {
    if (activeIndex === null) return;
    const rail = thumbRailRef.current;
    const thumb = rail?.children[activeIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  if (images.length === 0) return null;

  const previewCount = Math.min(5, filtered.length);
  const preview = filtered.slice(0, previewCount);
  const remaining = filtered.length - previewCount;

  const changeFilter = (c: GalleryImage["category"] | "all") => {
    setFilter(c);
  };

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => changeFilter("all")}>
            {t.all} <span className="opacity-60">({images.length})</span>
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => changeFilter(c)}>
              {CATEGORY_LABELS[c]}{" "}
              <span className="opacity-60">
                ({images.filter((img) => img.category === c).length})
              </span>
            </FilterChip>
          ))}
        </div>
      )}

      {/* Desktop / tablet: hero + thumbnail overview grid */}
      <div
        className={`hidden overflow-hidden rounded-2xl bg-[var(--color-sand-line)] md:grid md:h-[480px] md:gap-2 ${gridClass(
          previewCount
        )}`}
      >
        {preview.map((img, i) => {
          const isLast = i === previewCount - 1;
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => open(i)}
              className={`group relative overflow-hidden bg-black/5 ${tileClass(previewCount, i)}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isLast && remaining > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white backdrop-blur-[1px] transition-colors group-hover:bg-black/65">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Expand size={16} />
                    {t.morePhotos(remaining)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {filtered.length > 0 && (
        <button
          type="button"
          onClick={() => open(0)}
          className="mt-3 hidden items-center gap-2 text-sm font-medium text-[var(--color-gold-deep)] hover:underline md:inline-flex"
        >
          <Expand size={15} />
          {t.viewAll(filtered.length)}
        </button>
      )}

      {/* Mobile: swipeable horizontal strip so nothing is ever cramped side by side */}
      <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 md:hidden">
        {filtered.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => open(i)}
            className="relative aspect-[4/3] w-[78%] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-xl bg-black/5"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="80vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && filtered[activeIndex] && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex gap-2 overflow-x-auto">
              {categories.length > 1 && (
                <>
                  <FilterChip
                    dark
                    active={filter === "all"}
                    onClick={() => {
                      changeFilter("all");
                      setActiveIndex(0);
                    }}
                  >
                    {t.all}
                  </FilterChip>
                  {categories.map((c) => (
                    <FilterChip
                      dark
                      key={c}
                      active={filter === c}
                      onClick={() => {
                        changeFilter(c);
                        setActiveIndex(0);
                      }}
                    >
                      {CATEGORY_LABELS[c]}
                    </FilterChip>
                  ))}
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="text-sm tabular-nums text-white/70">
                {activeIndex + 1} / {filtered.length}
              </span>
              <button
                type="button"
                aria-label="Close gallery"
                onClick={close}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div className="relative flex-1 px-2 md:px-4">
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white md:left-4"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="relative mx-auto h-full max-w-5xl">
              <Image
                src={filtered[activeIndex].src}
                alt={filtered[activeIndex].alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white md:right-4"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {filtered[activeIndex].alt && (
            <p className="px-4 pb-2 text-center text-xs text-white/50 md:text-sm">
              {filtered[activeIndex].alt}
            </p>
          )}

          {/* Thumbnail rail */}
          <div
            ref={thumbRailRef}
            className="flex gap-2 overflow-x-auto px-4 pb-4 pt-1 md:px-6"
          >
            {filtered.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2 transition-opacity md:h-16 md:w-24 ${
                  i === activeIndex
                    ? "opacity-100 ring-[var(--color-gold)]"
                    : "opacity-50 ring-transparent hover:opacity-80"
                }`}
              >
                <Image src={img.src} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  dark,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
        dark
          ? active
            ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-ink)]"
            : "border-white/25 text-white/70 hover:border-white/50 hover:text-white"
          : active
            ? "border-[var(--color-gold-deep)] bg-[var(--color-gold-deep)] text-white"
            : "border-[var(--color-sand-line)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-gold-deep)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

// Overview grid layout helpers — chosen so the tile count never leaves an
// awkward empty cell, from a single image up to a 5-photo hero preview.
function gridClass(n: number) {
  if (n <= 1) return "grid-cols-1";
  if (n === 2) return "grid-cols-2";
  if (n === 3) return "grid-cols-3 grid-rows-2";
  if (n === 4) return "grid-cols-2 grid-rows-2";
  return "grid-cols-4 grid-rows-2";
}

function tileClass(n: number, i: number) {
  if (n <= 2) return "";
  if (n === 3) return i === 0 ? "col-span-2 row-span-2" : "";
  if (n === 4) return "";
  // n >= 5: hero + 4
  return i === 0 ? "col-span-2 row-span-2" : "";
}

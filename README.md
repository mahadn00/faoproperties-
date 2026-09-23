# FAO Properties — Luxury Off-Plan Website

Next.js 16 site listing luxury off-plan Dubai projects in 5 languages
(en/sr/tr/ar/fa), with gated brochure/floor-plan downloads, a lead pipeline
(email + database, with Excel export), an admin-only leads dashboard, and a
WhatsApp chat button.

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Required setup before going live

Edit `.env.local` (already gitignored — never commit it):

| Variable | Purpose |
|---|---|
| `SMTP_PASS` | Gmail **App Password** for `SMTP_USER` (mahabdelrauof1979@gmail.com). Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) — requires 2‑Step Verification on that account. Without this, leads are still saved (see `/admin/leads`) but no email is sent. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credentials for `/admin/leads`. Leave blank and the admin page stays inaccessible (safe default). |
| `LEAD_NOTIFY_EMAIL` | Already set to `fao@faoproperties.com`. |
| `SESSION_SECRET` | Already auto-generated. Signs admin sessions and download links — do not share or rotate casually (rotating logs everyone out and invalidates in-flight download links). |
| `NEXT_PUBLIC_SITE_URL` | Already set to `https://faoproperties.com`. Drives the sitemap, canonical/hreflang links and Open Graph URLs — update it first if the real domain ever changes. |
| `NEXT_PUBLIC_GA_ID` | Optional. GA4 measurement ID (`G-…`). Loads Google Analytics and tracks `generate_lead`, `whatsapp_click` and `email_click` events. Blank = no analytics at all. Rebuild after changing. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional. Cloudflare Turnstile keys: adds an invisible bot check to every lead form. Without them the forms still have a honeypot field and a per-IP rate limit. Set both, then rebuild. |
| `GOOGLE_SITE_VERIFICATION` | Blank by default. Paste the verification code from Google Search Console (Settings → Ownership verification → HTML tag → just the `content="..."` value) once you've added the property. |

## How leads work

1. Visitor fills the form on the homepage (`general-enquiry`) or clicks
   **Get Brochure / Get Price List** on a project page (`gated-download`).
2. `POST /api/leads` validates the input, saves the lead to the SQLite
   database `data/leads.db` (auto-created), and emails `LEAD_NOTIFY_EMAIL`
   via Gmail SMTP.
3. For gated downloads, the notification email includes a signed, 7-day
   download link (`/api/documents/[project]/[doc]?token=...`) for the sales
   team to send on. The visitor is told the team will share the file; they
   don't get the link themselves. Files are streamed from disk, so large
   brochures don't load into server memory.
4. All leads (from both entry points) are visible at `/admin/leads`
   after signing in at `/admin/login`. Each lead has a status (New,
   Contacted, Qualified, Won, Lost) the team can change from the table, and
   **Export to Excel** downloads the leads currently in view, respecting
   the date and status filters.

**Upgrading from the Excel version:** the first time this version starts, it
imports every row of an existing `data/leads.xlsx` into `data/leads.db` once,
then leaves the spreadsheet untouched as a backup. Nothing to do by hand.

Spam protection: each IP can submit 8 leads per 10 minutes, a hidden
honeypot field silently discards bot submissions, and Cloudflare Turnstile
kicks in when its keys are set (see above). The admin login allows 10
attempts per IP per 15 minutes.

`data/` (the leads database) and the source PDFs in `protected-documents/` are **not**
in `/public` — they're only reachable through the signed-token route, so
they can't be discovered or downloaded without going through the lead form.

## Content data

All project copy, pricing, amenities, gallery images, and documents are
defined in [`src/lib/projects.ts`](src/lib/projects.ts) — edit that file to
update copy, prices, or add a new project (drop assets into
`public/projects/<slug>/` and `protected-documents/<slug>/`, then also
register the document filenames in
`src/app/api/documents/[projectSlug]/[docId]/route.ts`).

## Project photos

Photos in `public/projects/<slug>/gallery/` are stored at most 2,560 px on
the long side, as ~80-quality JPEGs (the originals were print renders of up
to 5,334 px and 2.5 MB). After adding a new project's photos, run:

```bash
npm run images:optimize
```

It only touches photos that are oversized or heavy, so re-running is safe
(`-- --dry` to preview). The site serves resized WebP versions through
`next/image`, cached for 31 days. **When replacing a photo, give the new file
a new name** — the same name keeps serving the cached old version until the
cache expires.

For production, put the site behind a CDN such as Cloudflare (orange-cloud
proxy on the domain) so photos and pages are served from edge caches near
visitors instead of the VPS. Make sure the proxy forwards the `Accept` header,
which `next/image` uses to choose WebP.

## Link-preview images

`public/og/` holds a 1200×630, ~120 KB share image per project (plus
`home.jpg`), generated from each project's `heroImage` by
[`scripts/generate-og-images.mjs`](scripts/generate-og-images.mjs). It runs
automatically before every `npm run build` (or on demand with `npm run og`)
and only redoes images whose source changed. The folder is gitignored, so
there's nothing to do by hand when adding a project.

## SEO

The site is fully wired for search-engine indexing:

- **`/sitemap.xml`** and **`/robots.txt`** are generated automatically
  ([`src/app/sitemap.ts`](src/app/sitemap.ts), [`src/app/robots.ts`](src/app/robots.ts))
  from `src/lib/projects.ts` — every project you add is included with no
  extra work. `/admin` and `/api` are disallowed.
- Every page (home + each project, in all 5 locales) has a localized
  `<title>`, meta description, canonical URL, `hreflang` alternates across
  en/sr/tr/ar/fa, Open Graph and Twitter Card tags. See
  [`src/lib/seo.ts`](src/lib/seo.ts) for the shared helpers, and
  `dictionary.<locale>.meta` in
  [`src/lib/i18n/dictionary.ts`](src/lib/i18n/dictionary.ts) for the
  homepage copy.
- JSON-LD structured data: a site-wide `RealEstateAgent` block (root
  layout) plus an `ApartmentComplex`/`Offer`, a `BreadcrumbList` and a
  `FAQPage` block on every project page.

### GEO (showing up in ChatGPT, Perplexity, Google AI Overviews, etc.)

AI answer engines mostly reuse the same crawlability signals as classic SEO
(sitemap, robots, structured data), plus two things aimed at them
specifically:

- **A visible FAQ section on every project page** ("What is the starting
  price of X?", location, unit types, developer, handover, payment plan —
  built from whatever fields that project actually has in `projects.ts`,
  see `projectFaqs()` in [`src/lib/seo.ts`](src/lib/seo.ts)), paired with
  matching `FAQPage` JSON-LD. It's rendered as plain visible text on
  purpose — structured data has to match what's actually on the page, and
  direct Q&A is exactly the format these engines like to quote.
- **`/llms.txt`** ([`src/app/llms.txt/route.ts`](src/app/llms.txt/route.ts)) —
  an emerging (unofficial) convention some AI crawlers check for a clean,
  plain-text summary of the site: what the business is, contact info, and
  a list of every project with its price/developer/community. Regenerated
  from `projects.ts` on every request, so it never goes stale.
- `robots.txt`'s `Allow: /` for `User-Agent: *` already covers AI crawlers
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) — nothing
  blocks them.

**Manual steps to actually show up in Google** (code can't do these for you):

1. Verify the domain in [Google Search Console](https://search.google.com/search-console),
   then submit `https://faoproperties.com/sitemap.xml`. Either use the "HTML
   tag" method and paste the code into `GOOGLE_SITE_VERIFICATION` above, or
   verify via DNS.
2. Create/claim a **Google Business Profile** for the Dubai office (i Rise
   Tower, TECOM) — this is what actually gets a real estate agency to show
   up on Google Maps and local "near me" searches, and code alone can't do
   it.
3. Submit the sitemap to [Bing Webmaster Tools](https://www.bing.com/webmasters) too.
4. Once real backlinks/citations exist (property portals, social profiles),
   add them to `sameAs` in the `organizationJsonLd()` helper in `seo.ts`.
5. Keep an eye on Core Web Vitals in Search Console — the gallery images are
   already served through `next/image`, but a persistent host with a CDN in
   front of it will help real-world load times more than any further code
   change here.

## Known open items

- **Sky Level 1 map pin is an approximate District 11/JVC community
  location**, not the exact plot — no address was in the source
  materials. Update `location.embedLat/embedLng` in `projects.ts` once
  you have the precise pin.
- **Brand name "FAO Properties"** was inferred from the lead email
  domain — update `SITE_NAME` in `src/lib/constants.ts` if that's not
  the intended site brand (and swap in a real logo/favicon).
- Neither project's source materials included dimensioned per-unit
  floor-plan drawings, so no "unit layout" section was built — add one
  in `projects.ts` + the project page if you obtain those later.

## Deployment

Built for a **persistent Node.js host** (not serverless) — e.g. a VPS,
Railway, or Render — because leads are stored in a local SQLite file
(`data/leads.db`) that needs to persist across requests and deploys.

```bash
npm run build
npm run start
```

Set the same environment variables on the host. Back up `data/leads.db`
regularly — it's the only copy of your leads. The database runs in WAL mode,
so either copy `leads.db`, `leads.db-wal` and `leads.db-shm` together while
the app is stopped, or take a live snapshot with
`sqlite3 data/leads.db ".backup 'leads-backup.db'"`. (The admin page's
Export to Excel is handy for a quick copy too, but it isn't a full backup.)

### Git & GitHub

`protected-documents/` is **gitignored on purpose** — those PDFs are only
supposed to be reachable through the signed lead-capture download link, so
committing them to a repo (especially a public one) would let anyone bypass
the lead form and grab them directly. Several of the source files are also
well over GitHub's 100MB per-file limit. When you deploy to a real host,
copy `protected-documents/` there separately (scp/sftp/rsync) — it's not
part of the git history and never will be.

`data/` (the leads database) is gitignored for the same reason (customer
PII) plus it's created at runtime.

Everything else — the app code and `public/` (the gallery images actually
shown on the live site) — is meant to be committed and deployed normally.+

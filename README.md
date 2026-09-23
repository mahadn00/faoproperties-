# FAO Properties — Luxury Off-Plan Website

Next.js 16 site listing two luxury off-plan Dubai projects (**Eltiera Views**,
**Sky Level 1**), with gated brochure/floor-plan downloads, a lead pipeline
(email + Excel), an admin-only leads dashboard, and a WhatsApp chat button.

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
| `SMTP_PASS` | Gmail **App Password** for `SMTP_USER` (mahabdelrauof1979@gmail.com). Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) — requires 2‑Step Verification on that account. Without this, leads still save to Excel but no email is sent. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credentials for `/admin/leads`. Leave blank and the admin page stays inaccessible (safe default). |
| `LEAD_NOTIFY_EMAIL` | Already set to `fao@faoproperties.com`. |
| `SESSION_SECRET` | Already auto-generated. Signs admin sessions and download links — do not share or rotate casually (rotating logs everyone out and invalidates in-flight download links). |
| `NEXT_PUBLIC_SITE_URL` | Already set to `https://faoproperties.com`. Drives the sitemap, canonical/hreflang links and Open Graph URLs — update it first if the real domain ever changes. |
| `GOOGLE_SITE_VERIFICATION` | Blank by default. Paste the verification code from Google Search Console (Settings → Ownership verification → HTML tag → just the `content="..."` value) once you've added the property. |

## How leads work

1. Visitor fills the form on the homepage (`general-enquiry`) or clicks
   **Get Brochure / Get Price List** on a project page (`gated-download`).
2. `POST /api/leads` validates the input, appends a row to
   `data/leads.xlsx` (auto-created), and emails `LEAD_NOTIFY_EMAIL` via
   Gmail SMTP.
3. For gated downloads, the response includes a signed, 15-minute
   download link (`/api/documents/[project]/[doc]?token=...`) which the
   browser opens automatically.
4. All leads (from both entry points) are visible at `/admin/leads`
   after signing in at `/admin/login`.

`data/leads.xlsx` and the source PDFs in `protected-documents/` are **not**
in `/public` — they're only reachable through the signed-token route, so
they can't be discovered or downloaded without going through the lead form.

## Content data

All project copy, pricing, amenities, gallery images, and documents are
defined in [`src/lib/projects.ts`](src/lib/projects.ts) — edit that file to
update copy, prices, or add a new project (drop assets into
`public/projects/<slug>/` and `protected-documents/<slug>/`, then also
register the document filenames in
`src/app/api/documents/[projectSlug]/[docId]/route.ts`).

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
Railway, or Render — because leads are stored in a real file
(`data/leads.xlsx`) that needs to persist across requests.

```bash
npm run build
npm run start
```

Set the same environment variables on the host. Back up `data/leads.xlsx`
regularly — it's the only copy of your leads.

### Git & GitHub

`protected-documents/` is **gitignored on purpose** — those PDFs are only
supposed to be reachable through the signed lead-capture download link, so
committing them to a repo (especially a public one) would let anyone bypass
the lead form and grab them directly. Several of the source files are also
well over GitHub's 100MB per-file limit. When you deploy to a real host,
copy `protected-documents/` there separately (scp/sftp/rsync) — it's not
part of the git history and never will be.

`data/` (the leads spreadsheet) is gitignored for the same reason (customer
PII) plus it's regenerated at runtime.

Everything else — the app code and `public/` (the gallery images actually
shown on the live site) — is meant to be committed and deployed normally.

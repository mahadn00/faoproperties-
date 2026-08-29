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

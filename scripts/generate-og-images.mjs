// Generates the 1200×630 link-preview images (Open Graph / WhatsApp / X) in
// public/og/ from each project's heroImage, plus one for the homepage.
//
// Runs automatically before `npm run build` (the "prebuild" script). The raw
// hero renders are 1–2 MB and not 1200×630, and WhatsApp in particular tends
// to drop preview images that heavy — these come out at roughly 100–200 KB.
// Only images whose source changed since the last run are regenerated.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "og");

// The homepage hero (see src/app/(marketing)/page.tsx and its locale copies).
const HOME_SOURCE = "/projects/eltiera-views/gallery/01_exterior_aerial_twilight.jpg";

// projects.ts is TypeScript, so rather than importing it, pair each project's
// `slug` with the `heroImage` that follows it in the file.
function readProjectHeroes() {
  const source = fs.readFileSync(path.join(root, "src", "lib", "projects.ts"), "utf8");
  const pattern = /^ {4}(slug|heroImage): "([^"]+)"/gm;
  const heroes = [];
  let slug = null;
  for (const [, key, value] of source.matchAll(pattern)) {
    if (key === "slug") slug = value;
    else if (slug) {
      heroes.push({ slug, src: value });
      slug = null;
    }
  }
  if (heroes.length === 0) throw new Error("No projects found in src/lib/projects.ts");
  return heroes;
}

async function generate({ slug, src }) {
  const input = path.join(root, "public", src);
  const output = path.join(outDir, `${slug}.jpg`);
  if (!fs.existsSync(input)) throw new Error(`Hero image for "${slug}" not found: public${src}`);
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) return false;

  await sharp(input)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(output);
  return true;
}

fs.mkdirSync(outDir, { recursive: true });
const jobs = [{ slug: "home", src: HOME_SOURCE }, ...readProjectHeroes()];
const results = await Promise.all(jobs.map(generate));
const made = results.filter(Boolean).length;
console.log(`og images: ${made} generated, ${jobs.length - made} up to date (public/og/)`);

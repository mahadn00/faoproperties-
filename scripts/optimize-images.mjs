// One-off (re-runnable) shrink of the project photos in public/projects/.
//
// The originals were print-resolution renders — up to 5,334 px wide, ~780 KB
// on average, 98 of them over 1 MB — which Next's image optimizer then had to
// decode and resize on the server the first time each one was viewed. This
// caps the longest side at 2,560 px (larger than any size the site asks
// for) and re-encodes as high-quality progressive JPEG. Files that are already
// small, or wouldn't shrink by at least 10%, are left untouched, so running it
// again (e.g. after adding a new project) only touches the new photos.
//
//   npm run images:optimize            # rewrite in place
//   npm run images:optimize -- --dry   # just report what would change

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "projects");
const MAX_EDGE = 2560;
const MIN_BYTES = 400 * 1024; // below this, only resize if oversized
const DRY_RUN = process.argv.includes("--dry");

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.jpe?g$/i.test(entry.name)) yield full;
  }
}

let seen = 0, changed = 0, before = 0, after = 0;

for (const file of walk(ROOT)) {
  seen += 1;
  const input = fs.readFileSync(file);
  const { width = 0, height = 0 } = await sharp(input).metadata();
  const oversized = Math.max(width, height) > MAX_EDGE;
  if (!oversized && input.length < MIN_BYTES) continue;

  const output = await sharp(input)
    .rotate() // apply EXIF orientation before it's stripped
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  if (output.length > input.length * 0.9) continue;

  changed += 1;
  before += input.length;
  after += output.length;
  if (!DRY_RUN) fs.writeFileSync(file, output);
}

const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
console.log(
  `${DRY_RUN ? "[dry run] " : ""}${changed} of ${seen} photos ${DRY_RUN ? "would be" : ""} shrunk: ${mb(before)} -> ${mb(after)}`
);

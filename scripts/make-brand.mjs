// Derives the site's brand assets from the supplied Feels artwork.
//
// The originals are five 4167px squares with the mark floating inside a lot of
// empty canvas, so every cut here is trimmed to its own ink before it is
// resized. Run `node scripts/make-brand.mjs [source-dir]`; the default source
// is the delivered "FEELS LOGO" folder.
//
//   01  lockup, dark wordmark   -> public/brand/feels-lockup.png
//   02  lockup, light wordmark  -> public/brand/feels-lockup-light.png
//   03  glyph, gradient         -> public/brand/feels-glyph.png, app/icon.png,
//                                  app/apple-icon.png
//   04  glyph, white            -> unused (kept in the source folder)
//   05  glyph, black            -> unused (kept in the source folder)
//
// sharp ships with Next, so there is nothing extra to install.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const sharp = createRequire(import.meta.url)("sharp");

const SRC = process.argv[2] ?? "/Users/varunchaudhary/Downloads/FEELS LOGO";
const root = new URL("..", import.meta.url).pathname;
const brand = join(root, "public/brand");
mkdirSync(brand, { recursive: true });

const src = (n) => join(SRC, `FEELS LOGO-${n}.png`);
/** Trim the empty canvas away, then fit the mark into `w` x `h`. */
const cut = (n) => sharp(src(n)).trim({ threshold: 1 });

// Lockups, sized for a 28px-tall header mark on a 3x screen.
await cut("01").resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(join(brand, "feels-lockup.png"));
await cut("02").resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(join(brand, "feels-lockup-light.png"));

// Glyph on its own, for the hero and anywhere the lockup is too wide.
await cut("03").resize({ height: 640 }).png({ compressionLevel: 9 }).toFile(join(brand, "feels-glyph.png"));

// Browser tab: the glyph centred in a square with a little air around it.
const square = async (size, pad, background) =>
  sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: await cut("03").resize({ height: size - pad * 2 }).toBuffer() }])
    .png({ compressionLevel: 9 });

await (await square(512, 56, { r: 0, g: 0, b: 0, alpha: 0 })).toFile(join(root, "app/icon.png"));
// Home-screen icons are composited on whatever the OS picks, so this one is
// flattened onto the page's own white.
await (await square(180, 24, "#ffffff")).toFile(join(root, "app/apple-icon.png"));

console.log("brand assets written");

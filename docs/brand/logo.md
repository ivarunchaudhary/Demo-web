# Logo and mark

Feels has two elements: a **wordmark** set in the display serif, and a **seal
glyph** used as a secondary mark. Both live in `components/Wordmark.tsx`.

## The wordmark

The word *Feels*, set in the serif display face at weight 500, tightly tracked.
It is type, not a drawn logotype — it inherits the `.display` class.

| Property | Value |
| --- | --- |
| Face | `--font-serif` — GT Super Text, falling back to Newsreader |
| Weight | 500 |
| Tracking | `-0.03em` |
| Line height | 1 (`leading-none`) |
| Header size | 26px |
| Colour | `--ink` `#101010` |
| Capitalisation | Sentence case — **Feels**, never FEELS or feels |

Because it is live type, a designer redrawing it must match Newsreader's
proportions unless the licensed GT Super Text is available.

## The seal glyph

An oval seal containing a rising signal — two concentric ellipses, a vertical
stem, four leaf strokes, two ground curves, and a single filled dot at the top.

| Property | Value |
| --- | --- |
| Source | `Glyph` in `components/Wordmark.tsx` |
| viewBox | `0 0 84 108` |
| Aspect | Height = width x 1.28 — **it is not square** |
| Default size | 84 wide; used at 48 in the footer |
| Stroke | `currentColor` (inherits `--ink`), width `1.6`, round caps |
| Inner ellipse | `stroke-opacity: .5` |
| Ground curves | `stroke-opacity: .7` |
| The one filled element | `circle` r=3.5 at (42, 28), filled `--yellow` `#e3d27a`, no stroke |

That single yellow dot is the only fill in the mark. It is the accent, and it
should survive every redraw.

## Placement in the product

| Location | Treatment |
| --- | --- |
| `SiteHeader` | Wordmark alone, left of the nav, in an 88px-tall bar |
| `SiteFooter` | Glyph at 48px, 24px of space beneath it (`mb-6`), then the wordmark |

## Clear space and minimum size

These are **not yet enforced in code** — they are the recommendation to
ratify with your designer:

* **Clear space:** on all sides, equal to the cap height of the wordmark
  (approximately 0.7x the type size). At 26px that is ~18px.
* **Minimum wordmark size:** 20px. Below that the -0.03em tracking closes up.
* **Minimum glyph size:** 32px wide. The 1.6px stroke and the inner ellipse's
  50% opacity break down smaller; below 32px, supply a simplified single-ellipse
  variant rather than scaling this one.

## Misuse

Do not:

* Stretch the glyph to square — the 84:108 ratio is fixed.
* Recolour the yellow dot. It is the only accent in the mark.
* Set the wordmark in the sans face, in italic, or in all caps.
* Place the wordmark on `--moss`, `--deep-forest` or `--code-bg` in `--ink`;
  on dark panels it takes `--lt` `#fff9e4`.
* Add a shadow, outline, gradient or container to either element.
* Use a status colour (`--green` / `--warn` / `--orange`) on the mark. Those
  four hues mean something specific and must not appear decoratively.

## Assets

There is currently **no exported logo file.** Both elements exist only as JSX
in `components/Wordmark.tsx`; `public/art/` holds only the two generated
botanical SVGs.

Before a designer can work, someone needs to export from that component:
`feels-wordmark.svg`, `feels-glyph.svg`, plus light-on-dark variants — and the
favicon (`app/favicon.ico`) should be regenerated from the glyph.

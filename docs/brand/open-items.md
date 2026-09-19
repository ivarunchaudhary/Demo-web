---
description: What is unresolved, unexported or unaudited before design work can start.
---

# Open items

The rest of this section documents what is **implemented**. This page documents
what is **missing**. Read it first if you are picking up design work.

## 1. Provenance — unresolved

The palette, type scale and section furniture were mirrored from
**grove.finance**. This is stated in the source, not inferred:

| File | What it says |
| --- | --- |
| `app/globals.css` | `/* Palette: the grove.finance token set. */` |
| `app/globals.css` | `/* Type scale, mirrored from grove.finance's computed styles. */` |
| `app/globals.css` | `/* Section furniture lifted from grove.finance's home page. */` |
| `app/globals.css` | Named components reference grove directly — "as grove's article tags", "as grove's TVL block", "as grove's *Stake your GROVE*", "as grove's *About us*", "as grove's table rows" |
| `app/layout.tsx` | "grove.finance is set in Söhne, GT Super Text and Söhne Mono" |
| `components/SiteHeader.tsx` | "exactly as on grove.finance" |
| `components/Wordmark.tsx` | "drawn in Grove's yellow" |

**Consequence.** The current visual language is not original, cleared brand IP.
Anything shipped publicly — and certainly a logo built to sit inside this
system — should go through an originality review first.

**Decision needed:** keep and differentiate, or rebuild the visual language on
an original foundation. That choice changes the entire brief, so make it before
any logo work begins.

- [ ] Originality review of palette, type scale and section furniture
- [ ] Decide: differentiate in place, or rebuild
- [ ] Strip grove references from source comments once resolved

## 2. No exported brand assets

Both logo elements exist **only as JSX** in `components/Wordmark.tsx`. There is
no design file and no exported artwork. `public/art/` contains only the two
generated botanical SVGs.

A designer cannot open anything today. Someone needs to produce:

- [ ] `feels-wordmark.svg` — outlined, ink
- [ ] `feels-wordmark-light.svg` — for `--moss` / `--deep-forest` / `--code-bg`
- [ ] `feels-glyph.svg` — 84x108, stroke `--ink`, dot `--yellow`
- [ ] `feels-glyph-light.svg`
- [ ] A simplified glyph for use below 32px (see [Logo and mark](logo.md))
- [ ] PNG exports at 1x / 2x / 3x
- [ ] Regenerate `app/favicon.ico` from the glyph — it does not currently derive from it
- [ ] An editable source file (Figma or `.ai`) as the working master

Until this exists, "the logo" is a React component, and every reproduction is a
redraw.

## 3. Licensed fonts are not available

| Role | Licensed face | What actually ships |
| --- | --- | --- |
| Sans | Söhne | Inter |
| Serif | GT Super Text | Newsreader |
| Mono | Söhne Mono | Geist Mono |

The font stacks in `globals.css` list the licensed names first, so they win if
installed — but the files are not in this repo and no licence is recorded.
`layout.tsx` notes that swapping the real files in via `next/font/local` is a
one-line change.

**Design in Inter and Newsreader** unless and until the licences are bought. A
wordmark drawn against GT Super Text's proportions will not match what renders
in production.

- [ ] Decide whether to licence Söhne + GT Super Text, or standardise on the
      open faces and remove the licensed names from the stacks

## 4. Unspecified in code — needs ratifying

These are written as **recommendations** in [Logo and mark](logo.md). Nothing
in the codebase defines them, so they are proposals until your designer signs
off:

| Item | Proposed | Status |
| --- | --- | --- |
| Wordmark clear space | Cap height on all sides (~0.7x type size) | Proposed |
| Minimum wordmark size | 20px | Proposed |
| Minimum glyph size | 32px wide | Proposed |
| Sub-32px glyph treatment | Simplified single-ellipse variant | Does not exist |

- [ ] Ratify or replace each of the above

## 5. Contrast has never been audited

`--warn` `#c9960a` carries a source comment that it is "deep enough to read on
white", which is the only evidence of any contrast consideration in the
codebase. No formal audit has been run.

Pairings that warrant checking against WCAG AA (4.5:1 body text, 3:1 large
text and UI components):

* `--warn` `#c9960a` on `--paper` `#ffffff`
* `--green` `#2f9e4f` on `--paper`
* `--grey` `#8a8f8a` on `--paper` — likely the weakest pairing in the system
* `--ink-60` and below on `--paper-2` / `--cream`
* `--lt-60` on `--moss` `#3e4941`
* `--ink` on `--mist` `#86bdbf` and on `--yellow` `#e3d27a`
* `::selection` — `--paper` text on `--yellow` ground

- [ ] Run a full AA audit across the token set
- [ ] Record results in [Colour](colour.md) and adjust tokens where they fail

## 6. Documentation drift

[Frontend and motion](../architecture/frontend-and-motion.md) lists components
in a flat table, but `SmoothScroll`, `MotionRoot`, `EcoRow`, `Petals`, `Reveal`
and `Parallax` live under `components/motion/`, not `components/`. Minor, but
it will send a designer to the wrong folder.

- [ ] Correct the component paths on that page

## Summary

| # | Blocker | Blocks |
| --- | --- | --- |
| 1 | Provenance unresolved | The whole brief |
| 2 | No exported assets | Any logo or graphics work |
| 3 | Licensed fonts absent | Wordmark drawing |
| 4 | Logo rules unratified | Handoff to third parties |
| 5 | No contrast audit | Accessibility sign-off |
| 6 | Doc drift | Nothing — tidy-up |

Items 1, 2 and 3 are hard blockers. Nothing else in this section is actionable
by an external designer until they are closed.

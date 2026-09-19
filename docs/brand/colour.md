# Colour

Every colour is a CSS custom property in `app/globals.css`, re-exported to
Tailwind 4 through `@theme inline`. **Edit the token, never the component.**

The product is light-only — `html { color-scheme: light }`. There is no dark
theme; dark surfaces are individual panels on a white page.

## Status colours

These four carry the product's meaning. Never use them decoratively.

| Token | Hex | Status | Notes |
| --- | --- | --- | --- |
| `--green` | `#2f9e4f` | `ACTIVE` | No detected issue |
| `--warn` | `#c9960a` | `WARNING` | Deliberately deep enough to read on white |
| `--orange` | `#e04a2a` | `BLOCKED` | Not red — a burnt orange |
| `--grey` | `#8a8f8a` | `UNKNOWN` | Desaturated, slightly green |

Each is applied through a tone class (`.tone-ACTIVE` etc.) that sets a single
`--tone` variable, which then drives the dot, the text and the rule together.

## Grounds and ink

| Token | Value | Job |
| --- | --- | --- |
| `--paper` | `#ffffff` | Page ground |
| `--paper-2` | `#f6f4ec` | Raised, quiet surfaces |
| `--cream` | `#faf5e6` | The ticker band |
| `--ink` | `#101010` | Headings and body |
| `--pure-black` | `#000000` | Reserved |

`--ink` is published at eleven opacities over `rgba(16,16,16, x)`:

| Token | Alpha | Job |
| --- | --- | --- |
| `--ink-80` | 0.80 | |
| `--ink-75` | 0.72 | Eyebrow / label text |
| `--ink-60` | 0.60 | Muted body |
| `--ink-50` | 0.50 | |
| `--ink-40` | 0.40 | Stat-box border |
| `--ink-25` | 0.25 | Secondary rules |
| `--ink-20` | 0.18 | **`--hairline`** — the standard rule |
| `--ink-16` | 0.14 | |
| `--ink-12` | 0.12 | |
| `--ink-10` | 0.10 | |
| `--ink-08` | 0.07 | |
| `--ink-05` | 0.04 | Row hover |

Note the names are nominal, not literal: `--ink-20` is 18% and `--ink-75` is 72%.

## Light ink, for dark panels

| Token | Value |
| --- | --- |
| `--lt` | `#fff9e4` |
| `--lt-80` | `rgba(255, 249, 228, 0.8)` |
| `--lt-60` | `rgba(255, 249, 228, 0.6)` |
| `--lt-16` | `rgba(255, 249, 228, 0.16)` |

Text on `--moss`, `--deep-forest` and `--code-bg` is `--lt` — a warm ivory,
never pure white.

## Accents and surfaces

| Token | Hex | Job |
| --- | --- | --- |
| `--yellow` | `#e3d27a` | The accent: primary button, link underline, tab indicator, selection, the glyph dot |
| `--yellow-51` | `rgba(227,210,122,0.51)` | |
| `--moss` | `#3e4941` | Dark panel surface, secondary button |
| `--deep-forest` | `#222d24` | Deepest green |
| `--code-bg` | `#1a1e20` | Code blocks |
| `--mist` | `#86bdbf` | The call-to-action card |
| `--sage` | `#4f7d58` | "Verified", focus ring, list bullets |
| `--sage-20` / `--sage-15` | 0.2 / 0.15 alpha | |
| `--sand` | `#c3b7a1` | |
| `--sakura` | `#f48aa6` | Falling petals only |

Hover states are hardcoded darker siblings, not tokens: primary button
`#d9c65e`, secondary `#4b5850`, mist CTA `#95c9cb`.

## Rules

1. **Yellow is the only accent.** One per view — the primary action.
2. **Status hues are reserved.** A chart, icon or illustration must not use
   `#2f9e4f`, `#c9960a`, `#e04a2a` or `#8a8f8a` for non-status meaning.
3. **Borders are hairlines.** `1px solid var(--hairline)` at 18% ink. Heavier
   rules (`--ink-25`, `--ink-40`) are reserved for the stat and contract boxes.
4. **Warm, not neutral.** Off-whites are cream-shifted (`#f6f4ec`, `#faf5e6`,
   `#fff9e4`). Never use a cool or pure grey ground.
5. **Focus is sage.** `2px solid var(--sage)` at `3px` offset. Do not restyle it.

## Contrast

`--warn` `#c9960a` is noted in the source as chosen to be "deep enough to read
on white". Any new colour pairing should be checked to WCAG AA (4.5:1 body,
3:1 for large text and UI). This has not been formally audited — worth doing
as part of the brand pass.

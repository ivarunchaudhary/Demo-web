# Typography

Three faces: a neutral grotesk for interface text, a high-contrast serif for
display, and a mono for code and values.

## The faces

| Role | Licensed face | Open fallback (shipped) | Token |
| --- | --- | --- | --- |
| Sans | Söhne | **Inter** | `--font-sans` |
| Serif | GT Super Text | **Newsreader** (optical-size axis, normal + italic) | `--font-serif` |
| Mono | Söhne Mono | **Geist Mono** | `--font-mono` |

The licensed names are listed first in each font stack, so they win if
installed or self-hosted; the open faces loaded in `app/layout.tsx` stand in
otherwise. Swapping in the real files is a one-line change to `next/font/local`.

{% hint style="info" %}
Söhne and GT Super Text are **licensed and not included in this repo.** Design
work should be done in Inter and Newsreader unless the licence has been bought.
{% endhint %}

## Base

```
font-family: var(--font-sans);
font-size: 16px;
line-height: 1.5;
letter-spacing: 0.01em;
-webkit-font-smoothing: antialiased;
text-rendering: optimizeLegibility;
```

## The scale

Every class below is defined in `app/globals.css`.

| Class | Face | Size / line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| `.display` | serif | inherited / 1.1 | 500 | `-0.035em` | Headings |
| `.display-lg` | serif | / 1.15 | 500 | `-0.046em` | Largest headings |
| `.display-italic` | serif italic | / 1.2 | 400 | `-0.02em` | Card titles, footer headings, counters |
| `.eyebrow` | sans | 10px / 31px | 700 | `5px` | Uppercase section kickers |
| `.label` | sans | 12px / 31px | 700 | `2px` | Uppercase buttons and small labels |
| `.lead` | sans | 18px / 1.55 → 20px / 31px at 768px | 400 | `0.45px` | Lead paragraph beside a heading |
| `.body-md` | sans | 16px / 32px | 400 | `0.45px` | Body |
| `.body-sm` | sans | 14px / 1.4 | 400 | `0` | Small body |
| `.link-nav` | sans | 17px / 31px → 20px at 1280px | 400 | `0.45px` | Nav links |
| `.stat-figure` | serif | 56px / 1 | 500 | `-0.03em` | Hero figures, tabular lining numerals |
| `.stat-label` | sans | 10px | 700 | `4px` | Uppercase, under a figure |
| `.pill` | serif italic | 12px / 1.4 | 500 | — | Category tags |
| `.code-panel` | mono | 13px / 1.6 | 400 | — | Code blocks |

Component-level sizes worth knowing: the eco-tile word is serif italic 40px at
`-0.03em` (34px on phones); `.eco-panel h3` is serif italic 32px / 35px at
`-1px`; `.usecase-title` is 22px / 1.25 at `-0.01em`.

## Rules

1. **The serif is for display only** — headings, figures, card titles, pills.
   Never for body copy.
2. **Italic serif is a real voice here**, not emphasis. It marks titles,
   counters, section labels and the tile words.
3. **Tracking is inverted by size.** Display tightens (`-0.02em` to `-0.046em`);
   small uppercase text opens dramatically (`2px`, `4px`, `5px`). A 10px
   eyebrow at 5px tracking is correct, not a bug.
4. **Uppercase only at 10–12px**, always at weight 700, always tracked.
   Never set a heading in caps.
5. **Numbers that change use mono or tabular figures.** `.stat-figure` sets
   `font-variant-numeric: lining-nums tabular-nums`; status values in the eco
   readout use `--font-mono` at 12px.
6. **Body line height is generous** — 32px over 16px. Keep the air.

## Links

Text links are ink with a **2px yellow underline** at `4px` offset, which turns
ink on hover (150ms). The underline is the link's identity — do not replace it
with a colour change.

# Illustration and motion

## The botanical system

The only illustration in Feels is a pair of botanical branches behind the hero:
`public/art/botanical-left.svg` and `botanical-right.svg`. They are **generated,
not drawn** — `scripts/make-botanical.mjs` produces them deterministically from
a seeded random number generator and bezier maths.

```bash
node scripts/make-botanical.mjs
```

Regenerate; never hand-edit the output SVGs.

### What's in them

Cherry boughs, pink Japanese maple (momiji), ginkgo fans and green leaves. Each
leaf, blossom and fan is wrapped in its own group with an embedded CSS sway
animation — so the art moves even inside an `<img>` tag — plus a few loose
petals drifting on a loop.

### Illustration palette

The art has its own palette, separate from the UI tokens. It is generated with
per-leaf linear gradients, so these are the stops, not flat fills:

| Family | Colours |
| --- | --- |
| Green leaf | `#9ccc6f` → `#5c9447` → `#22462a`, outline `#11261a` |
| Leaf ribs / veins | `#e3edb0` at 62%, `#dbe8a6` at 34% |
| Blossom pinks | `#ffe1ea` `#ffd9e0` `#ffd0dc` `#f7a6bd` `#f48aa6` |
| Maple reds | `#e9748f` `#e86a8c` `#d94b6b` `#c9405f` `#c2405f` `#a83a58` `#8e2038` `#7a2140` |
| Ginkgo yellows | `#fff6c2` `#f4d35e` `#f3e7a3` `#f1e29a` `#e2cf68` `#b8a066` `#6b5a15` |
| Wood / stems | `#3b2a26` `#8a6b5a` `#4a3a20` |
| Other greens | `#b6c25a` `#6b8f4e` `#2f4d26` |

Note that none of the four status hues appear here. That is deliberate — see
[Colour](colour.md).

### How it's placed

`components/Botanical.tsx` positions the branches far outside the viewport
(`left: -340px`, `right: -260px`) at large sizes (up to 1240x960), so only a
portion of each bough is visible. A gradient **veil** (`.veil`) fades the top
and bottom edges to `--paper` while leaving the middle at 22% opacity, so the
foliage stays vivid where it meets the copy.

`variant="asset"` shows only the right-hand branch, at 80% opacity.

Loose petals (`.petal`, 14x14, coloured `--sakura` `#f48aa6`) fall through the
hero — 12 on the home page, 7 on an asset page.

### Rules for new artwork

1. **Seasonal and botanical**, drawn in a naturalistic line-and-gradient style
   with visible ribs and veins. Not flat vector, not geometric abstraction.
2. **It sits behind, never beside.** Illustration is a backdrop at z-0 under a
   veil — it is never a foreground element or a spot illustration in a row.
3. **Never carry information.** All art is `aria-hidden` / `alt=""`. If a
   graphic needs to say something, it is a component, not an illustration.
4. **Avoid the status hues.** Keep to the palette above.
5. **Bleed off the canvas.** Boughs are cropped hard by the viewport edge; a
   fully contained, centred illustration is off-brand.

## Motion

Motion is part of the design, not a finishing touch. Two client components wrap
the app, and animations are declared in markup by data attribute — the full
list is in [Frontend and motion](../architecture/frontend-and-motion.md).

For design purposes, the governing characteristics are:

| Property | Value |
| --- | --- |
| Scroll | Lenis, `lerp: 0.09`, driven by GSAP's ticker |
| Standard easing | `cubic-bezier(0.25, 1, 0.5, 1)` |
| Slow reveal easing | `cubic-bezier(0.32, 0.72, 0, 1)` over 700ms |
| Micro-transitions | 150ms ease (colour), 200ms (background), 300ms (transform) |
| Ambient sway | 18s / 26s loops, ±8px and ±0.7° |
| Marquee | 40s linear, masked 120px at each edge |
| Status dot pulse | 2.4s ease-in-out, a growing ring at 22% → 8% tone |

**Everything degrades.** Under `prefers-reduced-motion: reduce`, Lenis is
skipped entirely, all animation is disabled, every transition collapses to
0.01ms, petals are removed, and animated elements are simply shown in place.
Content never depends on motion to become visible — hold any new motion design
to the same standard.

## Shape language

| Element | Radius |
| --- | --- |
| Cards, eco tiles, panels, CTA | `4px` |
| Buttons, feature card, favicon-scale shapes | `8px` |
| Code panel | `6px` |
| Copy button | `6px` |
| Pills, dots, arrows, bullets | `999px` (full round) |

Buttons are 44px tall (36px small), `6px 24px` padding. The only shadow in the
system is the card's `0 12px 32px -16px rgba(16,16,16,0.25)` — a soft lift, not
a drop shadow. Backdrop blur appears at `8px` (stat and contract boxes) and
`12px` (the scrolled header bar).

The page grid is `.wrap`: max-width **1336px**, 24px side padding, 40px from
768px up.

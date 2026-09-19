---
description: What Feels looks and sounds like, and the rules a new asset has to follow.
---

# Brand overview

This section is the design reference for Feels. It documents what is actually
implemented in `app/globals.css`, `app/layout.tsx` and `components/`, so a
designer can produce a logo, an icon set or a piece of marketing art that sits
correctly beside the product.

{% hint style="warning" %}
**Provenance.** The palette, type scale and section furniture were mirrored
from **grove.finance** — `globals.css` calls the palette "the grove.finance
token set" and the display faces are stand-ins for grove's licensed Söhne and
GT Super Text. Treat this as a spec of the current build, not as cleared,
original brand IP. Anything shipped publicly should be reviewed for
originality first. The full picture is in [Open items](open-items.md).
{% endhint %}

## The personality

Feels is **status infrastructure, deliberately narrow**. It answers one
question — what operational state is this Stock Token in? — and attaches a
source and a timestamp to every claim. That restraint is the brand.

| It is | It is not |
| --- | --- |
| Editorial, archival, print-like | Dashboard-chrome, neon, "fintech dark mode" |
| Charcoal on ivory, hairline rules | Heavy borders, drop shadows, glassmorphism |
| Quiet by default; colour is meaning | Colour as decoration |
| Botanical, seasonal, hand-drawn | Geometric abstract 3D, gradient blobs |
| Precise, unhedged, sourced | Promotional, predictive, advisory |

A useful one-line brief: **a field guide, not a trading terminal.**

## Colour is never decorative

Four status colours carry the product's entire meaning — `--green` ACTIVE,
`--warn` WARNING, `--orange` BLOCKED, `--grey` UNKNOWN. Any new graphic must
avoid using those four hues for anything that is not a status, or the graphic
will read as a false signal. See [Colour](colour.md).

## Pages

* [Logo and mark](logo.md) — the wordmark, the seal glyph, clear space, misuse.
* [Colour](colour.md) — every token with its hex value and its job.
* [Typography](typography.md) — faces, the full scale, tracking.
* [Illustration and motion](illustration.md) — the botanical system and its rules.
* [Open items](open-items.md) — **read first**: what is missing, unexported or unaudited.

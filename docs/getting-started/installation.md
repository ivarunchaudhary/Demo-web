# Install and run

## Requirements

* Node.js 20 or newer
* npm

The app is built on **Next.js 16** with React 19, Tailwind CSS 4, GSAP and Lenis.

{% hint style="warning" %}
This Next.js version differs from older releases in APIs and conventions. When changing app code, read the relevant guide under `node_modules/next/dist/docs/` rather than relying on memory of earlier versions. The `AGENTS.md` block at the repo root says the same thing and is re-added automatically by `next dev`.
{% endhint %}

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

## Lint

```bash
npm run lint
```

## Project layout

```
app/
  page.tsx                  home: search, tracked tokens, status legend
  assets/[asset]/page.tsx   per-asset detail page
  api/assets/...            JSON handlers
  globals.css               design tokens and base styles
components/                 UI components
components/motion/          GSAP / Lenis motion layer
lib/
  types.ts                  the data contract
  status.ts                 overall-status derivation
  provider.ts               snapshot + live enrichment
  onchain.ts                minimal JSON-RPC reader
  format.ts                 display helpers
  data/snapshot.ts          recorded provider data
scripts/make-botanical.mjs  generates the footer illustrations
```

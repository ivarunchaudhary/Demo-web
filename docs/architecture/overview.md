# How it fits together

One data path serves both the HTML pages and the JSON API. Nothing renders from a second source of truth.

```
lib/data/snapshot.ts ─┐
                      ├─► lib/provider.ts ─► lib/status.ts ─┬─► app/api/…  (JSON)
lib/onchain.ts ───────┘     (enrich)          (derive)      └─► app/…      (pages)
```

## The layers

**`lib/data/snapshot.ts`** — recorded `AssetRecord[]`. `snapshot()` resets its clock on each call so observation times are always fresh relative to the read.

**`lib/onchain.ts`** — one function, `readPaused(rpcUrl, token)`. A single `eth_call` with a 4-second abort, returning a discriminated union: either `{ ok: true, paused }` or `{ ok: false, reason }`. It cannot throw at the call site.

**`lib/provider.ts`** — the only module the routes import. `enrich()` overlays a live onchain read onto a snapshot record when `ROBINHOOD_CHAIN_RPC_URL` is set. Exposes `listAssets()`, `getAsset(symbol)` and `knownSymbols()`.

**`lib/status.ts`** — pure functions, no I/O. `deriveOverall()` applies the precedence rule, `lastUpdated()` takes the newest observation, `toResponse()` and `toSummary()` shape the output.

**`app/api/assets/_shared.ts`** — `withAsset(params, pick)` resolves the ticker, returns the 404 body if it is untracked, and otherwise applies a projection to the full response. Every section endpoint is three lines because of it:

```ts
export async function GET(_req: Request, ctx: RouteContext<"/api/assets/[asset]/oracle">) {
  return withAsset(ctx.params, (a) => ({ asset: a.asset, oracle_status: a.oracle_status, signal: a.signals.oracle }));
}
```

## Content negotiation

The specification puts the API at `/assets/...`, which is also where the HTML pages live. `next.config.ts` resolves the collision with header-matched rewrites:

```ts
const json = [{ type: "header", key: "accept", value: "(.*application/json.*)" }];
return [
  { source: "/assets",                 has: json, destination: "/api/assets" },
  { source: "/assets/:asset",          has: json, destination: "/api/assets/:asset" },
  { source: "/assets/:asset/:section", has: json, destination: "/api/assets/:asset/:section" },
];
```

A browser gets the page; `curl -H "Accept: application/json"` gets the payload; both from one URL.

## Rendering and caching

Route handlers set `dynamic = "force-dynamic"` — in live mode a cached response would defeat the point of reading state per request. Freshness is handed to the edge instead, via `cache-control: public, max-age=15, stale-while-revalidate=30`.

## Design principles

1. **A status without provenance is not publishable.** Every value carries `source_id`, `observed_at` and `verification`.
2. **Failure is a value, not an exception.** Unreadable state becomes `UNKNOWN` with a reason, never a guess and never a 500.
3. **`UNKNOWN` outranks `WARNING`.** Not knowing is worse than a known, bounded problem.
4. **One derivation.** `deriveOverall()` is pure and used by both the page and the API.
5. **Narrow scope.** No prices, charts, portfolios, trading, screening or recommendations.

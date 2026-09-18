# Extending the provider

Only the token pause state has a live reader. This page describes how to add the others.

## Add a reader

Readers live alongside `readPaused` in `lib/onchain.ts` (or a sibling module for HTTP sources). Follow its contract: return a discriminated union, never throw, always stamp `observed_at`.

```ts
export type OracleResult =
  | { ok: true; ageSeconds: number; heartbeat: number; observed_at: string }
  | { ok: false; reason: string; observed_at: string };

export async function readOracle(rpcUrl: string, feed: string): Promise<OracleResult> {
  const observed_at = new Date().toISOString();
  try {
    // eth_call latestRoundData() …
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "RPC unreachable", observed_at };
  }
}
```

Keep `AbortSignal.timeout()` on every network call. A provider that hangs is worse than one that reports `UNKNOWN`.

## Overlay it in `enrich()`

`enrich()` in `lib/provider.ts` takes a snapshot record and returns a record with live signals overlaid. Extend it the same way the token signal is handled — success sets a verified value, failure sets `UNKNOWN` with the reason in `detail`:

```ts
const o = await readOracle(rpc, `${record.asset}/USD`);
const oracle_status: Signal<OracleStatus> = o.ok
  ? {
      value: o.ageSeconds > o.heartbeat ? "STALE" : "HEALTHY",
      verification: "VERIFIED_ONCHAIN",
      source_id: "oracle-contract",
      observed_at: o.observed_at,
      detail: `Last answer ${o.ageSeconds}s old, heartbeat ${o.heartbeat}s`,
    }
  : {
      value: "UNKNOWN",
      verification: "UNKNOWN",
      source_id: "oracle-contract",
      observed_at: o.observed_at,
      detail: o.reason,
    };
```

{% hint style="danger" %}
Never fall back to the snapshot value when a live read fails. A stale "ACTIVE" is the one output the model exists to prevent — the fallback is `UNKNOWN`.
{% endhint %}

## What each signal needs

| Signal | Source to wire | Verification |
| --- | --- | --- |
| `token_status` | `paused()` — **done** | `VERIFIED_ONCHAIN` |
| `transfer_status` | Allowlist / restriction registry on the token contract | `VERIFIED_ONCHAIN` |
| `oracle_status` | Price feed's `latestRoundData()` age against its heartbeat | `VERIFIED_ONCHAIN` |
| `trading_status` | Venue trading-status feed | `VERIFIED_AUTHORITATIVE` |
| `underlying_status` | Primary market halt feed | `VERIFIED_AUTHORITATIVE` |
| `corporate_action` | Issuer corporate-action notices | `VERIFIED_AUTHORITATIVE` |

Register anything new in the `sources()` table in `lib/data/snapshot.ts` (or wherever the live source list comes to live), so every `source_id` still resolves.

## Adding an asset

Add a `build({ … })` entry to `records()` in `lib/data/snapshot.ts`. `build()` fills in chain, chain ID, issuer and the source table; the `onchain`, `oracle` and `market` helpers fill in the verification and source fields for a signal.

```ts
build({
  asset: "ABCD",
  name: "Example Corp.",
  token: "0x…",
  token_status:      { value: "ACTIVE",  ...onchain(minutesBefore(1)) },
  transfer_status:   { value: "ENABLED", ...onchain(minutesBefore(1)) },
  trading_status:    { value: "ACTIVE",  ...market(minutesBefore(3)) },
  oracle_status:     { value: "HEALTHY", ...oracle(minutesBefore(1)) },
  underlying_status: { value: "ACTIVE",  ...market(minutesBefore(3)) },
  corporate_action: null,
}),
```

The asset appears in `GET /assets`, gets a page at `/assets/ABCD`, and is returned by `knownSymbols()` with no further wiring.

## Replacing the snapshot entirely

The routes only know `listAssets()`, `getAsset()` and `knownSymbols()`. A different backing store — a database fed by a poller, most likely — means reimplementing those three against it. Keep `AssetRecord` as the boundary type and `lib/status.ts` needs no change at all.

## Things to preserve

* Every signal keeps `source_id`, `observed_at` and `verification`.
* Failure resolves to `UNKNOWN`, never to a guessed value and never to a 5xx.
* `deriveOverall()` stays pure and stays the single place the verdict is computed.
* No prices, charts, portfolios, trading, screening or recommendations.

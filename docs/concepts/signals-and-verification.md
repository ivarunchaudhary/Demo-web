# Signals, sources and verification

A status with no provenance is an opinion. Every value AssetStatus publishes is wrapped in a `Signal`, which says where the value came from, when it was observed, and how far it was actually verified.

## The Signal envelope

```ts
interface Signal<T extends string> {
  value: T;
  verification: "VERIFIED_ONCHAIN" | "VERIFIED_AUTHORITATIVE" | "UNKNOWN";
  source_id: string;     // joins to an entry in `sources`
  observed_at: string;   // ISO 8601
  detail?: string;       // human-readable evidence
}
```

Example:

```json
{
  "value": "STALE",
  "verification": "VERIFIED_ONCHAIN",
  "source_id": "oracle-contract",
  "observed_at": "2026-09-19T09:11:04.118Z",
  "detail": "Last answer 14m old, exceeds 5m heartbeat"
}
```

## Verification levels

| Level | Meaning |
| --- | --- |
| `VERIFIED_ONCHAIN` | Read directly from a contract on Robinhood Chain. The strongest claim available. |
| `VERIFIED_AUTHORITATIVE` | Read from the party entitled to state it — the issuer, or the primary market. |
| `UNKNOWN` | Could not be established. Never a guess, never a default. |

`verification: "UNKNOWN"` and `value: "UNKNOWN"` travel together. There is no path in the code that produces a confident value from a failed read: see `enrich()` in `lib/provider.ts` and `readPaused()` in `lib/onchain.ts`.

## Sources

Each asset carries a `sources` array, and every signal's `source_id` joins to one of its entries:

```ts
interface Source {
  id: string;            // "token-contract"
  name: string;          // "Stock Token contract"
  kind: "onchain" | "authoritative";
  url?: string;          // where a reader can verify it themselves
  reference?: string;    // contract address, feed pair, document ref
}
```

The five sources currently modelled:

| `id` | Name | Kind |
| --- | --- | --- |
| `token-contract` | Stock Token contract | onchain |
| `oracle-contract` | Reference price feed | onchain |
| `issuer-docs` | Issuer token documentation | authoritative |
| `market-status` | Primary market trading status | authoritative |
| `corporate-actions` | Issuer corporate-action notices | authoritative |

Fetch them for any asset with [`GET /assets/{asset}/sources`](../api/sources.md).

## Corporate actions

A corporate action is not a `Signal` — it has no enumerated state — but it carries the same provenance fields plus an effective date:

```ts
interface CorporateAction {
  type: "DIVIDEND" | "STOCK_SPLIT" | "MERGER" | "SUSPENSION" | "OTHER";
  summary: string;
  effective_date?: string;   // ISO date
  verification: Verification;
  source_id: string;
  observed_at: string;
}
```

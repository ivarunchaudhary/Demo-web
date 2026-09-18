# Type definitions

The full contract, from `lib/types.ts`. These types are shared by the API handlers and the UI, so the page and the JSON can never disagree.

## Status enums

```ts
type OverallStatus    = "ACTIVE" | "WARNING" | "BLOCKED" | "UNKNOWN";

type TokenStatus      = "ACTIVE" | "PAUSED"  | "FROZEN"    | "UNKNOWN";
type TransferStatus   = "ENABLED"| "RESTRICTED" | "PAUSED" | "UNKNOWN";
type TradingStatus    = "ACTIVE" | "HALTED"  | "SUSPENDED" | "UNKNOWN";
type OracleStatus     = "HEALTHY"| "STALE"   | "UNAVAILABLE" | "UNKNOWN";
type UnderlyingStatus = "ACTIVE" | "HALTED"  | "DELISTED"  | "UNKNOWN";

type CorporateActionType =
  | "DIVIDEND" | "STOCK_SPLIT" | "MERGER" | "SUSPENSION" | "OTHER";

type Verification =
  | "VERIFIED_ONCHAIN" | "VERIFIED_AUTHORITATIVE" | "UNKNOWN";

type SourceKind = "onchain" | "authoritative";
```

Every enum carries `UNKNOWN`. There is no implicit default.

## Signal

```ts
interface Signal<T extends string> {
  value: T;
  verification: Verification;
  source_id: string;
  observed_at: string;   // ISO 8601
  detail?: string;
}
```

## Source

```ts
interface Source {
  id: string;            // stable, e.g. "token-contract"
  name: string;
  kind: SourceKind;
  url?: string;          // where a reader can verify this themselves
  reference?: string;    // contract address, document reference, etc.
}
```

## CorporateAction

```ts
interface CorporateAction {
  type: CorporateActionType;
  summary: string;
  effective_date?: string;   // ISO date
  verification: Verification;
  source_id: string;
  observed_at: string;
}
```

## AssetRecord

The internal shape a provider produces. Never serialised directly.

```ts
interface AssetRecord {
  asset: string;         // ticker
  name: string;
  token: string;         // contract address
  chain: string;
  chain_id: number;
  issuer: string;
  token_status: Signal<TokenStatus>;
  transfer_status: Signal<TransferStatus>;
  trading_status: Signal<TradingStatus>;
  oracle_status: Signal<OracleStatus>;
  underlying_status: Signal<UnderlyingStatus>;
  corporate_action: CorporateAction | null;
  sources: Source[];
}
```

## AssetStatusResponse

What `GET /assets/{asset}` returns. `toResponse()` derives it from an `AssetRecord`.

```ts
interface AssetStatusResponse {
  asset: string;
  name: string;
  token: string;
  chain: string;
  chain_id: number;
  issuer: string;
  overall_status: OverallStatus;
  reasons: string[];
  token_status: TokenStatus;
  transfer_status: TransferStatus;
  trading_status: TradingStatus;
  oracle_status: OracleStatus;
  underlying_status: UnderlyingStatus;
  corporate_action: CorporateAction | null;
  last_updated: string;
  signals: {
    token: Signal<TokenStatus>;
    transfers: Signal<TransferStatus>;
    trading: Signal<TradingStatus>;
    oracle: Signal<OracleStatus>;
    underlying: Signal<UnderlyingStatus>;
  };
  sources: Source[];
}
```

The flattened `*_status` fields and the `signals` object hold the same values. The flat ones exist so a caller that only needs the verdict does not have to walk the envelopes.

## AssetSummary

One row in `GET /assets`.

```ts
interface AssetSummary {
  asset: string;
  name: string;
  token: string;
  chain: string;
  overall_status: OverallStatus;
  last_updated: string;
}
```

## Display helpers

`lib/format.ts` is UI-only, but two exports are useful to mirror in a client:

```ts
OVERALL_MEANING: Record<OverallStatus, string>   // the one-line meaning of each verdict
VERIFICATION_LABEL: Record<Verification, string> // "Verified onchain", …
tone(value: string): OverallStatus               // maps any signal value to its indicator colour
```

`tone()` collapses the per-category vocabularies onto the four overall states: `ENABLED` and `HEALTHY` read as `ACTIVE`; `RESTRICTED` and `STALE` as `WARNING`; `PAUSED`, `FROZEN`, `HALTED`, `SUSPENDED`, `UNAVAILABLE` and `DELISTED` as `BLOCKED`; anything else as `UNKNOWN`.

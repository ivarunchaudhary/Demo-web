export type OverallStatus = "ACTIVE" | "WARNING" | "BLOCKED" | "UNKNOWN";

export type TokenStatus = "ACTIVE" | "PAUSED" | "FROZEN" | "UNKNOWN";
export type TransferStatus = "ENABLED" | "RESTRICTED" | "PAUSED" | "UNKNOWN";
export type TradingStatus = "ACTIVE" | "HALTED" | "SUSPENDED" | "UNKNOWN";
export type OracleStatus = "HEALTHY" | "STALE" | "UNAVAILABLE" | "UNKNOWN";
export type UnderlyingStatus = "ACTIVE" | "HALTED" | "DELISTED" | "UNKNOWN";

export type CorporateActionType =
  | "DIVIDEND"
  | "STOCK_SPLIT"
  | "MERGER"
  | "SUSPENSION"
  | "OTHER";

export type Verification =
  | "VERIFIED_ONCHAIN"
  | "VERIFIED_AUTHORITATIVE"
  | "UNKNOWN";

export type SourceKind = "onchain" | "authoritative";

export interface Source {
  /** Stable identifier, e.g. "token-contract" */
  id: string;
  name: string;
  kind: SourceKind;
  /** Where a reader can verify this themselves. */
  url?: string;
  /** Contract address, document reference, etc. */
  reference?: string;
}

/** Every status carries where it came from, when it was observed, and how far it is verified. */
export interface Signal<T extends string> {
  value: T;
  verification: Verification;
  source_id: string;
  observed_at: string; // ISO 8601
  detail?: string;
}

export interface CorporateAction {
  type: CorporateActionType;
  summary: string;
  effective_date?: string; // ISO date
  verification: Verification;
  source_id: string;
  observed_at: string;
}

export interface AssetRecord {
  asset: string; // ticker, e.g. AAPL
  name: string;
  token: string; // contract address
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

/** The public shape returned by GET /assets/{asset}. */
export interface AssetStatusResponse {
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

export interface AssetSummary {
  asset: string;
  name: string;
  token: string;
  chain: string;
  overall_status: OverallStatus;
  last_updated: string;
}

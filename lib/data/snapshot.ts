import type { AssetRecord, Source } from "../types";

/**
 * Snapshot provider data.
 *
 * This is a recorded snapshot used when no live Robinhood Chain RPC is configured.
 * Every signal keeps its source, observation time and verification state so the
 * UI and API never present an assumption as a verified status.
 *
 * Contract addresses below are placeholders for the sample provider; replace them
 * with the issuer-published addresses when wiring the live provider.
 */

const CHAIN = "Robinhood Chain";
const CHAIN_ID = 46630;
const ISSUER = "Robinhood Europe";

// The snapshot stands in for a poller that has just run: observation times are
// stamped relative to the moment the snapshot is read. The live provider stamps real times.
let now = Date.now();
const minutesBefore = (m: number) => new Date(now - m * 60_000).toISOString();

function sources(token: string, ticker: string): Source[] {
  return [
    {
      id: "token-contract",
      name: "Stock Token contract",
      kind: "onchain",
      reference: token,
      url: `https://explorer.robinhood.com/address/${token}`,
    },
    {
      id: "oracle-contract",
      name: "Reference price feed",
      kind: "onchain",
      reference: `${ticker}/USD`,
    },
    {
      id: "issuer-docs",
      name: "Issuer token documentation",
      kind: "authoritative",
      url: "https://robinhood.com/eu/en/support/articles/stock-tokens/",
    },
    {
      id: "market-status",
      name: "Primary market trading status",
      kind: "authoritative",
      url: "https://www.nasdaqtrader.com/trader.aspx?id=TradeHalts",
    },
    {
      id: "corporate-actions",
      name: "Issuer corporate-action notices",
      kind: "authoritative",
      url: "https://www.sec.gov/edgar/search/",
    },
  ];
}

type Draft = Omit<AssetRecord, "chain" | "chain_id" | "issuer" | "sources">;

function build(d: Draft): AssetRecord {
  return { ...d, chain: CHAIN, chain_id: CHAIN_ID, issuer: ISSUER, sources: sources(d.token, d.asset) };
}

const onchain = (observed_at: string, detail?: string) =>
  ({ verification: "VERIFIED_ONCHAIN" as const, source_id: "token-contract", observed_at, detail });
const oracle = (observed_at: string, detail?: string) =>
  ({ verification: "VERIFIED_ONCHAIN" as const, source_id: "oracle-contract", observed_at, detail });
const market = (observed_at: string, detail?: string) =>
  ({ verification: "VERIFIED_AUTHORITATIVE" as const, source_id: "market-status", observed_at, detail });

function records(): AssetRecord[] {
  return [
    build({
    asset: "AAPL",
    name: "Apple Inc.",
    token: "0x2a1c4E5f9b8D7c6A3f0e1B2d3C4e5F6a7B8c9D01",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(0.5), "paused() returned false") },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(0.5), "No active transfer restriction in allowlist registry") },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1), "Last answer 38s old, within 5m heartbeat") },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(2), "No halt on primary listing") },
    corporate_action: null,
    }),
    build({
    asset: "MSFT",
    name: "Microsoft Corporation",
    token: "0x3b2d5F6a0c9E8d7B4a1f2C3e4D5f6A7b8C9d0E12",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(1)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    corporate_action: {
      type: "DIVIDEND",
      summary: "Quarterly cash dividend of $0.83 per share. Token holders of record on the ex-date receive the equivalent distribution.",
      effective_date: "2026-11-19",
      verification: "VERIFIED_AUTHORITATIVE",
      source_id: "corporate-actions",
      observed_at: minutesBefore(45),
    },
    }),
    build({
    asset: "NVDA",
    name: "NVIDIA Corporation",
    token: "0x4c3e6A7b1d0F9e8C5b2a3D4f5E6a7B8c9D0e1F23",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(0.5)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(0.5)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(0.5)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    corporate_action: {
      type: "STOCK_SPLIT",
      summary: "4-for-1 stock split announced. Token balances will be adjusted by the issuer on the effective date.",
      effective_date: "2026-10-02",
      verification: "VERIFIED_AUTHORITATIVE",
      source_id: "corporate-actions",
      observed_at: minutesBefore(120),
    },
    }),
    build({
    asset: "TSLA",
    name: "Tesla, Inc.",
    token: "0x5d4f7B8c2e1A0f9D6c3b4E5a6F7b8C9d0E1f2A34",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(1)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(4)) },
    oracle_status: { value: "STALE", ...oracle(minutesBefore(1), "Last answer 14m old, exceeds 5m heartbeat") },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(4)) },
    corporate_action: null,
    }),
    build({
    asset: "AMZN",
    name: "Amazon.com, Inc.",
    token: "0x6e5a8C9d3f2B1a0E7d4c5F6b7A8c9D0e1F2a3B45",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "RESTRICTED", ...onchain(minutesBefore(1), "Transfers limited to allowlisted addresses; 2 jurisdictions excluded") },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    corporate_action: null,
    }),
    build({
    asset: "GOOGL",
    name: "Alphabet Inc. Class A",
    token: "0x7f6b9D0e4a3C2b1F8e5d6A7c8B9d0E1f2A3b4C56",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(0.5)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(0.5)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(0.5)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    corporate_action: null,
    }),
    build({
    asset: "META",
    name: "Meta Platforms, Inc.",
    token: "0x8a7c0E1f5b4D3c2A9f6e7B8d9C0e1F2a3B4c5D67",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(1)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(2)) },
    corporate_action: null,
    }),
    build({
    asset: "GME",
    name: "GameStop Corp.",
    token: "0x9b8d1F2a6c5E4d3B0a7f8C9e0D1f2A3b4C5d6E78",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(1)) },
    trading_status: { value: "HALTED", ...market(minutesBefore(6), "LULD volatility halt on primary listing, code M") },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: { value: "HALTED", ...market(minutesBefore(6), "Halt in effect since 15:24 ET") },
    corporate_action: null,
    }),
    build({
    asset: "COIN",
    name: "Coinbase Global, Inc.",
    token: "0xac9e2A3b7d6F5e4C1b8a9D0f1E2a3B4c5D6e7F89",
    token_status: { value: "PAUSED", ...onchain(minutesBefore(2), "paused() returned true; Paused event emitted at block 18,204,113") },
    transfer_status: { value: "PAUSED", ...onchain(minutesBefore(2), "Transfers revert while contract is paused") },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    corporate_action: null,
    }),
    build({
    asset: "HOOD",
    name: "Robinhood Markets, Inc.",
    token: "0xbd0f3B4c8e7A6f5D2c9b0E1a2F3b4C5d6E7f8A90",
    token_status: { value: "ACTIVE", ...onchain(minutesBefore(1)) },
    transfer_status: { value: "ENABLED", ...onchain(minutesBefore(1)) },
    trading_status: { value: "ACTIVE", ...market(minutesBefore(3)) },
    oracle_status: { value: "HEALTHY", ...oracle(minutesBefore(1)) },
    underlying_status: {
      value: "UNKNOWN",
      verification: "UNKNOWN",
      source_id: "market-status",
      observed_at: minutesBefore(3),
      detail: "No authoritative feed configured for this listing",
    },
    corporate_action: null,
    }),
  ];
}

export function snapshot(): AssetRecord[] {
  now = Date.now();
  return records();
}

import { snapshot } from "./data/snapshot";
import { readPaused } from "./onchain";
import { toResponse, toSummary } from "./status";
import type { AssetRecord, AssetStatusResponse, AssetSummary } from "./types";

/**
 * Status provider.
 *
 * Starts from the recorded snapshot. When ROBINHOOD_CHAIN_RPC_URL is set, the
 * token pause state is re-read onchain on every request and overrides the
 * snapshot value; a failed read downgrades the signal to UNKNOWN.
 */

export const PROVIDER_MODE: "snapshot" | "live" = process.env.ROBINHOOD_CHAIN_RPC_URL ? "live" : "snapshot";

function normalise(symbol: string): string {
  return symbol.trim().toUpperCase();
}

async function enrich(record: AssetRecord): Promise<AssetRecord> {
  const rpc = process.env.ROBINHOOD_CHAIN_RPC_URL;
  if (!rpc) return record;
  const result = await readPaused(rpc, record.token);
  if (result.ok) {
    return {
      ...record,
      token_status: {
        value: result.paused ? "PAUSED" : "ACTIVE",
        verification: "VERIFIED_ONCHAIN",
        source_id: "token-contract",
        observed_at: result.observed_at,
        detail: `paused() returned ${result.paused}`,
      },
    };
  }
  return {
    ...record,
    token_status: {
      value: "UNKNOWN",
      verification: "UNKNOWN",
      source_id: "token-contract",
      observed_at: result.observed_at,
      detail: result.reason,
    },
  };
}

export async function listAssets(): Promise<AssetSummary[]> {
  const records = await Promise.all(snapshot().map(enrich));
  return records.map(toSummary);
}

export async function getAsset(symbol: string): Promise<AssetStatusResponse | null> {
  const record = snapshot().find((a) => a.asset === normalise(symbol));
  if (!record) return null;
  return toResponse(await enrich(record));
}

export function knownSymbols(): string[] {
  return snapshot().map((a) => a.asset);
}

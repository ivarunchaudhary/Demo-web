import type { AssetRecord, AssetStatusResponse, AssetSummary, OverallStatus } from "./types";

/**
 * Derive the overall operational status from the individual signals.
 *
 * Precedence: BLOCKED > UNKNOWN > WARNING > ACTIVE.
 * An asset is never labelled ACTIVE while any core signal is UNKNOWN:
 * "no problem detected" is not the same as "no problem".
 */
export function deriveOverall(a: AssetRecord): { status: OverallStatus; reasons: string[] } {
  const blocked: string[] = [];
  const unknown: string[] = [];
  const warning: string[] = [];

  switch (a.token_status.value) {
    case "PAUSED": blocked.push("Token contract is paused."); break;
    case "FROZEN": blocked.push("Token contract is frozen or restricted."); break;
    case "UNKNOWN": unknown.push("Token contract state could not be verified."); break;
  }
  switch (a.transfer_status.value) {
    case "PAUSED": blocked.push("Transfers are paused."); break;
    case "RESTRICTED": warning.push("Transfers are restricted for some holders."); break;
    case "UNKNOWN": unknown.push("Transfer restrictions could not be verified."); break;
  }
  switch (a.trading_status.value) {
    case "HALTED": blocked.push("Trading is halted."); break;
    case "SUSPENDED": blocked.push("Trading is suspended."); break;
    case "UNKNOWN": unknown.push("Trading status could not be verified."); break;
  }
  switch (a.oracle_status.value) {
    case "UNAVAILABLE": blocked.push("Reference price is unavailable."); break;
    case "STALE": warning.push("Reference price is stale."); break;
    case "UNKNOWN": unknown.push("Oracle state could not be verified."); break;
  }
  switch (a.underlying_status.value) {
    case "HALTED": blocked.push("Underlying security is halted."); break;
    case "DELISTED": blocked.push("Underlying security is delisted."); break;
    case "UNKNOWN": unknown.push("Underlying security status is not available from an authoritative source."); break;
  }
  if (a.corporate_action) {
    if (a.corporate_action.type === "SUSPENSION") {
      blocked.push(`Corporate action: ${a.corporate_action.summary}`);
    } else {
      warning.push(`Corporate action: ${a.corporate_action.summary}`);
    }
  }

  if (blocked.length) return { status: "BLOCKED", reasons: [...blocked, ...warning, ...unknown] };
  if (unknown.length) return { status: "UNKNOWN", reasons: [...unknown, ...warning] };
  if (warning.length) return { status: "WARNING", reasons: warning };
  return { status: "ACTIVE", reasons: ["No operational issue detected across verified signals."] };
}

export function lastUpdated(a: AssetRecord): string {
  const times = [
    a.token_status.observed_at,
    a.transfer_status.observed_at,
    a.trading_status.observed_at,
    a.oracle_status.observed_at,
    a.underlying_status.observed_at,
    a.corporate_action?.observed_at,
  ].filter(Boolean) as string[];
  return times.sort().at(-1) ?? new Date(0).toISOString();
}

export function toResponse(a: AssetRecord): AssetStatusResponse {
  const { status, reasons } = deriveOverall(a);
  return {
    asset: a.asset,
    name: a.name,
    token: a.token,
    chain: a.chain,
    chain_id: a.chain_id,
    issuer: a.issuer,
    overall_status: status,
    reasons,
    token_status: a.token_status.value,
    transfer_status: a.transfer_status.value,
    trading_status: a.trading_status.value,
    oracle_status: a.oracle_status.value,
    underlying_status: a.underlying_status.value,
    corporate_action: a.corporate_action,
    last_updated: lastUpdated(a),
    signals: {
      token: a.token_status,
      transfers: a.transfer_status,
      trading: a.trading_status,
      oracle: a.oracle_status,
      underlying: a.underlying_status,
    },
    sources: a.sources,
  };
}

export function toSummary(a: AssetRecord): AssetSummary {
  return {
    asset: a.asset,
    name: a.name,
    token: a.token,
    chain: a.chain,
    overall_status: deriveOverall(a).status,
    last_updated: lastUpdated(a),
  };
}

/**
 * Minimal JSON-RPC reader for the live provider.
 *
 * Reads the OpenZeppelin-style `paused()` view on a Stock Token contract.
 * Set ROBINHOOD_CHAIN_RPC_URL to enable. Anything that cannot be read
 * resolves to UNKNOWN rather than to a guessed value.
 */

const PAUSED_SELECTOR = "0x5c975abb"; // keccak256("paused()")[:4]

export type PausedResult =
  | { ok: true; paused: boolean; observed_at: string }
  | { ok: false; reason: string; observed_at: string };

export async function readPaused(rpcUrl: string, token: string): Promise<PausedResult> {
  const observed_at = new Date().toISOString();
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: token, data: PAUSED_SELECTOR }, "latest"],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { ok: false, reason: `RPC responded ${res.status}`, observed_at };
    const json = (await res.json()) as { result?: string; error?: { message: string } };
    if (json.error) return { ok: false, reason: json.error.message, observed_at };
    if (!json.result || json.result === "0x") return { ok: false, reason: "Contract does not expose paused()", observed_at };
    return { ok: true, paused: BigInt(json.result) !== BigInt(0), observed_at };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "RPC unreachable", observed_at };
  }
}

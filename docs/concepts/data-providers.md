# Data providers

`lib/provider.ts` is the only thing the API talks to. It runs in one of two modes.

## Snapshot mode (default)

With no `ROBINHOOD_CHAIN_RPC_URL` set, the app serves `lib/data/snapshot.ts`: a recorded set of ten tokens chosen to cover every overall state — active, warning, blocked and unknown.

Two things about the snapshot are worth knowing:

* **Observation times are stamped when the snapshot is read.** `snapshot()` resets its clock on every call and derives each `observed_at` as an offset from now, standing in for a poller that has just run. Timestamps therefore look live even though the values are fixed.
* **Contract addresses are placeholders.** Replace them with issuer-published addresses before pointing anything real at this.

## Live mode

Set `ROBINHOOD_CHAIN_RPC_URL` and `enrich()` re-reads the token pause state on **every request**, overriding the snapshot value.

The read is a single `eth_call` against the OpenZeppelin-style `paused()` view:

```
selector 0x5c975abb   // keccak256("paused()")[:4]
```

```ts
{ jsonrpc: "2.0", id: 1, method: "eth_call",
  params: [{ to: token, data: "0x5c975abb" }, "latest"] }
```

On success the token signal becomes:

```json
{
  "value": "ACTIVE",
  "verification": "VERIFIED_ONCHAIN",
  "source_id": "token-contract",
  "observed_at": "2026-09-19T09:12:04.118Z",
  "detail": "paused() returned false"
}
```

## Failure is a state, not an exception

Any failure downgrades the signal to `UNKNOWN` and records why. The reason string is passed through to `detail`:

| Condition | `detail` |
| --- | --- |
| Non-2xx from the RPC | `RPC responded 502` |
| JSON-RPC error object | the RPC's own message |
| Empty result (`0x`) | `Contract does not expose paused()` |
| Timeout after 4s, network failure | the thrown error's message |

Because `UNKNOWN` outranks `WARNING` in the [precedence rule](status-model.md#precedence), an unreachable RPC turns the whole asset `UNKNOWN`. That is intended: the app would rather say it does not know than serve a stale "ACTIVE".

## What is still snapshot-only

Only the **token pause state** has a live reader. Transfer restrictions, oracle heartbeat, market halts, underlying status and corporate actions are served from the snapshot in both modes. Wiring them is described in [Extending the provider](../architecture/extending-the-provider.md).

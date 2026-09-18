# Quickstart

## Ask for one asset

```bash
curl http://localhost:3000/api/assets/AAPL/status
```

```json
{
  "asset": "AAPL",
  "token": "0x2a1c4E5f9b8D7c6A3f0e1B2d3C4e5F6a7B8c9D01",
  "chain": "Robinhood Chain",
  "overall_status": "ACTIVE",
  "reasons": ["No operational issue detected across verified signals."],
  "token_status": "ACTIVE",
  "transfer_status": "ENABLED",
  "trading_status": "ACTIVE",
  "oracle_status": "HEALTHY",
  "underlying_status": "ACTIVE",
  "corporate_action": null,
  "last_updated": "2026-09-19T09:12:04.118Z"
}
```

## The same call on the spec path

The specification places the API at `/assets/...`, which is also where the HTML pages live. Content negotiation resolves the conflict: send `Accept: application/json` and the request is rewritten to the handler under `/api`.

```bash
curl -H "Accept: application/json" http://localhost:3000/assets/AAPL/status
```

Both forms return byte-identical JSON. The rewrite rules live in `next.config.ts`.

## Gate an action on status

```ts
const res = await fetch("https://your-host/api/assets/AAPL/status");
const s = await res.json();

if (s.overall_status !== "ACTIVE") {
  throw new Error(`AAPL is ${s.overall_status}: ${s.reasons.join(" ")}`);
}
```

Treating `UNKNOWN` as a pass defeats the point of the model — it means the state could not be verified, not that it is fine.

## Browse instead

* `/` — search a Stock Token, plus the list of tracked tokens and what each overall status means.
* `/assets/{TICKER}` — overall status, then token, transfer, trading, oracle, underlying and corporate-action status, each with its source, verification state and observation time.

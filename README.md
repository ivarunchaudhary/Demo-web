# AssetStatus

Live operational status for Stock Tokens on Robinhood Chain. Before interacting with a tokenized stock, ask one question: what is its current operational state?

Built from the AssetStatus developer specification. Visual language follows grove.finance: charcoal ground, ivory type, a serif display face, hairline rules, tracked-caps buttons.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` — search a Stock Token, plus the list of tracked tokens and what each overall status means.
- `/assets/{TICKER}` — overall status, then token, transfer, trading, oracle, underlying and corporate-action status, each with its source, verification state and observation time.

## API

Every endpoint in the specification is served under `/api`, and also at the spec's own paths when the request carries `Accept: application/json`.

| Endpoint | Returns |
| --- | --- |
| `GET /assets` | Every tracked token with overall status |
| `GET /assets/{asset}` | Full record, signals and sources |
| `GET /assets/{asset}/status` | Compact summary (matches the spec's example response) |
| `GET /assets/{asset}/oracle` | Reference price health |
| `GET /assets/{asset}/transfers` | Token and transfer state |
| `GET /assets/{asset}/trading` | Trading and underlying security state |
| `GET /assets/{asset}/corporate-actions` | Dividends, splits, mergers, suspensions |
| `GET /assets/{asset}/sources` | Where each status came from |

```bash
curl -H "Accept: application/json" http://localhost:3000/assets/AAPL/status
curl http://localhost:3000/api/assets/AAPL/status
```

## How the overall status is derived

`lib/status.ts` ranks signals as BLOCKED > UNKNOWN > WARNING > ACTIVE. An asset is never labelled ACTIVE while any core signal is UNKNOWN, and every response lists the reasons behind the verdict.

Each signal carries `verification` (`VERIFIED_ONCHAIN`, `VERIFIED_AUTHORITATIVE` or `UNKNOWN`), a `source_id` and an `observed_at` timestamp.

## Data providers

- **Snapshot** (default): `lib/data/snapshot.ts` holds a recorded set of ten tokens covering every overall state. Observation times are stamped when the snapshot is read, standing in for a poller that has just run. Contract addresses are placeholders.
- **Live pause state**: set `ROBINHOOD_CHAIN_RPC_URL` and `lib/onchain.ts` calls `paused()` on each token contract per request. A failed read downgrades the token signal to UNKNOWN rather than guessing.

Wiring the remaining signals (transfer registry, oracle heartbeat, market halts, corporate-action feeds) means adding readers alongside `readPaused` and replacing the snapshot values in `lib/provider.ts`.

## Out of scope by design

No prices, charts, portfolios, trading, screening or recommendations. The product is status infrastructure.

# Configuration

AssetStatus runs with no configuration at all. One optional variable switches the token signal from recorded data to a live onchain read.

## Environment variables

| Variable | Required | Effect |
| --- | --- | --- |
| `ROBINHOOD_CHAIN_RPC_URL` | No | When set, the token pause state is read onchain (`eth_call` → `paused()`) on every request. Without it, the app serves the recorded snapshot in `lib/data/snapshot.ts`. |

Copy the example file to get started:

```bash
cp .env.example .env.local
```

```bash
# .env.local
ROBINHOOD_CHAIN_RPC_URL=https://rpc.example.robinhood.chain
```

## Provider mode

`lib/provider.ts` exports `PROVIDER_MODE`, derived once from the presence of the RPC URL:

```ts
export const PROVIDER_MODE: "snapshot" | "live" =
  process.env.ROBINHOOD_CHAIN_RPC_URL ? "live" : "snapshot";
```

The value is echoed in the `GET /assets` response, so a client can always tell which mode served it.

## Caching

JSON responses are sent with:

```
cache-control: public, max-age=15, stale-while-revalidate=30
```

Route handlers are declared `dynamic = "force-dynamic"`, so each request re-reads the provider rather than serving a build-time result.

## Timeouts

The live onchain read aborts after **4 seconds** (`AbortSignal.timeout(4000)`). A timeout is not an error the caller sees — it downgrades the token signal to `UNKNOWN` with the reason attached.

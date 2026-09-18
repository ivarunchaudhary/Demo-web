# Overview and conventions

## Base paths

Every endpoint is served twice:

| Path | Notes |
| --- | --- |
| `/api/assets/...` | Always JSON. Use this from code. |
| `/assets/...` | The specification's own paths. Returns JSON **only** when the request carries `Accept: application/json`; otherwise it renders the HTML page. |

The content-negotiated rewrite is configured in `next.config.ts` and matches any `Accept` header containing `application/json`.

## Endpoints

| Endpoint | Returns |
| --- | --- |
| [`GET /assets`](list-assets.md) | Every tracked token with overall status |
| [`GET /assets/{asset}`](get-asset.md) | Full record, signals and sources |
| [`GET /assets/{asset}/status`](status.md) | Compact summary |
| [`GET /assets/{asset}/transfers`](transfers.md) | Token and transfer state |
| [`GET /assets/{asset}/trading`](trading.md) | Trading and underlying security state |
| [`GET /assets/{asset}/oracle`](oracle.md) | Reference price health |
| [`GET /assets/{asset}/corporate-actions`](corporate-actions.md) | Dividends, splits, mergers, suspensions |
| [`GET /assets/{asset}/sources`](sources.md) | Where each status came from |

## Conventions

**Method** — `GET` only. Nothing in the API mutates state.

**Authentication** — none.

**The `{asset}` parameter** — a ticker. Matching is case-insensitive and surrounding whitespace is trimmed; `aapl`, ` AAPL ` and `AAPL` are the same asset. Responses always echo the canonical uppercase form.

**Caching** — every successful response carries:

```
cache-control: public, max-age=15, stale-while-revalidate=30
```

**Timestamps** — ISO 8601 with milliseconds, UTC (`2026-09-19T09:12:04.118Z`). `effective_date` on a corporate action is a plain ISO date (`2026-11-19`).

**Errors** — a JSON body with an `error` code. See [Errors](errors.md).

**Field stability** — `asset` is present in every single-asset response, so a payload is never ambiguous about what it describes.

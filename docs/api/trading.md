# Trading

```
GET /api/assets/{asset}/trading
GET /assets/{asset}/trading          (with Accept: application/json)
```

Tradability of the token and the state of the real-world security behind it. The two are separate on purpose: a token can be perfectly healthy while its underlying listing is halted.

## Response

| Field | Type |
| --- | --- |
| `asset` | string |
| `trading_status` | `ACTIVE` \| `HALTED` \| `SUSPENDED` \| `UNKNOWN` |
| `underlying_status` | `ACTIVE` \| `HALTED` \| `DELISTED` \| `UNKNOWN` |
| `signals.trading` | `Signal<TradingStatus>` |
| `signals.underlying` | `Signal<UnderlyingStatus>` |

## Example

```bash
curl http://localhost:3000/api/assets/AAPL/trading
```

```json
{
  "asset": "AAPL",
  "trading_status": "ACTIVE",
  "underlying_status": "ACTIVE",
  "signals": {
    "trading": {
      "value": "ACTIVE",
      "verification": "VERIFIED_AUTHORITATIVE",
      "source_id": "market-status",
      "observed_at": "2026-09-19T09:10:04.118Z"
    },
    "underlying": {
      "value": "ACTIVE",
      "verification": "VERIFIED_AUTHORITATIVE",
      "source_id": "market-status",
      "observed_at": "2026-09-19T09:10:04.118Z",
      "detail": "No halt on primary listing"
    }
  }
}
```

Both signals are `VERIFIED_AUTHORITATIVE` — they come from the primary market's trading-status feed, not from the chain. Where no such feed is configured for a listing, the signal is `UNKNOWN` with the reason stated in `detail`.

`HALTED`, `SUSPENDED` and `DELISTED` all resolve the asset to `BLOCKED`.

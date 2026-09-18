# Get an asset

```
GET /api/assets/{asset}
GET /assets/{asset}          (with Accept: application/json)
```

The complete record: derived verdict, flattened values, the full `Signal` for each, and the source table. Every other single-asset endpoint is a projection of this one.

## Response

| Field | Type | Notes |
| --- | --- | --- |
| `asset` | string | Canonical uppercase ticker. |
| `name` | string | Legal name. |
| `token` | string | Contract address. |
| `chain` | string | `"Robinhood Chain"`. |
| `chain_id` | number | `46630`. |
| `issuer` | string | `"Robinhood Europe"`. |
| `overall_status` | enum | The derived verdict. |
| `reasons` | string[] | Ordered explanation, never empty. |
| `token_status` … `underlying_status` | enum | Flattened signal values, for a quick read. |
| `corporate_action` | object \| null | Full corporate action, if any. |
| `last_updated` | ISO 8601 | Most recent `observed_at` across signals. |
| `signals` | object | `token`, `transfers`, `trading`, `oracle`, `underlying` — each a full `Signal`. |
| `sources` | `Source[]` | Provenance table; `source_id` joins here. |

## Example

```bash
curl http://localhost:3000/api/assets/TSLA
```

```json
{
  "asset": "TSLA",
  "name": "Tesla, Inc.",
  "token": "0x5d4f7B8c2e1A0f9D6c3b4E5a6F7b8C9d0E1f2A34",
  "chain": "Robinhood Chain",
  "chain_id": 46630,
  "issuer": "Robinhood Europe",
  "overall_status": "WARNING",
  "reasons": ["Reference price is stale."],
  "token_status": "ACTIVE",
  "transfer_status": "ENABLED",
  "trading_status": "ACTIVE",
  "oracle_status": "STALE",
  "underlying_status": "ACTIVE",
  "corporate_action": null,
  "last_updated": "2026-09-19T09:11:04.118Z",
  "signals": {
    "token": {
      "value": "ACTIVE",
      "verification": "VERIFIED_ONCHAIN",
      "source_id": "token-contract",
      "observed_at": "2026-09-19T09:11:04.118Z"
    },
    "transfers": {
      "value": "ENABLED",
      "verification": "VERIFIED_ONCHAIN",
      "source_id": "token-contract",
      "observed_at": "2026-09-19T09:11:04.118Z"
    },
    "trading": {
      "value": "ACTIVE",
      "verification": "VERIFIED_AUTHORITATIVE",
      "source_id": "market-status",
      "observed_at": "2026-09-19T09:08:04.118Z"
    },
    "oracle": {
      "value": "STALE",
      "verification": "VERIFIED_ONCHAIN",
      "source_id": "oracle-contract",
      "observed_at": "2026-09-19T09:11:04.118Z",
      "detail": "Last answer 14m old, exceeds 5m heartbeat"
    },
    "underlying": {
      "value": "ACTIVE",
      "verification": "VERIFIED_AUTHORITATIVE",
      "source_id": "market-status",
      "observed_at": "2026-09-19T09:08:04.118Z"
    }
  },
  "sources": [
    {
      "id": "token-contract",
      "name": "Stock Token contract",
      "kind": "onchain",
      "reference": "0x5d4f7B8c2e1A0f9D6c3b4E5a6F7b8C9d0E1f2A34",
      "url": "https://explorer.robinhood.com/address/0x5d4f7B8c2e1A0f9D6c3b4E5a6F7b8C9d0E1f2A34"
    }
  ]
}
```

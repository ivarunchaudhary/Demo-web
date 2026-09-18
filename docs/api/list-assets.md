# List assets

```
GET /api/assets
GET /assets          (with Accept: application/json)
```

Every tracked token with its overall status. This is the only endpoint that reports which provider mode served the request.

## Response

| Field | Type | Notes |
| --- | --- | --- |
| `chain` | string | Always `"Robinhood Chain"`. |
| `provider` | `"snapshot"` \| `"live"` | Whether onchain reads are enabled. |
| `count` | number | Length of `assets`. |
| `assets` | `AssetSummary[]` | One entry per tracked token. |

Each `AssetSummary`:

| Field | Type |
| --- | --- |
| `asset` | string — ticker |
| `name` | string — legal name |
| `token` | string — contract address |
| `chain` | string |
| `overall_status` | `ACTIVE` \| `WARNING` \| `BLOCKED` \| `UNKNOWN` |
| `last_updated` | ISO 8601 |

## Example

```bash
curl http://localhost:3000/api/assets
```

```json
{
  "chain": "Robinhood Chain",
  "provider": "snapshot",
  "count": 10,
  "assets": [
    {
      "asset": "AAPL",
      "name": "Apple Inc.",
      "token": "0x2a1c4E5f9b8D7c6A3f0e1B2d3C4e5F6a7B8c9D01",
      "chain": "Robinhood Chain",
      "overall_status": "ACTIVE",
      "last_updated": "2026-09-19T09:12:04.118Z"
    },
    {
      "asset": "TSLA",
      "name": "Tesla, Inc.",
      "token": "0x5d4f7B8c2e1A0f9D6c3b4E5a6F7b8C9d0E1f2A34",
      "chain": "Robinhood Chain",
      "overall_status": "WARNING",
      "last_updated": "2026-09-19T09:11:04.118Z"
    }
  ]
}
```

{% hint style="info" %}
In live mode this endpoint issues one `paused()` read per tracked token, in parallel. Each read carries its own 4-second timeout.
{% endhint %}

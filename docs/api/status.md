# Status summary

```
GET /api/assets/{asset}/status
GET /assets/{asset}/status          (with Accept: application/json)
```

The compact answer: the verdict, why, and the five flattened values. This is the endpoint to poll if you are gating an action on operational state.

## Response

| Field | Type | Notes |
| --- | --- | --- |
| `asset` | string | Canonical ticker. |
| `token` | string | Contract address. |
| `chain` | string | |
| `overall_status` | enum | The derived verdict. |
| `reasons` | string[] | Ordered explanation. |
| `token_status` … `underlying_status` | enum | Flattened values. |
| `corporate_action` | string \| null | The **type** only (`"DIVIDEND"`, `"SUSPENSION"`, …), not the full object. |
| `last_updated` | ISO 8601 | |

{% hint style="info" %}
`corporate_action` is a bare type string here, unlike every other endpoint where it is an object. Use [corporate-actions](corporate-actions.md) when you need the summary and effective date.
{% endhint %}

## Example

```bash
curl http://localhost:3000/api/assets/HOOD/status
```

```json
{
  "asset": "HOOD",
  "token": "0xbd0f3B4c8e7A6f5D2c9b0E1a2F3b4C5d6E7f8A90",
  "chain": "Robinhood Chain",
  "overall_status": "UNKNOWN",
  "reasons": [
    "Underlying security status is not available from an authoritative source."
  ],
  "token_status": "ACTIVE",
  "transfer_status": "ENABLED",
  "trading_status": "ACTIVE",
  "oracle_status": "HEALTHY",
  "underlying_status": "UNKNOWN",
  "corporate_action": null,
  "last_updated": "2026-09-19T09:11:04.118Z"
}
```

Five healthy signals and one unverifiable one still resolve to `UNKNOWN`. See [The status model](../concepts/status-model.md).

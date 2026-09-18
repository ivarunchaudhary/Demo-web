# Corporate actions

```
GET /api/assets/{asset}/corporate-actions
GET /assets/{asset}/corporate-actions          (with Accept: application/json)
```

Scheduled events that will change what a holder owns: dividends, splits, mergers, suspensions.

## Response

| Field | Type | Notes |
| --- | --- | --- |
| `asset` | string | |
| `corporate_actions` | `CorporateAction[]` | Empty array when none. The model currently tracks at most one action per asset, so this array holds zero or one entry. |

Each `CorporateAction`:

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `DIVIDEND` \| `STOCK_SPLIT` \| `MERGER` \| `SUSPENSION` \| `OTHER` | |
| `summary` | string | Plain-language description. |
| `effective_date` | ISO date | Optional. |
| `verification` | enum | Normally `VERIFIED_AUTHORITATIVE`. |
| `source_id` | string | Normally `corporate-actions`. |
| `observed_at` | ISO 8601 | |

## Example

```bash
curl http://localhost:3000/api/assets/NVDA/corporate-actions
```

```json
{
  "asset": "NVDA",
  "corporate_actions": [
    {
      "type": "STOCK_SPLIT",
      "summary": "4-for-1 stock split announced. Token balances will be adjusted by the issuer on the effective date.",
      "effective_date": "2026-10-02",
      "verification": "VERIFIED_AUTHORITATIVE",
      "source_id": "corporate-actions",
      "observed_at": "2026-09-19T07:12:04.118Z"
    }
  ]
}
```

With nothing pending:

```json
{ "asset": "AAPL", "corporate_actions": [] }
```

## Effect on overall status

`SUSPENSION` resolves the asset to `BLOCKED`. Every other type contributes a `WARNING`, on the reasoning that a dividend, split or merger changes the position in a way a holder should know about before acting, without making the token unusable.

The reason string is `Corporate action: ` followed by the `summary`.

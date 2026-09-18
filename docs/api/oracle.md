# Oracle

```
GET /api/assets/{asset}/oracle
GET /assets/{asset}/oracle          (with Accept: application/json)
```

Health of the reference price feed. This endpoint reports **whether the price can be trusted**, never the price itself — quoting prices is out of scope.

## Response

| Field | Type | Notes |
| --- | --- | --- |
| `asset` | string | |
| `oracle_status` | `HEALTHY` \| `STALE` \| `UNAVAILABLE` \| `UNKNOWN` | |
| `signal` | `Signal<OracleStatus>` | Singular `signal`, not `signals`. |

## Example

```bash
curl http://localhost:3000/api/assets/TSLA/oracle
```

```json
{
  "asset": "TSLA",
  "oracle_status": "STALE",
  "signal": {
    "value": "STALE",
    "verification": "VERIFIED_ONCHAIN",
    "source_id": "oracle-contract",
    "observed_at": "2026-09-19T09:11:04.118Z",
    "detail": "Last answer 14m old, exceeds 5m heartbeat"
  }
}
```

## The values

| Value | Meaning | Effect on overall status |
| --- | --- | --- |
| `HEALTHY` | Last answer is within the feed's heartbeat. | none |
| `STALE` | Feed is answering, but the answer is older than its heartbeat. | `WARNING` |
| `UNAVAILABLE` | No usable answer at all. | `BLOCKED` |
| `UNKNOWN` | Feed state could not be verified. | `UNKNOWN` |

`detail` carries the evidence — the age of the last answer against the configured heartbeat — so a consumer can apply a stricter threshold than the feed's own.

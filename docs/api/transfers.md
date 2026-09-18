# Transfers

```
GET /api/assets/{asset}/transfers
GET /assets/{asset}/transfers          (with Accept: application/json)
```

Token contract state and holder transferability — the two signals that determine whether a balance can move at all.

## Response

| Field | Type |
| --- | --- |
| `asset` | string |
| `token_status` | `ACTIVE` \| `PAUSED` \| `FROZEN` \| `UNKNOWN` |
| `transfer_status` | `ENABLED` \| `RESTRICTED` \| `PAUSED` \| `UNKNOWN` |
| `signals.token` | `Signal<TokenStatus>` |
| `signals.transfers` | `Signal<TransferStatus>` |

## Example

```bash
curl http://localhost:3000/api/assets/AAPL/transfers
```

```json
{
  "asset": "AAPL",
  "token_status": "ACTIVE",
  "transfer_status": "ENABLED",
  "signals": {
    "token": {
      "value": "ACTIVE",
      "verification": "VERIFIED_ONCHAIN",
      "source_id": "token-contract",
      "observed_at": "2026-09-19T09:12:04.118Z",
      "detail": "paused() returned false"
    },
    "transfers": {
      "value": "ENABLED",
      "verification": "VERIFIED_ONCHAIN",
      "source_id": "token-contract",
      "observed_at": "2026-09-19T09:12:04.118Z",
      "detail": "No active transfer restriction in allowlist registry"
    }
  }
}
```

## Interpreting the pair

| Combination | Meaning |
| --- | --- |
| `ACTIVE` + `ENABLED` | Normal. |
| `PAUSED` + `PAUSED` | Contract-level pause; transfers revert for everyone. |
| `ACTIVE` + `RESTRICTED` | The contract runs, but some holders cannot transfer — a warning, not a blocker. |
| anything + `UNKNOWN` | Do not infer transferability. |

In live mode `signals.token` is re-read onchain per request; `signals.transfers` still comes from the snapshot.

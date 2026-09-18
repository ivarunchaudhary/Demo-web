# The status model

Six inputs collapse into one verdict. This page describes exactly how, because the rule is the product.

## The six signals

| Signal | Values | Question it answers |
| --- | --- | --- |
| `token_status` | `ACTIVE` · `PAUSED` · `FROZEN` · `UNKNOWN` | Is the token contract itself operating? |
| `transfer_status` | `ENABLED` · `RESTRICTED` · `PAUSED` · `UNKNOWN` | Can holders move the token? |
| `trading_status` | `ACTIVE` · `HALTED` · `SUSPENDED` · `UNKNOWN` | Is the token tradable? |
| `oracle_status` | `HEALTHY` · `STALE` · `UNAVAILABLE` · `UNKNOWN` | Is the reference price current? |
| `underlying_status` | `ACTIVE` · `HALTED` · `DELISTED` · `UNKNOWN` | Is the real-world security trading? |
| `corporate_action` | `DIVIDEND` · `STOCK_SPLIT` · `MERGER` · `SUSPENSION` · `OTHER` · none | Is a scheduled event about to change the position? |

## Precedence

`deriveOverall()` in `lib/status.ts` sorts every signal into one of three buckets and applies:

```
BLOCKED  >  UNKNOWN  >  WARNING  >  ACTIVE
```

`UNKNOWN` sits **above** `WARNING` on purpose. An unverifiable signal is a bigger problem than a known, bounded one, and it must never be silently rounded down to "fine".

## The mapping

| Signal value | Bucket | Reason emitted |
| --- | --- | --- |
| `token_status: PAUSED` | Blocked | Token contract is paused. |
| `token_status: FROZEN` | Blocked | Token contract is frozen or restricted. |
| `transfer_status: PAUSED` | Blocked | Transfers are paused. |
| `transfer_status: RESTRICTED` | Warning | Transfers are restricted for some holders. |
| `trading_status: HALTED` | Blocked | Trading is halted. |
| `trading_status: SUSPENDED` | Blocked | Trading is suspended. |
| `oracle_status: UNAVAILABLE` | Blocked | Reference price is unavailable. |
| `oracle_status: STALE` | Warning | Reference price is stale. |
| `underlying_status: HALTED` | Blocked | Underlying security is halted. |
| `underlying_status: DELISTED` | Blocked | Underlying security is delisted. |
| `corporate_action: SUSPENSION` | Blocked | Corporate action: *summary* |
| any other corporate action | Warning | Corporate action: *summary* |
| any signal `UNKNOWN` | Unknown | *…could not be verified.* |

## Reasons

Every response carries a `reasons` array, never an empty one. The ordering follows the verdict:

* `BLOCKED` → blocking reasons, then warnings, then unknowns.
* `UNKNOWN` → unknowns, then warnings.
* `WARNING` → warnings only.
* `ACTIVE` → a single line: *No operational issue detected across verified signals.*

A consumer can surface `reasons[0]` and be showing the most significant thing wrong.

## Freshness

`last_updated` is the **most recent** `observed_at` across all six signals — the newest thing known, not the oldest. To reason about staleness, read the per-signal `observed_at` values in `signals`; they can differ widely, because onchain reads happen far more often than corporate-action notices.

## Worked examples

**TSLA** — everything verified and healthy except a reference price 14 minutes old against a 5-minute heartbeat. One warning, no blockers, no unknowns → `WARNING`.

**HOOD** — all onchain signals verified and healthy, but no authoritative feed is configured for the underlying listing. One unknown → `UNKNOWN`, despite five green signals.

**A paused token** — `token_status: PAUSED` and `transfer_status: PAUSED` → `BLOCKED`, with both reasons listed.

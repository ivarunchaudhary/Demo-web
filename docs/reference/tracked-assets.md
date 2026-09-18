# Tracked assets

The default snapshot holds ten tokens, chosen so that every overall status and every interesting signal combination is represented. All are issued by **Robinhood Europe** on **Robinhood Chain** (`chain_id: 46630`).

| Ticker | Name | Overall | Why |
| --- | --- | --- | --- |
| `AAPL` | Apple Inc. | `ACTIVE` | All six signals verified and healthy. |
| `MSFT` | Microsoft Corporation | `WARNING` | Quarterly dividend pending, effective 2026-11-19. |
| `NVDA` | NVIDIA Corporation | `WARNING` | 4-for-1 stock split announced, effective 2026-10-02. |
| `TSLA` | Tesla, Inc. | `WARNING` | Reference price 14m old against a 5m heartbeat. |
| `AMZN` | Amazon.com, Inc. | `WARNING` | Transfers limited to allowlisted addresses; 2 jurisdictions excluded. |
| `GOOGL` | Alphabet Inc. Class A | `ACTIVE` | All six signals verified and healthy. |
| `META` | Meta Platforms, Inc. | `ACTIVE` | All six signals verified and healthy. |
| `GME` | GameStop Corp. | `BLOCKED` | LULD volatility halt on the primary listing; token trading and underlying both halted. |
| `COIN` | Coinbase Global, Inc. | `BLOCKED` | Contract paused; transfers revert. |
| `HOOD` | Robinhood Markets, Inc. | `UNKNOWN` | No authoritative feed configured for the underlying listing. |

## Reading the interesting ones

**GME** shows the split between token and reality. The contract is fine and transfers work; the *market* has halted. `trading_status: HALTED` and `underlying_status: HALTED`, both `VERIFIED_AUTHORITATIVE`, both citing the halt in effect since 15:24 ET.

**COIN** is the inverse. The market is open and the oracle is healthy; the *token* is paused, with `detail` naming the block at which the `Paused` event was emitted.

**AMZN** is the one case of `RESTRICTED` transfers — the contract runs, but not every holder can move the token. A warning, not a blocker.

**HOOD** is the model's point in a single row: five verified, healthy signals and one that cannot be established, resolving to `UNKNOWN` rather than `ACTIVE`.

{% hint style="warning" %}
Contract addresses in the snapshot are placeholders. Replace them with issuer-published addresses before pointing a live provider at them.
{% endhint %}

## Discovering the list at runtime

```bash
curl -s http://localhost:3000/api/assets | jq -r '.assets[] | "\(.asset)\t\(.overall_status)"'
```

In code, `knownSymbols()` in `lib/provider.ts` returns the tickers.

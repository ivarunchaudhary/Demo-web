# Sources

```
GET /api/assets/{asset}/sources
GET /assets/{asset}/sources          (with Accept: application/json)
```

The provenance table. Every `source_id` appearing in any signal for this asset resolves to an entry here.

## Response

| Field | Type |
| --- | --- |
| `asset` | string |
| `sources` | `Source[]` |

Each `Source`:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable identifier, e.g. `token-contract`. |
| `name` | string | Display name. |
| `kind` | `onchain` \| `authoritative` | |
| `url` | string | Optional — where a reader can verify it themselves. |
| `reference` | string | Optional — contract address, feed pair, document reference. |

## Example

```bash
curl http://localhost:3000/api/assets/AAPL/sources
```

```json
{
  "asset": "AAPL",
  "sources": [
    {
      "id": "token-contract",
      "name": "Stock Token contract",
      "kind": "onchain",
      "reference": "0x2a1c4E5f9b8D7c6A3f0e1B2d3C4e5F6a7B8c9D01",
      "url": "https://explorer.robinhood.com/address/0x2a1c4E5f9b8D7c6A3f0e1B2d3C4e5F6a7B8c9D01"
    },
    {
      "id": "oracle-contract",
      "name": "Reference price feed",
      "kind": "onchain",
      "reference": "AAPL/USD"
    },
    {
      "id": "issuer-docs",
      "name": "Issuer token documentation",
      "kind": "authoritative",
      "url": "https://robinhood.com/eu/en/support/articles/stock-tokens/"
    },
    {
      "id": "market-status",
      "name": "Primary market trading status",
      "kind": "authoritative",
      "url": "https://www.nasdaqtrader.com/trader.aspx?id=TradeHalts"
    },
    {
      "id": "corporate-actions",
      "name": "Issuer corporate-action notices",
      "kind": "authoritative",
      "url": "https://www.sec.gov/edgar/search/"
    }
  ]
}
```

## Joining signals to sources

```ts
const asset = await (await fetch("/api/assets/AAPL")).json();
const byId = Object.fromEntries(asset.sources.map((s) => [s.id, s]));

for (const [name, sig] of Object.entries(asset.signals)) {
  const src = byId[sig.source_id];
  console.log(`${name}: ${sig.value} — ${src.name} (${src.kind})`, src.url ?? "");
}
```

{% hint style="warning" %}
The contract addresses in the default snapshot are placeholders, so the explorer URLs built from them will not resolve. Replace them with issuer-published addresses when wiring a live provider.
{% endhint %}

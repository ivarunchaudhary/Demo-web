# Errors

The API has a small error surface: a request either names a tracked asset or it does not.

## Unknown asset

```
404 Not Found
```

```json
{
  "error": "asset_not_found",
  "message": "No Stock Token tracked for \"XYZ\"."
}
```

The ticker is echoed in uppercase. Handled centrally by `withAsset()` in `app/api/assets/_shared.ts`, so every single-asset endpoint returns the same shape.

{% hint style="info" %}
A 404 carries no `cache-control` header — only successful responses are marked cacheable.
{% endhint %}

## Unsupported method

Only `GET` handlers are exported. Any other method returns `405 Method Not Allowed` from the framework.

## No error for a failed upstream read

This is the part worth internalising. When the onchain read fails, the request still returns `200` — the failure is expressed *in the data*, not in the status code:

```json
{
  "asset": "AAPL",
  "overall_status": "UNKNOWN",
  "reasons": ["Token contract state could not be verified."],
  "signals": {
    "token": {
      "value": "UNKNOWN",
      "verification": "UNKNOWN",
      "source_id": "token-contract",
      "observed_at": "2026-09-19T09:12:04.118Z",
      "detail": "RPC responded 502"
    }
  }
}
```

A client that only checks `res.ok` will read this as a success and must still inspect `overall_status`. Treat `UNKNOWN` as a failure to verify, not as a pass.

## Client checklist

```ts
const res = await fetch(url);
if (res.status === 404) return notTracked();
if (!res.ok) return transportError(res.status);

const s = await res.json();
if (s.overall_status === "BLOCKED") return blocked(s.reasons);
if (s.overall_status === "UNKNOWN") return cannotVerify(s.reasons);
if (s.overall_status === "WARNING") return proceedWithNotice(s.reasons);
return proceed();
```

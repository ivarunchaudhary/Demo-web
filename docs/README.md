---
description: Live operational status for Stock Tokens on Robinhood Chain.
---

# Feels

Before interacting with a tokenized stock, there is one question worth answering: **what is its current operational state?**

A Stock Token can be paused at the contract level, restricted for some holders, priced by a stale oracle, or tied to an underlying security that is halted or delisted. None of that is visible from a balance or a price chart. Feels answers that single question, for each tracked token, with a source and a timestamp attached to every claim.

## What it is

* A **web app** — search a ticker, read its overall status and the six signals behind it.
* A **JSON API** — the same data, one endpoint per concern, cacheable and unauthenticated.

## What it is not

No prices, charts, portfolios, trading, screening or recommendations. Feels is status infrastructure, deliberately narrow.

## The shape of an answer

Every asset resolves to one of four overall states:

| Status | Meaning |
| --- | --- |
| `ACTIVE` | No detected operational issue. |
| `WARNING` | Something requires attention, but the asset remains usable. |
| `BLOCKED` | A detected condition means the asset should not currently be treated as normally usable. |
| `UNKNOWN` | Insufficient verified information. |

An asset is **never** labelled `ACTIVE` while any core signal is unverifiable. "No problem detected" is not the same as "no problem" — see [The status model](concepts/status-model.md).

## Where to go next

* [Install and run](getting-started/installation.md) — get it on `localhost:3000`.
* [Overview and conventions](api/README.md) — the API surface.
* [Data providers](concepts/data-providers.md) — snapshot mode versus live onchain reads.

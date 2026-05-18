---
sidebar_position: 1
title: Stores overview
description: How stores are organised in the Horizon dashboard — one row per connected Magento, with usage and limits tracked per store.
---

# Stores overview

A **store** in Horizon is one connected Magento — typically one row per `base_url`. If your Magento install serves multiple websites or store views, you have a choice:

- **Single Horizon store, multiple Magento views.** The Magento extension already indexes per store view, and tool responses carry `store_id`. Agents can target a specific view by including it in the query.
- **Separate Horizon stores per brand / region / staging vs prod.** Cleaner isolation, separate usage tracking, separate keys. Choose this if billing or quota separation matters.

Most agencies pick the latter; most direct merchants pick the former.

## What lives on a store record

The dashboard surfaces:

- **Name** — display only.
- **Base URL** — the public storefront URL. Must be reachable from the Horizon gateway.
- **API key** — visible only at create / rotate time.
- **Status** — active / inactive (kill switch).
- **Created at** — when the store was added.
- **Connection state** — last successful test, latency, Magento version reported.
- **Usage** — calls this month, current overage (if any), quota remaining.

Internally, each row lives in the `stores` table of `byte8_horizon`, scoped to your `user_id`. All MCP traffic and usage logs join through this row.

## Plan limits

The number of stores you can create is tier-driven:

| Tier | Max stores |
|------|------------|
| Trial | 1 |
| Starter | 1 |
| Pro | 3 |
| Agency | 15 |
| Enterprise | Custom |

When you hit the limit, the dashboard surfaces the constraint and `createStore` returns a structured error. Upgrading or removing an unused store unblocks immediately.

## Active vs inactive

Toggle a store to **inactive** to pause MCP traffic for it without deleting the record. Useful for:

- Maintenance windows on the Magento side.
- Disputed billing on a specific store (pause without losing history).
- Testing what happens to your agent integration when a store goes offline.

Inactive stores still count toward your max-stores limit. Delete the record outright if you want the slot back.

## Deleting a store

Deleting removes the `stores` row, invalidates the API key, and tombstones the usage log records (kept for audit but no longer surfaced). The Magento side is untouched — you should also disable the extension or rotate the key on Magento admin if you don't want stale `/horizon/*` traffic.

## Next

- [API keys](/docs/stores/api-keys) — rotation, leak response, multi-environment patterns.
- [Usage analytics](/docs/stores/usage-analytics) — daily / per-tool / per-store breakdowns.

---
sidebar_position: 1
title: Stores overview
description: How stores are organised in the Horizon dashboard — one row per connected Magento, with usage and limits tracked per store.
---

# Stores overview

A **store** in Horizon is one connected Magento — one row per base URL. If your Magento install serves multiple websites or brands, connect each storefront base URL as its **own Horizon store**: separate API keys, separate usage tracking, clean isolation. (Per-store-view targeting within a single connection is not supported today.)

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
| Starter | 1 |
| Pro | 3 |
| Agency | 15 |
| Enterprise | Custom |

The 14-day free trial runs on your chosen plan's limits.

When you hit the limit, the dashboard surfaces the constraint and `createStore` returns a structured error. Upgrading or removing an unused store unblocks immediately.

## Active vs inactive

Toggle a store to **inactive** to pause MCP traffic for it without deleting the record. Useful for:

- Maintenance windows on the Magento side.
- Disputed billing on a specific store (pause without losing history).
- Testing what happens to your agent integration when a store goes offline.

Inactive stores still count toward your max-stores limit. Delete the record outright if you want the slot back.

## Deleting a store

Deleting removes the store, invalidates the API key, and detaches its usage history (retained for account-level totals, no longer attributable to the store). The Magento side is untouched — you should also disable the extension or rotate the key on Magento admin if you don't want stale `/horizon/*` traffic.

## Next

- [API keys](/docs/stores/api-keys) — rotation, leak response, multi-environment patterns.
- [Usage analytics](/docs/stores/usage-analytics) — daily / per-tool / per-store breakdowns.

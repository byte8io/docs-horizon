---
sidebar_position: 2
title: Webhooks
description: Catalog invalidation webhooks pushed from the Magento extension to the Horizon gateway.
---

# Webhooks

Horizon uses webhooks in one direction: **from your Magento store to the Horizon gateway**, to tell the gateway when products change so it can drop cached responses.

You don't need to wire anything up yourself — the Magento extension fires these automatically. This page exists so you can debug what's flying around if something looks off.

## Catalog invalidation

### Endpoint

```
POST https://horizon.byte8.io/webhooks/invalidate
```

### Auth

The Magento extension signs the call with the same per-store API key, sent as `X-Horizon-Key`. The gateway resolves the store record from that header and applies the invalidation only to that store's caches.

### Payload

```json
{
  "store_id": 1,
  "skus": ["ABC-123", "DEF-456"],
  "category_ids": [4, 7],
  "reason": "product_save"
}
```

| Field | Notes |
|-------|-------|
| `store_id` | Magento store-view id. The gateway uses this to scope the invalidation when you've got multiple views connected to one Horizon store. |
| `skus` | Affected SKUs. Optional — omit when the change is purely structural (e.g. category renamed). |
| `category_ids` | Affected categories. Optional — omit if no category-level cache needs invalidating. |
| `reason` | Free-text breadcrumb for debugging. Common values: `product_save`, `product_delete`, `category_save`, `stock_update`, `manual`. |

### Response

`200 OK` with `{ "accepted": true }` — fire-and-forget. The gateway doesn't expose internal cache state.

### Failure mode

If the gateway is briefly unreachable (deploy in progress, DNS hiccup), the Magento extension logs the failure and moves on — there is no retry. The next scheduled reindex on the Magento side will catch any drift; AI just sees slightly stale data for a few minutes.

## Inbound webhooks (planned)

The reverse direction — **gateway → merchant** — is on the [roadmap](https://byte8.io/products/horizon) under "webhook notifications for catalog changes":

- Notify a merchant URL when an agent searches for something with zero matching results (missing inventory opportunity).
- Notify when an agent quotes a price an unusual number of times for the same SKU (potential review-bot pattern).
- Notify on rate-limit threshold (80% / 100% / overage start).

Not shipped yet. Subscribe to the [changelog feed](/blog) for the first release.

## Debugging webhook traffic

If you suspect invalidations aren't firing:

1. **Magento side.** Check `var/log/system.log` for entries from `Byte8\Horizon\Observer\InvalidateProductCache` — successes log at INFO, failures log at WARNING with the gateway response code.
2. **Gateway side.** [Usage analytics](/docs/stores/usage-analytics) doesn't show webhook traffic separately (it's not a billable MCP call), but support can pull recent webhook traces for your tenant on request.
3. **Cross-check freshness.** Save a product in admin, wait 5 seconds, ask the agent for its detail via `get_product`. If you see the old data, either the indexer is set to `Update by Schedule` and cron hasn't run, or the webhook isn't landing — see [Indexer behaviour](/docs/magento-extension/indexer).

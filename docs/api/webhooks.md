---
sidebar_position: 2
title: Webhooks
description: Catalog invalidation webhooks pushed from the Magento extension to the Horizon gateway.
---

# Webhooks

Horizon uses webhooks in one direction: **from your Magento store to the Horizon gateway**, to tell the gateway when catalog data changes.

You don't need to wire anything up yourself — the Magento extension fires these automatically whenever **Gateway URL** is configured. This page exists so you can debug what's flying around if something looks off.

## Catalog invalidation

### Endpoint

```
POST https://horizon.byte8.io/webhooks/invalidate
```

### Auth

The Magento extension signs the call with the per-store API key, sent as `X-Horizon-Key`. The gateway resolves the store record from that header and scopes the event to that store.

### Payload

```json
{
  "event": "product_updated",
  "entity_ids": [12345, 12346],
  "timestamp": "2026-09-18T09:00:00Z"
}
```

| Field | Notes |
|-------|-------|
| `event` | One of `product_created`, `product_updated`, `product_deleted`, `category_created`, `category_updated`, `category_deleted`, `inventory_updated`, `full_reindex`. |
| `entity_ids` | Affected product/category IDs. Empty for `full_reindex`. |
| `timestamp` | ISO-8601 UTC time of the change in Magento. |

### Response

`200 OK` with `{ "status": "ok", "message": "..." }` — fire-and-forget.

### What the gateway does with it

Today: acknowledges and logs the event. The gateway currently reads your catalog live on every tool call, so there is no response cache to invalidate yet — a gateway-side **response cache (coming soon)** will use these events for instant invalidation. Keeping the Gateway URL configured now means caching benefits arrive automatically when that ships.

### Failure mode

If the gateway is briefly unreachable (deploy in progress, DNS hiccup), the extension logs a warning and moves on — no retry, and the save on the Magento side is never blocked. Since tool calls read live data, a missed webhook has no correctness impact today.

## Inbound webhooks (coming soon)

The reverse direction — **gateway → merchant** — is on the [roadmap](https://byte8.io/products/horizon):

- Notify a merchant URL when agents search for something with zero matching results (missing-inventory opportunity).
- Notify on quota thresholds (80% / 100%).

Not shipped yet.

## Debugging webhook traffic

If you suspect invalidations aren't firing:

1. **Magento side.** Check `var/log/system.log` for warnings from the Horizon webhook notifier (`Byte8\Horizon\Model\Webhook\Notifier`) — failures log the gateway response code. Is **Gateway URL** set in admin config?
2. **Cross-check freshness.** Save a product in admin, then ask the agent for it via `get_product` — detail reads are live, so stale detail data points at an API-key or connectivity problem rather than webhooks. Stale *search* results point at the [index](/docs/magento-extension/indexer) instead.

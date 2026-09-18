---
sidebar_position: 3
title: Index freshness
description: How the flat AI-index table stays fresh — save observers, the horizon:reindex command, and invalidation webhooks.
---

# Index freshness

Magento's catalog is EAV — flexible, but expensive to read in the shapes AI agents want. The Horizon extension solves this by maintaining a **flat AI-index table** (`byte8_horizon_product_index`): denormalised rows with the fields an AI agent actually needs, so `search_products` runs a fast fulltext query instead of EAV joins.

## How the index stays fresh

Two mechanisms, both automatic:

1. **Save observers.** Product, category, and stock saves (including MSI source-item changes) trigger a partial reindex of the affected rows the moment the save commits. No cron dependency — agents see the new state on the next call.
2. **Full rebuild command.** A CLI command rebuilds the whole table:

```bash
bin/magento horizon:reindex
```

Run the full rebuild after:

- First install (the index starts empty — this step is required).
- Bulk imports or attribute changes via SQL/CLI that bypass the save observers.
- A module upgrade that changes the index schema.

:::note
Horizon does **not** register a Magento framework indexer — you won't find it in **System → Tools → Index Management**, and there is no "Update on Save / Update by Schedule" mode to configure. Freshness is observer-driven with `horizon:reindex` as the manual full rebuild.
:::

## What's in the index

One row per product, with the search-relevant fields denormalised: SKU, name, descriptions (fulltext-indexed), type, pricing, stock summary, and category references. Detail calls (`get_product`) read live from Magento's repositories, so prices and options in detail responses are never stale.

## Invalidation push (webhooks)

On catalog changes, the extension also notifies the Horizon gateway (fire-and-forget, 3-second timeout, never blocks the save):

```
POST <gateway_url>/webhooks/invalidate
X-Horizon-Key: <store-api-key>

{ "event": "product_updated", "entity_ids": [12345], "timestamp": "2026-09-18T09:00:00Z" }
```

Events: `product_created` / `product_updated` / `product_deleted`, `category_created` / `category_updated` / `category_deleted`, `inventory_updated`, `full_reindex`.

Today the gateway reads your catalog live on every tool call, so there is no gateway-side cache to invalidate — the webhook exists as groundwork for a **response cache layer (coming soon)**. Wiring it up now means you get caching benefits automatically when that ships. See the [webhook reference](/docs/api/webhooks).

## When AI sees stale data

- **Search results**: fresh as of the last observer-driven index write — effectively real-time for normal admin saves; stale after SQL-level bulk changes until you run `horizon:reindex`.
- **Product detail / inventory / orders**: read live from Magento on every call — never stale.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| New product not visible to `search_products` | Added via import/SQL that bypassed observers — run `bin/magento horizon:reindex`. |
| Search index empty after install | The first full rebuild hasn't run — `bin/magento horizon:reindex`. |
| Old price in *search results* (detail is correct) | Same as above — rebuild; detail calls always read live. |

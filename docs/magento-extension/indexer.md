---
sidebar_position: 3
title: Indexer behaviour
description: How byte8_horizon_product builds the flat AI-index table and when AI sees stale data.
---

# Indexer behaviour

Magento's catalog is EAV — flexible, but expensive to read in the shapes AI agents want. The Horizon extension solves this by maintaining a **flat AI-index table** alongside Magento's stock indexes: one row per product per store view, with the attributes an AI agent actually needs (name, SKU, description, image URL, price, stock summary, category breadcrumbs).

This index is built and maintained by the `byte8_horizon_product` indexer.

## What's in the index

Roughly (see the canonical schema in `module-horizon/etc/db_schema.xml`):

| Column | Source |
|--------|--------|
| `entity_id` | Product `entity_id` |
| `sku` | Product `sku` |
| `store_id` | Store view |
| `name` | Product `name` (store-view-scoped) |
| `url_key` | Product URL key (store-view-scoped) |
| `description` | Description / short description (concat, trimmed) |
| `image_url` | Main product image (absolute, store-base-URL-aware) |
| `price` | Final price |
| `special_price` | Special price (if active) |
| `currency` | Store currency code |
| `stock_status` | Aggregated from MSI sources |
| `category_path` | Breadcrumb-style list of category names |
| `attributes_json` | Other indexed attributes as JSON |
| `updated_at` | Last index time |

The flat shape is why the MCP gateway can serve `search_products` and `get_product` quickly — no EAV joins, no attribute lookups per row.

## When the index rebuilds

There are two modes, set under [admin config](/docs/magento-extension/configuration#indexer):

### Update on Save (real-time)

Every product save triggers a partial reindex for that product. AI agents see the new state on the next `search_products` / `get_product` call after the save commits.

- **Pros:** AI sees fresh data within seconds.
- **Cons:** Slower admin save (proportional to the number of store views), and Magento's behaviour for bulk imports degrades — every save in a 10k-product import re-indexes one row.

Use this in production stores that change frequently and don't do bulk imports.

### Update by Schedule (default)

Saves are queued; Magento's cron picks them up and rebuilds in batches.

- **Pros:** Save is fast, bulk imports behave normally.
- **Cons:** AI can see stale data for the duration of the cron gap (default cron runs the `indexer` group every minute).

Use this in stores with frequent imports, multi-store-view setups, or generally high write volume. Default for new installs.

## Manual reindex

You can always force a full rebuild:

```bash
bin/magento indexer:reindex byte8_horizon_product
```

Run this after:

- First install (the index starts empty).
- Bulk attribute changes via SQL (which bypass the observers).
- Schema changes in `byte8_horizon_product_index` after a module upgrade.

The first reindex on a 50k-product catalog typically takes 30–90 seconds depending on hardware.

## Invalidation push

The extension also pushes invalidation events to the Horizon gateway via the `Webhook` observer:

```
POST https://horizon.byte8.io/webhooks/invalidate
X-Horizon-Key: <store-api-key>
Content-Type: application/json

{
  "store_id": 1,
  "skus": ["ABC-123", "DEF-456"]
}
```

This lets the gateway drop any internal caches without polling the index. The webhook is best-effort fire-and-forget — if the gateway is briefly unreachable, the next scheduled reindex still wins; nothing breaks.

See the [webhook reference](/docs/api/webhooks) for the full payload shape.

## When AI sees stale data

In default config (`Update by Schedule`), expect up to a one-minute lag between admin save and AI visibility — bounded by the Magento cron interval. The invalidation webhook reduces this lag for the gateway's internal caches, but the underlying `byte8_horizon_product_index` table still rebuilds on its own schedule.

If sub-minute freshness matters (e.g. flash-sale pricing that an agent must quote), switch to `Update on Save` and live with the slower admin saves.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| New product added in admin, not visible to `search_products` | Cron is paused; `bin/magento indexer:status byte8_horizon_product` shows pending. Run `indexer:reindex` to force, or check `cron_schedule` table. |
| Old price still surfaced to AI after price change | `Update by Schedule` and cron hasn't run yet. Or the gateway's internal cache hasn't expired — wait a minute or rotate via the webhook. |
| Index suddenly has 0 rows | Probably an aborted upgrade. Run `setup:upgrade` then `indexer:reindex byte8_horizon_product`. |

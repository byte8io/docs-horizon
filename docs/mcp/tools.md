---
sidebar_position: 3
title: Tools reference
description: Every MCP tool the Horizon gateway exposes, with arguments, response shape, and worked examples.
---

# MCP tools reference

The gateway ships eight tools out of the box. Each is intentionally narrow and ecommerce-shaped — agents shouldn't have to compose half a dozen calls to answer *"is SKU X in stock and how much is it?"*.

All tools share these behaviours:

- Per-store scope — your `X-Horizon-Key` decides which `stores` row applies.
- Logged to `usage_logs` (visible in [Usage analytics](/docs/stores/usage-analytics)).
- Counted against your monthly call quota.

## `ping`

Connectivity verification. Doesn't touch Magento.

| Argument | Type | Notes |
|----------|------|-------|
| `message` | string (optional) | Echoed back in the response. |

**Returns:** a string — either `"pong"` (no message) or `"pong: <message>"`.

Use this in your client's startup probe to confirm transport + auth before issuing real tool calls.

## `search_products`

Free-text + filter search over the AI product index.

| Argument | Type | Notes |
|----------|------|-------|
| `query` | string | Free-text. Matches against name, SKU, description. |
| `category_id` | int (optional) | Filter to a category subtree. |
| `product_type` | string (optional) | `simple`, `configurable`, `bundle`, `grouped`, `virtual`. |
| `in_stock` | bool (optional) | `true` to limit to in-stock products only. |
| `limit` | int (optional) | Page size. Defaults to 20, capped at 100. |
| `offset` | int (optional) | Pagination offset. |

**Returns:** an array of `ProductSummary`:

```json
{
  "entity_id": 12345,
  "sku": "ABC-123",
  "name": "Acme Hiking Jacket",
  "url_key": "acme-hiking-jacket",
  "price": 199.00,
  "currency": "GBP",
  "image_url": "https://shop.acme.example/media/catalog/product/a/b/abc-123.jpg",
  "in_stock": true
}
```

For full detail (description, tiered pricing, attributes), pass an `entity_id` or `sku` to `get_product`.

## `get_product`

Full product detail by SKU or entity ID.

| Argument | Type | Notes |
|----------|------|-------|
| `sku` | string (optional) | One of `sku` or `entity_id` is required. |
| `entity_id` | int (optional) | Same. |

**Returns:** a `ProductDetail`:

```json
{
  "entity_id": 12345,
  "sku": "ABC-123",
  "name": "Acme Hiking Jacket",
  "description": "Lightweight ...",
  "short_description": "Lightweight 3-season jacket.",
  "price": 199.00,
  "special_price": 149.00,
  "currency": "GBP",
  "images": ["https://..."],
  "categories": [{ "id": 4, "name": "Outdoor" }, { "id": 7, "name": "Jackets" }],
  "attributes": { "color": "Black", "size": "L", "material": "Recycled polyester" },
  "in_stock": true
}
```

## `get_categories`

Walk the category tree.

| Argument | Type | Notes |
|----------|------|-------|
| `parent_id` | int (optional) | Root category if omitted. |
| `depth` | int (optional) | How many levels to descend. Defaults to 2. |

**Returns:** a nested array of `Category` nodes, each with `id`, `name`, `url_key`, `children`.

Use this to ground a recommendation in your actual taxonomy rather than letting the agent invent category names.

## `get_inventory`

Stock levels per SKU and MSI source.

| Argument | Type | Notes |
|----------|------|-------|
| `skus` | string[] | Required. Up to 50 SKUs per call. |

**Returns:** an array of stock entries:

```json
{
  "sku": "ABC-123",
  "in_stock": true,
  "qty": 42,
  "sources": [
    { "source_code": "default", "qty": 35, "status": "in_stock" },
    { "source_code": "warehouse_eu", "qty": 7, "status": "in_stock" }
  ]
}
```

The `qty` field is the aggregated total across all sources the store's sales channel resolves to. Individual `sources` are useful when an agent needs to suggest a fulfilment region.

## `get_orders`

List orders with filters.

| Argument | Type | Notes |
|----------|------|-------|
| `customer_email` | string (optional) | Filter by customer. |
| `status` | string (optional) | `pending`, `processing`, `complete`, `closed`, `canceled`, etc. |
| `date_from` | ISO-8601 date (optional) | |
| `date_to` | ISO-8601 date (optional) | |
| `limit` | int (optional) | Defaults to 20, capped at 100. |

**Returns:** an array of `OrderSummary` with `increment_id`, `entity_id`, `status`, `customer_email`, `grand_total`, `created_at`.

For full detail (items, shipments, payments) pass the `increment_id` to `get_order`.

## `get_order`

Full detail for a single order.

| Argument | Type | Notes |
|----------|------|-------|
| `increment_id` | string (optional) | One of `increment_id` or `entity_id` is required. |
| `entity_id` | int (optional) | Same. |

**Returns:** an `OrderDetail` including line items, shipment tracking, payment method, billing/shipping addresses, status history.

Useful for *"where's my order?"* customer self-service flows.

## `get_customers`

Customer search.

| Argument | Type | Notes |
|----------|------|-------|
| `query` | string (optional) | Name / email partial match. |
| `group_id` | int (optional) | Filter to a specific customer group (e.g. wholesale). |
| `is_active` | bool (optional) | |
| `limit` | int (optional) | Defaults to 20. |

**Returns:** an array of `CustomerSummary` — `entity_id`, `email`, `firstname`, `lastname`, `group_id`, `created_at`.

## Worked example: "is SKU X in stock and how much?"

A single agent turn becomes two tool calls:

```
get_product(sku: "ABC-123")
  → returns price + currency

get_inventory(skus: ["ABC-123"])
  → returns qty + per-source breakdown
```

Total: 2 calls, ~150ms end-to-end on a warm Magento.

## Rate limits

Per-tenant monthly call quotas are tier-driven (see [pricing](https://byte8.io/products/horizon#pricing)). Hitting the soft cap on a paid tier continues to serve requests; overage is metered and billed monthly. The Trial tier has a hard 429 cap because there's no card on file.

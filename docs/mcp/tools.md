---
sidebar_position: 3
title: Tools reference
description: Every MCP tool the Horizon gateway exposes, with arguments, response shape, and worked examples.
---

# MCP tools reference

The gateway ships eight tools out of the box. Each is intentionally narrow and ecommerce-shaped — agents shouldn't have to compose half a dozen calls to answer *"is SKU X in stock and how much is it?"*.

All tools share these behaviours:

- Per-store scope — the API key sent as `Authorization: Bearer <key>` decides which store the call targets.
- Logged to usage tracking (visible in [Usage analytics](/docs/stores/usage-analytics)).
- Counted against your monthly call quota (`ping` and `list_stores` are free).
- List tools are paginated with `limit` + `page` (1-based) and return `total_count`, `page`, `page_size` alongside the rows.

## `ping`

Connectivity verification. Doesn't touch Magento, doesn't count against quota.

| Argument | Type | Notes |
|----------|------|-------|
| `message` | string (optional) | Echoed back in the response. |

**Returns:** `"pong"` (no message) or `"pong: <message>"`.

Use this in your client's startup probe to confirm transport + auth before issuing real tool calls.

## `list_stores`

Returns the store your API key is bound to (name + base URL). Useful for confirming which store a session is talking to. No arguments.

## `search_products`

Free-text + filter search over the AI product index.

| Argument | Type | Notes |
|----------|------|-------|
| `query` | string | Free-text. Matches name, SKU, or description. |
| `limit` | int (optional) | Default 10, capped at 50. |
| `page` | int (optional) | 1-based page number. |
| `category_id` | int (optional) | Filter to a category subtree. |
| `product_type` | string (optional) | `simple`, `configurable`, `bundle`, … |
| `in_stock_only` | bool (optional) | `true` to limit to in-stock products. |

**Returns:** `{ products: ProductSummary[], total_count, page, page_size }` where each `ProductSummary` is:

```json
{
  "id": 12345,
  "sku": "ABC-123",
  "name": "Acme Hiking Jacket",
  "product_type": "configurable",
  "price": 199.0,
  "currency": "GBP",
  "in_stock": true,
  "url_path": "acme-hiking-jacket"
}
```

For full detail (description, images, attributes), pass the SKU or ID to `get_product`.

## `get_product`

Full product detail by SKU or numeric ID.

| Argument | Type | Notes |
|----------|------|-------|
| `identifier` | string | Product SKU (preferred) or numeric product ID. |

**Returns:** a `ProductDetail`:

```json
{
  "id": 12345,
  "sku": "ABC-123",
  "name": "Acme Hiking Jacket",
  "product_type": "simple",
  "description": "Lightweight ...",
  "short_description": "Lightweight 3-season jacket.",
  "price": 199.0,
  "special_price": 149.0,
  "currency": "GBP",
  "in_stock": true,
  "qty": 42.0,
  "url_path": "acme-hiking-jacket",
  "images": [
    { "url": "https://shop.acme.example/media/...jpg", "label": "Front", "position": 1, "is_main": true }
  ],
  "categories": [
    { "id": 4, "name": "Outdoor", "url_path": "outdoor" }
  ],
  "attributes": [
    { "code": "color", "label": "Color", "value": "Black" }
  ]
}
```

## `get_categories`

Walk the category tree.

| Argument | Type | Notes |
|----------|------|-------|
| `parent_id` | int (optional) | Root categories if omitted. |
| `max_depth` | int (optional) | Levels to descend. Default 3, capped at 5. |

**Returns:** `{ categories: Category[], total_count }` — each `Category` node carries `id`, `name`, `url_path`, `parent_id`, `level`, `product_count`, and nested `children`.

Use this to ground a recommendation in your actual taxonomy rather than letting the agent invent category names.

## `get_inventory`

Stock levels by SKU and MSI source. One row per (SKU, source) pair.

| Argument | Type | Notes |
|----------|------|-------|
| `sku` | string (optional) | Filter by SKU (partial match). |
| `in_stock_only` | bool (optional) | Only in-stock rows. |
| `source_code` | string (optional) | Filter by MSI source (e.g. `default`, `warehouse_eu`). |
| `limit` | int (optional) | Default 20, capped at 50. |
| `page` | int (optional) | 1-based. |

**Returns:** `{ items: InventoryItem[], total_count, page, page_size }`:

```json
{
  "sku": "ABC-123",
  "product_name": "Acme Hiking Jacket",
  "qty": 35.0,
  "is_in_stock": true,
  "manage_stock": true,
  "source_code": "default"
}
```

An agent needing a total across sources sums the rows for the SKU; the per-source rows are useful when suggesting a fulfilment region.

## `get_orders`

List orders with filters.

| Argument | Type | Notes |
|----------|------|-------|
| `status` | string (optional) | `pending`, `processing`, `complete`, `canceled`, … |
| `customer_email` | string (optional) | Filter by customer (partial match). |
| `from_date` | string (optional) | `YYYY-MM-DD`. |
| `to_date` | string (optional) | `YYYY-MM-DD`. |
| `limit` | int (optional) | Default 20, capped at 50. |
| `page` | int (optional) | 1-based. |

**Returns:** `{ orders: OrderSummary[], total_count, page, page_size }` — each with `entity_id`, `increment_id`, `status`, `state`, `grand_total`, `currency`, `customer_email`, `customer_name`, `item_count`, `created_at`, `updated_at`.

For full detail pass the increment ID to `get_order`.

## `get_order`

Full detail for a single order.

| Argument | Type | Notes |
|----------|------|-------|
| `identifier` | string | Order increment ID (e.g. `"100000001"`) or entity ID. |

**Returns:** an `OrderDetail` — line items (`sku`, `name`, `qty_ordered`, `price`, `row_total`), totals (`subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `grand_total`), billing/shipping addresses, `payment_method`, `shipping_method`, `status`, `state`, timestamps.

Useful for *"where's my order?"* self-service flows.

## `get_customers`

Customer search.

| Argument | Type | Notes |
|----------|------|-------|
| `query` | string (optional) | Matches email, first name, or last name. |
| `group_name` | string (optional) | Filter by group (e.g. `General`, `Wholesale`). |
| `active_only` | bool (optional) | Only active accounts. |
| `limit` | int (optional) | Default 20, capped at 50. |
| `page` | int (optional) | 1-based. |

**Returns:** `{ customers: CustomerSummary[], total_count, page, page_size }` — each with `id`, `email`, `firstname`, `lastname`, `group_name`, `is_active`, `created_at`, plus order stats (`total_orders`, `total_spent`).

## Worked example: "is SKU X in stock and how much?"

A single agent turn becomes two tool calls:

```
get_product(identifier: "ABC-123")
  → price, special_price, currency, in_stock, qty

get_inventory(sku: "ABC-123")
  → per-source stock breakdown
```

## Rate limits

Per-tenant monthly call quotas are tier-driven (see [pricing](https://byte8.io/products/horizon#pricing)). Paid tiers are soft-capped — requests keep serving past quota and the excess is tracked in [usage analytics](/docs/stores/usage-analytics). Only the free trial hard-caps at its quota.

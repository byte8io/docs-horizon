---
sidebar_position: 99
title: Troubleshooting
description: Common Horizon failure modes and how to fix them.
---

# Troubleshooting

A grab-bag of the failure modes we see most often. If your symptom isn't here, the dashboard's **Test connection** flow + Magento `var/log/system.log` usually narrow it down quickly. If you're still stuck, email [helo@byte8.io](mailto:helo@byte8.io).

## "Test connection" fails

### `401 Unauthorized`

The API key in Magento admin doesn't match the one in the Horizon dashboard.

- Re-check the admin field at **Stores → Configuration → Byte8 → Horizon → API key**.
- Did you flush config cache after saving? `bin/magento cache:flush config`.
- If you rotated the key recently, are you using the new one in *both* places? The dashboard generated it; you have to paste it into Magento admin too.

### `404 Not Found`

The `/horizon/*` route isn't mounted in Magento.

- Did `setup:upgrade` complete cleanly after `composer require byte8/module-horizon`?
- Check the module is enabled: `bin/magento module:status Byte8_Horizon` should print `Module is enabled`.
- If it shows disabled, run `bin/magento module:enable Byte8_Horizon` then `setup:upgrade`.

### DNS / TLS error

The gateway can't reach the store's base URL from the public internet.

- Is the store behind a VPN, IP allowlist, or basic-auth wall? The gateway needs unauthenticated TLS access to `https://<your-store>/horizon/*`.
- Is the TLS cert valid? Self-signed and expired certs are rejected.
- Common gotcha: redirect from `http://` to `https://`. Set the dashboard's `baseUrl` to the canonical `https://` URL directly.

### Timeout

Magento is slow to respond, or the host is overloaded.

- Hit `/horizon/api/health` yourself from outside the network with `curl -i -H "X-Horizon-Key: <key>" https://your-store.example/horizon/api/health`. If that's slow too, it's a Magento issue not a Horizon one.
- Check `php-fpm` slow log, OPcache config, and Magento cron load.

## Tool calls return errors

### `Magento unreachable`

Same root causes as a failed connection test. Re-run **Test connection** in the dashboard to confirm.

### `Tool returned 422 / unprocessable entity`

The Magento extension returned an error specific to that tool's logic.

- `get_product` with an unknown SKU → 422 with `{ "error": "product_not_found" }`. The agent should retry with `search_products` first.
- `get_inventory` with > 50 SKUs → 422 with `{ "error": "too_many_skus" }`. Batch the calls.
- Look at the Magento `var/log/exception.log` for the corresponding entry — it usually has the full picture.

### `Rate limit exceeded` (only on Trial)

Trial tier is hard-capped at 10,000 calls / month. Upgrade to Starter or higher to enable soft caps + overage.

## AI sees stale data

The catalog changed but the agent reports the old state.

- Check the indexer status: `bin/magento indexer:status byte8_horizon_product`. If pending, run `bin/magento indexer:reindex byte8_horizon_product`.
- If your install is on `Update by Schedule`, the cron interval (default 1 min) is the floor on freshness. See [Indexer behaviour](/docs/magento-extension/indexer).
- If you need sub-second freshness on specific products, the invalidation webhook handles gateway-side caching, but the underlying flat index still needs to rebuild — `Update on Save` mode is the only way to get true real-time.

## Agent can't see Horizon tools at all

### Claude Desktop

- Config file syntax — run it through `jq` to confirm valid JSON.
- After editing, *restart* Claude Desktop, not just refresh.
- The `mcpServers` key must be at the top level, not nested.

### Anthropic SDK

- Confirm you're on a current SDK version with MCP support.
- Use `authorization_token` field (not a custom header) — the SDK injects the right `Authorization: Bearer` shape.
- Some agent frameworks have stale MCP support — try a direct SDK call first to isolate.

## Dashboard issues

### Can't add a store

- Did you hit your plan's `max_stores` limit? The dashboard surfaces this.
- Are you signed in to the right Byte8 account? Stores are per-user.

### Don't see usage data yet

- New stores show empty charts until the first call lands.
- Failed calls (4xx, 5xx) *are* logged — they show up in the daily chart's `errorCount` stack.
- The dashboard auto-refreshes via SWR every few seconds; if you don't see updates, hit the manual reload button.

### Lost the API key

There's no way to recover an API key once you've closed the creation dialog. The only path is [rotation](/docs/stores/api-keys#rotating-a-key) — generates a fresh key and invalidates the old one in one step.

## Still stuck?

- Drop the support email a short message with: your store name, the failing tool name (if applicable), the timestamp of the failure (UTC), and any error output: [helo@byte8.io](mailto:helo@byte8.io).
- Include the **Test connection** result from the dashboard — that one signal narrows the debug surface enormously.

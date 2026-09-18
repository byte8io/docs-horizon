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

### `503 Service Unavailable`

The extension is reachable but not serving: code `DISABLED` means the **Enabled** toggle is off, `NOT_CONFIGURED` means no API key has been saved yet.

### `404 Not Found`

The `/horizon/api/v1/*` route isn't mounted in Magento.

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

- Hit `/horizon/api/v1/health` yourself from outside the network with `curl -i -H "X-Horizon-Key: <key>" https://your-store.example/horizon/api/v1/health`. If that's slow too, it's a Magento issue not a Horizon one.
- Check `php-fpm` slow log, OPcache config, and Magento cron load.

## Tool calls return errors

### `Magento unreachable`

Same root causes as a failed connection test. Re-run **Test connection** in the dashboard to confirm.

### Tool returns "not found"

- `get_product` / `get_order` with an unknown identifier return a clean not-found result — the agent should retry with `search_products` / `get_orders` first.
- For anything else, the tool error message carries the HTTP status the extension returned; `var/log/exception.log` on the Magento side usually has the full picture.

### `Rate limit exceeded` (during the free trial)

The 14-day free trial is hard-capped at the plan quota. Once the trial converts, paid tiers switch to soft caps — requests keep serving past quota.

## AI sees stale data

The catalog changed but the agent reports the old state.

- **Search results** stale? The flat index missed the change — bulk imports and SQL-level changes bypass the save observers. Run `bin/magento horizon:reindex`.
- **Product detail / inventory / order** data is read live from Magento on every call, so staleness there points at hitting the wrong store (check `list_stores`) or the change not actually being saved.
- See [Index freshness](/docs/magento-extension/indexer) for the full model.

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
- Failed calls *are* logged — they show up in the daily chart's failed stack.
- The dashboard auto-refreshes periodically (every 30–60 s); if you don't see updates, reload the page.

### Lost the API key

There's no way to recover an API key once you've closed the creation dialog. The only path is [rotation](/docs/stores/api-keys#rotating-a-key) — generates a fresh key and invalidates the old one in one step.

## Still stuck?

- Drop the support email a short message with: your store name, the failing tool name (if applicable), the timestamp of the failure (UTC), and any error output: [helo@byte8.io](mailto:helo@byte8.io).
- Include the **Test connection** result from the dashboard — that one signal narrows the debug surface enormously.

---
sidebar_position: 2
title: Configuration
description: Every Horizon admin config field and what it does.
---

# Configuration reference

Configuration lives at **Stores → Configuration → Byte8 → Horizon** in Magento admin.

## General

| Field | Purpose |
|-------|---------|
| **Enabled** | Master kill switch. `No` returns `503` from `/horizon/api/v1/*` so the gateway treats the store as offline. |
| **API key** | The per-store secret issued by the Horizon dashboard. Paste the value shown once on store creation (or after a [rotation](/docs/stores/api-keys#rotating-a-key)). Stored encrypted in `core_config_data`. |
| **Gateway URL** | The Horizon gateway base URL (`https://horizon.byte8.io`). Used for outbound calls: catalog invalidation webhooks and the [AI Shopping Assistant](/docs/assistant) bootstrap. Leave empty to disable outbound calls. |

The dashboard generates the API key; the admin field just stores it. Anyone who can read `core_config_data` (with the crypt key) can recover it, so treat it as you would any other Magento secret — restrict admin access, rotate after staff turnover.

## AI Shopping Assistant

| Field | Purpose |
|-------|---------|
| **Enabled** | Injects the Horizon assistant chat widget on storefront pages. Widget configuration (publishable key, name, colour) is fetched automatically from the gateway using your API key — enable the assistant for the store in your Horizon dashboard first. See [AI Shopping Assistant](/docs/assistant). |

## CLI

All fields can be set via `bin/magento config:set`:

```bash
bin/magento config:set byte8_horizon/general/enabled 1
bin/magento config:set byte8_horizon/general/api_key 'paste-key-here'
bin/magento config:set byte8_horizon/general/gateway_url 'https://horizon.byte8.io'
bin/magento config:set byte8_horizon/assistant/enabled 1
bin/magento cache:flush config
```

## Verifying the configuration

After saving config:

```bash
bin/magento cache:flush config
curl -i -H "X-Horizon-Key: <your-key>" https://your-store.example/horizon/api/v1/health
```

Expect `200 OK` with a JSON body containing `version` (extension) and `magento_version`. Other responses:

- `503` with code `DISABLED` — the Enabled toggle is off.
- `503` with code `NOT_CONFIGURED` — no API key saved yet.
- `401` with code `UNAUTHORIZED` — key mismatch (or the config cache wasn't flushed — try `cache:clean` as well).

## Next

- [Index freshness](/docs/magento-extension/indexer) — what triggers an index update and when AI sees stale data.

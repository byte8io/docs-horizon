---
sidebar_position: 2
title: Configuration
description: Every Horizon admin config field and what it does.
---

# Configuration reference

Configuration lives at **Stores → Configuration → Byte8 → Horizon** in Magento admin. All fields are scoped to **default** unless your stack genuinely needs per-website overrides (rare).

## General

| Field | Purpose |
|-------|---------|
| **Enabled** | Master kill switch. `No` returns `503` from `/horizon/*` so the gateway treats the store as offline. |
| **API key** | The per-store secret issued by the Horizon dashboard. Paste the value shown once on store creation (or after a [rotation](/docs/stores/api-keys#rotating-a-key)). Stored encrypted in `core_config_data`. |

The dashboard generates the API key; the admin field just stores it. Anyone who can read `core_config_data` can read the key, so treat it as you would any other Magento secret — restrict admin access, rotate after staff turnover.

## Indexer

| Field | Purpose |
|-------|---------|
| **Index mode** | `Update on Save` (real-time) or `Update by Schedule` (cron-driven). Default is `Update by Schedule` for new installs. See [Indexer behaviour](/docs/magento-extension/indexer) for the trade-offs. |
| **Include disabled products** | Default `No`. If `Yes`, products with `status=disabled` still land in the AI index. Usually you want `No` — agents shouldn't recommend products you've explicitly disabled. |
| **Include out-of-stock** | Default `Yes`. Out-of-stock products stay in the index so agents can say *"we have it, just not right now — restock in 5 days"*. Set `No` to hide them entirely. |

## API surface

| Field | Purpose |
|-------|---------|
| **Allowed origins** | Optional CORS allowlist. Defaults to `horizon.byte8.io` only. You usually don't need to change this — the gateway is the only caller. |
| **Rate limit (per minute)** | Soft cap on calls from the gateway. Defaults to `300/min` which comfortably covers the highest paid tier. The gateway already rate-limits per-tenant, so this is belt-and-braces. |

## CLI overrides

Some fields can also be set via `bin/magento config:set`:

```bash
bin/magento config:set byte8_horizon/general/enabled 1
bin/magento config:set byte8_horizon/general/api_key 'paste-key-here' --lock-env
bin/magento config:set byte8_horizon/indexer/mode schedule
bin/magento cache:flush config
```

Using `--lock-env` writes to `env.php` instead of `core_config_data` — useful for keeping production keys out of the database backup. Combined with [Orbit](https://docs.byte8.io/orbit/)'s `config:import` step on deploy, this becomes the canonical way to manage the key alongside other production secrets.

## Verifying the configuration

After saving config:

```bash
bin/magento cache:flush config
curl -i -H "X-Horizon-Key: <your-key>" https://your-store.example/horizon/api/health
```

Expect `200 OK` with a JSON body that includes `magento_version`, `module_version`, `index_count`. If you get `401`, the cache flush didn't take — try `cache:clean` as well.

## Next

- [Indexer behaviour](/docs/magento-extension/indexer) — what triggers a rebuild and when AI sees stale data.

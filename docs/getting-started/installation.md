---
sidebar_position: 2
title: Installation overview
description: What gets installed where — Magento extension on your host, hosted gateway on ours.
---

# Installation overview

Horizon is two halves, installed in two places:

| Component | Where it runs | Who installs it |
|-----------|---------------|-----------------|
| `byte8/module-horizon` (Magento 2 module) | Your Magento server | You, via Composer |
| Horizon MCP gateway | Byte8-hosted, `horizon.byte8.io` | Already running — you just sign up |

You never install the gateway. You install only the Magento module and point it at our hosted endpoint with the API key the dashboard issues.

## System requirements (Magento side)

- **Magento 2.4.6+** (Open Source or Adobe Commerce). Earlier versions probably work but aren't tested.
- **PHP 8.2 / 8.3 / 8.4 / 8.5** — matches the `composer.json` constraint.
- **MSI enabled** (default in 2.4+). The inventory tool reads MSI sources.
- **Outbound HTTPS** to `*.byte8.io`. No inbound ports need to be opened — the gateway pulls from you, not the other way round.

The module depends on:

```text
magento/framework
magento/module-catalog
magento/module-store
magento/module-sales
magento/module-customer
magento/module-inventory-api
byte8/module-core   # shared Byte8 module utilities
```

If `byte8/module-core` isn't in your Composer repo set, add the Byte8 Composer registry (Cargoman) per the install instructions you'll get on first sign-up.

## What the module installs

After `composer require` + `setup:upgrade`:

- A new module `Byte8_Horizon` registered with Magento.
- A read-only JSON API at `/horizon/api/v1/*` (no admin/UI exposure).
- A `byte8_horizon_product_index` flat table (created by `db_schema.xml`), kept fresh by save observers.
- A CLI command `bin/magento horizon:reindex` for full index rebuilds.
- A new admin config section under **Stores → Configuration → Byte8 → Horizon**.

See the [extension configuration page](/docs/magento-extension/configuration) for what each admin field does.

## What you need before installing

You will need:

1. **Composer access on the Magento server.**
2. **The Byte8 Composer registry credentials** (issued on first sign-up).
3. **An admin login** to paste the API key.
4. **CLI access** to run `setup:upgrade` and `horizon:reindex`.

If you're using [Byte8 Orbit](https://docs.byte8.io/orbit/) for deploys, add the package to your `composer.json` and let Orbit's next deploy run `setup:upgrade` for you — no SSH needed.

## What you don't need

- ❌ No long-lived service to keep alive.
- ❌ No webhook endpoint on the Magento side to expose publicly.
- ❌ No model hosting, no embeddings store, no vector DB.
- ❌ No agent-side credentials to manage per merchant — each store gets one API key, period.

## Next

- [First store](/docs/getting-started/first-store) — wiring up the very first store end-to-end with screenshots.
- [Install the extension](/docs/magento-extension/install) — Composer-level detail, troubleshooting Composer auth.

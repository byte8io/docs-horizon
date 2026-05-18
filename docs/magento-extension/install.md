---
sidebar_position: 1
title: Install the extension
description: Composer install for byte8/module-horizon, setup:upgrade, and verifying the route mount.
---

# Install the Magento extension

The Horizon Magento extension is `byte8/module-horizon` — a thin module that mounts an AI-friendly REST API on your Magento store. The hosted gateway calls into this REST surface; agents don't talk to your Magento directly.

## Composer install

From the Magento server:

```bash
composer require byte8/module-horizon
bin/magento setup:upgrade
bin/magento setup:di:compile         # production mode only
bin/magento setup:static-content:deploy  # production mode only
bin/magento cache:flush
```

If you're using [Orbit](https://docs.byte8.io/orbit/) for zero-downtime deploys, just bump `composer.json` and the next deploy handles `setup:upgrade` plus cache flushes automatically.

## Composer registry

`byte8/module-horizon` ships from the **Byte8 Composer registry (Cargoman)**, not Packagist. If your `composer.json` doesn't already have the Byte8 repository configured, add:

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://cargoman.io"
    }
  ]
}
```

Authentication uses HTTP basic auth tokens issued on first Byte8 sign-up. Configure in `auth.json`:

```bash
composer config --global --auth http-basic.cargoman.io <username> <token>
```

If your CI runs Composer (and it should), drop the same credentials into the CI secrets — Orbit users can use a personal access token for this.

## What gets installed

After `setup:upgrade`:

- Module `Byte8_Horizon` is registered.
- Frontend route `horizon` is mounted — i.e. `https://your-store.example/horizon/*`.
- A new table `byte8_horizon_product_index` is created.
- An indexer `byte8_horizon_product` is registered (see [Indexer](/docs/magento-extension/indexer)).
- An admin config section appears at **Stores → Configuration → Byte8 → Horizon**.

## Verify the route is mounted

The simplest smoke test — from anywhere with internet access:

```bash
curl -i https://your-store.example/horizon/api/health
```

You should get a `401` with a JSON body indicating "missing API key". That's correct: the endpoint exists, it just rejected the unauthenticated call. If you get a Magento 404 page, `setup:upgrade` didn't pick up the module — recheck the install.

Once the API key is set in admin (next page), the gateway will start getting `200` from the same endpoint with `X-Horizon-Key: <key>`.

## Updating the extension

```bash
composer update byte8/module-horizon
bin/magento setup:upgrade
bin/magento cache:flush
```

The `RELEASING.md` in the module repo and the [Horizon changelog](/blog) list breaking changes per minor version. We don't ship breaking changes in patch releases.

## Uninstalling

```bash
composer remove byte8/module-horizon
bin/magento setup:upgrade
bin/magento cache:flush
```

This drops the `byte8_horizon_product_index` table and unmounts the route. Your data in the Horizon dashboard (store record, historic usage) is untouched — delete the store from the dashboard separately if you want it gone.

## Next

- [Configuration reference](/docs/magento-extension/configuration) — every admin field, every CLI flag.
- [Indexer behaviour](/docs/magento-extension/indexer) — when AI sees stale data and how to control that.

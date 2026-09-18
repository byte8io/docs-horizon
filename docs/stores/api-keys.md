---
sidebar_position: 2
title: API keys
description: How Horizon API keys work, when to rotate them, and how to recover from a leak.
---

# API keys

Every connected store gets one API key. It's the only credential that lets the Horizon MCP gateway act on behalf of that store — there is no second factor, no per-user variant, no read-only flavour. Treat it as a password.

## What a key is and isn't

- **Is:** a random opaque token (`hz_`-prefixed) generated server-side at store creation or rotation.
- **Is:** stored encrypted at rest and never displayed again after creation.
- **Is:** used on **both halves** of the connection: the AI agent's client sends it to the gateway as `Authorization: Bearer <key>`, and the gateway forwards the same key to your Magento as `X-Horizon-Key` — which is why you paste the same value into Magento admin. Rotating it therefore means updating both agent clients *and* Magento admin.
- **Isn't:** a JWT. There's no expiry, no scope, no issuer claim. Rotation is the only invalidation mechanism.

## Creating a key

A key is generated the moment a store is created in the dashboard. The response shows the cleartext **exactly once** — copy it now, paste it into both:

1. The Magento extension config (`Stores → Configuration → Byte8 → Horizon → API key`).
2. Wherever your agent client reads its bearer token (Claude Desktop config, env var, secret manager).

After you close the dialog or navigate away, the cleartext is gone forever.

## Rotating a key

In the store detail page, click **Rotate API key**. You'll see a confirmation dialog explaining:

- The old key stops working immediately.
- The new key is shown once, same as creation.

Standard playbook after rotation:

1. Copy the new key.
2. Paste into Magento admin config, save, `bin/magento cache:flush config`.
3. Update every agent client that uses this store.
4. Run **Test connection** in the dashboard — green check means everything's wired right.

Rotate when:

- A laptop with the key in plain config is lost / stolen.
- A staff member with admin access leaves.
- The key was committed to a public repository (search GitHub, *now*).
- On a periodic schedule (quarterly is common for production stores).

## Leak response

If you suspect a leak:

1. **Rotate now.** Don't wait for a forensics conclusion — the old key is dead within seconds of rotation.
2. **Check [Usage analytics](/docs/stores/usage-analytics).** Look for spikes outside your normal pattern: unfamiliar tools called, high call volume, unusual time of day.
3. **Audit the recovery path.** Where was the key stored? Was it in env vars on a shared machine? In a CI secret? Tighten as needed.
4. **If you see overage from suspicious traffic on a paid tier**, open a support ticket — we'll review and adjust the bill if the activity isn't yours.

## Multi-environment patterns

Two valid approaches:

### One store per environment

Add `acme-prod` and `acme-staging` as separate stores in the dashboard. Each has its own key, its own quota usage, its own connection state. Agents pointed at staging never see prod data.

This is the recommended pattern. It costs nothing extra (a Pro plan still allows 3 stores) and the isolation is absolute.

### Single store, different base URLs per environment

Possible but discouraged. You'd reuse one Horizon row and only point the `base_url` at one Magento at a time. Switching loses connection history and confuses usage analytics. Not worth the saved row.

## Programmatic key management

The GraphQL admin API exposes both `createStore` (returns `StoreWithApiKey`) and `rotateStoreApiKey` (returns `StoreWithApiKey`). Both surfaces require an authenticated session — there's no API-key-driven way to mint a new API key (that would defeat the point).

See [GraphQL API](/docs/api/graphql) for the full schema.

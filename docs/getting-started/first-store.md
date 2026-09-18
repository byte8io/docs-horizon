---
sidebar_position: 3
title: First store
description: End-to-end walkthrough of connecting your first Magento store to Horizon, with the connection test and first MCP call.
---

# Your first store

This page assumes the [Magento extension is installed](/docs/magento-extension/install). Here you'll connect that store to Horizon, verify the connection, and run your first MCP tool call.

## 1. Add the store in the Horizon dashboard

In [horizon.byte8.io/dashboard/stores](https://horizon.byte8.io/dashboard/stores), click **Add store**.

Two required fields:

- **Name** — a label that's only ever shown to you. Pick something that distinguishes prod from staging from a sibling brand: *"Acme UK prod"*, *"Acme DE staging"*, *"Northwind multistore"*. You can rename later.
- **Base URL** — the storefront URL. No trailing slash. Example: `https://shop.acme.example`. Must be reachable from the Horizon gateway — public DNS, valid TLS.

On save, the dashboard generates the store record and returns the **API key one time only**. There is no "show key" option later — only [key rotation](/docs/stores/api-keys#rotating-a-key) replaces a forgotten or leaked key.

## 2. Paste the API key into Magento admin

Back in Magento admin: **Stores → Configuration → Byte8 → Horizon**.

- **API key** — paste it.
- **Gateway URL** — `https://horizon.byte8.io`.
- **Enabled** — set to `Yes`.
- Save config.

Flush the configuration cache:

```bash
bin/magento cache:flush config
```

## 3. Run the index

The first rebuild fills the AI-friendly flat product table:

```bash
bin/magento horizon:reindex
```

After that, save observers keep the index fresh automatically — no cron or Index Management configuration needed. See the [index freshness page](/docs/magento-extension/indexer).

## 4. Test the connection

In the Horizon dashboard, open the store and click **Test connection**. The gateway makes a `GET /horizon/api/v1/health` call to your Magento using the API key. You should see:

- ✅ A green check
- The Magento version and extension version reported by the store

If you see red, the dashboard shows the HTTP status it got back. Most common causes:

- **401** — API key mismatch (recheck both sides). **503** — module disabled or key not yet saved on the Magento side.
- **404** — the `/horizon/api/v1/*` route isn't mounted (did you run `setup:upgrade`?).
- **DNS / TLS error** — the base URL isn't reachable from the public internet. The gateway can't reach a private staging environment unless it's behind a public TLS endpoint.

## 5. Make your first MCP call

Use any MCP client. With the Anthropic SDK's MCP connector (beta):

```python
from anthropic import Anthropic

client = Anthropic()

response = client.beta.messages.create(
    model="claude-sonnet-5",
    max_tokens=1024,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[
        {
            "type": "url",
            "url": "https://horizon.byte8.io/mcp",
            "name": "horizon",
            "authorization_token": "YOUR_API_KEY_HERE",
        }
    ],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "horizon"}],
    messages=[
        {"role": "user", "content": "Search the Acme catalog for hiking jackets in stock."}
    ],
)
```

The agent will call `search_products` against your store. You'll see the call land in **Dashboard → Usage** within seconds.

## What's next

- [Connecting Claude Desktop](/docs/mcp/connecting-claude) — for human-driven exploration of your store via Claude's chat UI.
- [MCP tools reference](/docs/mcp/tools) — every tool, every argument.
- [Usage analytics](/docs/stores/usage-analytics) — see which tools agents call most, plan for your tier.

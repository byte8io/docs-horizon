---
sidebar_position: 1
title: Quick start
description: From zero to your first MCP tool call against a real Magento store in under 30 minutes.
---

# Quick start

Goal: get an AI agent making real MCP calls into your Magento catalog. Three steps, roughly thirty minutes if you're already comfortable with Composer and Magento admin.

## 1. Create a Horizon account

Sign up at [horizon.byte8.io](https://horizon.byte8.io). If you already have a Byte8 account (Pulsar or Orbit user), the same login works — Horizon access is granted via [byte8.io/products/horizon](https://byte8.io/products/horizon#pricing) checkout.

Every plan starts with a **14-day free trial** — full Pro-tier features, hard-capped at the plan quota during the trial so there are no surprise charges.

## 2. Install the Magento extension

On the server running Magento:

```bash
composer require byte8/module-horizon
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy
bin/magento cache:flush
```

Then in Magento admin, go to **Stores → Configuration → Byte8 → Horizon** and:

- Paste the **API key** you get from the next step (we'll come back to this).
- Set **Gateway URL** to `https://horizon.byte8.io`.
- Click **Save Config**.
- Build the flat AI-index table once:

```bash
bin/magento horizon:reindex
```

Full walkthrough: [Install the extension](/docs/magento-extension/install).

## 3. Add the store in the Horizon dashboard

At [horizon.byte8.io/dashboard/stores](https://horizon.byte8.io/dashboard/stores), click **Add store**:

- **Name** — anything memorable (e.g. *"Acme UK Production"*).
- **Base URL** — your storefront URL, no trailing slash (e.g. `https://shop.acme.example`).

On save, the dashboard shows you the API key **exactly once**. Copy it now — there's no way to retrieve it later, only [rotate](/docs/stores/api-keys#rotating-a-key) to a new one.

Paste this key back into Magento admin (step 2), save config, and click **Test connection** in the dashboard. You should see a green check plus the Magento version.

## 4. Make your first MCP call

The hosted gateway lives at `https://horizon.byte8.io/mcp` (Streamable HTTP transport). Point any MCP client at it with your API key as a **bearer token**:

```json
{
  "mcpServers": {
    "horizon": {
      "transport": "http",
      "url": "https://horizon.byte8.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

For Claude Desktop specifically, follow [Connecting Claude](/docs/mcp/connecting-claude) — same idea, packaged for the Desktop config.

Test it with the `ping` tool, then try:

```
search_products(query: "running shoes", limit: 5)
```

The agent should respond with five product summaries from your catalog. If it doesn't, the connection-test step above told you what's wrong — see [Troubleshooting](/docs/troubleshooting) if not.

## What's next

- [Connect Claude Desktop](/docs/mcp/connecting-claude) end-to-end.
- [Browse the full tool surface](/docs/mcp/tools).
- [Read about API key hygiene](/docs/stores/api-keys) — rotation, revocation, multi-environment patterns.
- [Understand the indexer](/docs/magento-extension/indexer) so you know when AI sees stale data.

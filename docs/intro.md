---
sidebar_position: 1
title: What is Horizon?
description: A hosted MCP gateway that makes your Magento 2 catalog discoverable to AI agents like Claude and ChatGPT.
slug: /
---

# What is Horizon?

**Horizon is an MCP (Model Context Protocol) gateway for Magento 2.** It puts a thin, AI-friendly interface in front of your store so Claude, ChatGPT, agent frameworks, and any other MCP-aware client can search products, read inventory, look up orders, and quote real prices in real time.

## How it's wired

Two pieces:

1. **A thin Magento extension** (`byte8/module-horizon`) installs into your store via Composer. It mounts a small REST API under `/horizon/*` and maintains a flat AI-friendly product index — denormalised out of Magento's EAV so AI agents read fast, focused rows.
2. **The hosted MCP gateway** at [`horizon.byte8.io`](https://horizon.byte8.io) terminates the MCP protocol at `/mcp` (Streamable HTTP via [rmcp](https://github.com/modelcontextprotocol/rust-sdk)), authenticates the agent, fetches data from your store using the API key you paste in once, and returns AI-shaped responses.

You don't run anything long-lived. Install the extension, paste the key, connect Claude.

## What you can do with it

Out of the box, agents get eight tools that map cleanly onto a Magento storefront:

| Tool | What an agent uses it for |
|------|---------------------------|
| `ping` | Quick connectivity check while setting up the integration. |
| `search_products` | "Show me black hiking jackets under £200, in stock now." |
| `get_product` | Full detail for a SKU — descriptions, prices, images, attributes. |
| `get_categories` | Walk the category tree to ground a recommendation. |
| `get_inventory` | Read MSI source stock before promising delivery. |
| `get_orders` | Customer self-service: "where's my order?" |
| `get_order` | Drill into a specific increment ID. |
| `get_customers` | Look up an account by email or name. |

See the [MCP tools reference](/docs/mcp/tools) for the full signature of each (plus two utility tools, `ping` and `list_stores`).

## The AI Shopping Assistant

Beyond making your catalog visible to *external* AI agents, Horizon ships an **on-site AI Shopping Assistant** — a chat widget on your own storefront that answers product and order-status questions from your live catalog, hosted end-to-end by Byte8. One toggle in the dashboard, one toggle in Magento admin. See [AI Shopping Assistant](/docs/assistant).

## Where Horizon fits

- ✅ **Magento 2 / Adobe Commerce stores** with a real catalog and traffic.
- ✅ **B2B and B2C.** One Horizon store maps to one storefront base URL — connect sibling brands or regions as separate stores.
- ✅ **Agency-managed stacks** — one Agency plan covers up to 15 stores.
- ⚠️ **Magento 1** is not supported.
- ⚠️ **Headless / non-Magento storefronts** — out of scope for now.

## Where to start

| You want to... | Go to |
|---|---|
| Get a store connected in under 30 min | [Quick start](/docs/getting-started/quick-start) |
| Install the Magento extension | [Install the extension](/docs/magento-extension/install) |
| Understand the MCP gateway shape | [MCP overview](/docs/mcp/overview) |
| Connect Claude / Claude Desktop | [Connecting Claude](/docs/mcp/connecting-claude) |
| Put an AI assistant on your storefront | [AI Shopping Assistant](/docs/assistant) |
| Rotate or revoke a leaked API key | [API keys](/docs/stores/api-keys) |
| Diagnose a failed tool call | [Troubleshooting](/docs/troubleshooting) |

## Pricing

Usage-based on store count and monthly API calls. Soft caps with overage billing — we never return `429` to an AI in production because invisibility is the whole problem we're solving. See [byte8.io/products/horizon](https://byte8.io/products/horizon#pricing) for the live tier matrix.

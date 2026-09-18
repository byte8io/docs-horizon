---
sidebar_position: 5
title: AI Shopping Assistant
description: An on-site AI chat assistant for your storefront, answering product and order questions from your live catalog.
---

# AI Shopping Assistant

Horizon includes an **on-site shopping assistant**: a chat widget on your storefront that answers shopper questions — *"do you have this in stock?"*, *"where's my order?"* — grounded in your live catalog through the same read-only access the MCP gateway uses. Byte8 hosts the AI; you don't bring your own model or API keys.

Works on Luma, Hyvä, and custom themes — the widget is a self-contained script tag, no theme integration required.

## Enable it (two switches)

1. **Horizon dashboard → Assistant**: pick the store, toggle **Enabled**, optionally set the assistant's name, accent colour, and custom instructions (tone, policies, greeting). This generates the store's *publishable key* — you don't need to copy it anywhere.
2. **Magento admin → Stores → Configuration → Byte8 → Horizon → AI Shopping Assistant → Enabled = Yes** (requires **Gateway URL** and **API key** set under General). The extension fetches the widget configuration from the gateway automatically and injects the widget on every storefront page.

Config is cached for 1 hour on the Magento side — run `bin/magento cache:flush` to pick up dashboard changes immediately.

## What it can do

- Search products, quote prices and stock from live tool calls — it only states catalog facts returned by your store, and says so when it can't find something.
- Order status lookup — **only** when the shopper provides both their order number *and* the email used at checkout, verified server-side. The response is limited to status, items, and totals; addresses, payment details, and names are never exposed.
- Follow your **custom instructions** for tone and store policies.

## What it deliberately can't do

- No cart, checkout, refunds, or order changes — it's read-only and says so, directing shoppers to your contact channels.
- No access to customer accounts or order lists — the two-field order lookup is the only order surface.
- Off-topic questions are politely declined.

## Privacy & security

- The widget embeds a **publishable key** (`hzp_…`) that only grants assistant chat for your store — it cannot call MCP tools or the admin API. Rotate it any time from the dashboard.
- Conversations are scoped to the shopper's own browser session.
- Wrong order-number/email combinations return a neutral "not found" — order numbers can't be probed.

## Transcripts & usage

**Dashboard → Assistant → Conversations** lists every conversation with the full transcript, which tools the assistant called, and token usage. Assistant messages are metered separately from MCP API calls, against your plan's monthly assistant-message quota.

## GraphQL

Settings and transcripts are scriptable via the [admin API](/docs/api/graphql): `assistantSettings`, `conversations` (cursor-paginated), `conversation`, `updateAssistantSettings`, and `rotateAssistantKey` (returns the publishable key — shown once).

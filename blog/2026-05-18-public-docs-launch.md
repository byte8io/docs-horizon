---
slug: public-docs-launch
title: Horizon docs go public
authors: [byte8]
tags: [docs, launch]
---

The public docs are live at [docs.byte8.io/horizon](https://docs.byte8.io/horizon/). One stop for the full Horizon story — what it is, how the gateway fits in front of your Magento 2 store, every MCP tool, every dashboard knob.

<!-- truncate -->

## What's covered

- **[Quick start](/docs/getting-started/quick-start)** — zero to first MCP tool call in under 30 minutes.
- **[The Magento extension](/docs/magento-extension/install)** — Composer install, configuration, indexer behaviour.
- **[MCP gateway](/docs/mcp/overview)** — Streamable HTTP transport, eight tools, connecting Claude / SDKs / agent frameworks.
- **[Stores & usage](/docs/stores/overview)** — managing connected stores, rotating API keys, reading usage analytics.
- **[API](/docs/api/graphql)** — GraphQL admin API and webhook payloads for catalog invalidation.
- **[Troubleshooting](/docs/troubleshooting)** — the failure modes we've seen, what fixes them.

## What's coming next

- **Stripe metered billing.** Usage counts already land in `usage_logs`; the meter push is in flight.
- **Catalog-change webhook notifications.** Push events back to the merchant when AI activity triggers an inventory or pricing shift.
- **Multi-store MCP sessions.** One agent connection that can address multiple stores under one tenant — useful for agency seats covering multiple clients.
- **Byte8 Bundle discount.** 20% off Horizon when you also run Orbit (zero-downtime deploys) and Pulsar (monitoring) on the same account.

## Found a doc bug?

Each page has an **Edit this page** link in the footer that drops you straight into the right file on GitHub. PRs welcome.

## How to follow along

This changelog is the canonical update stream. RSS / Atom feed buttons at the top of [the changelog index](/blog).

For the Magento extension's release notes specifically, watch [byte8io/module-horizon releases](https://github.com/byte8io/module-horizon/releases).

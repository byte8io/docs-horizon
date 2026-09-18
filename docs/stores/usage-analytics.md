---
sidebar_position: 3
title: Usage analytics
description: Understand where your MCP calls are going — daily volume, tool mix, per-store breakdown, and quota planning.
---

# Usage analytics

Every MCP tool invocation lands in `usage_logs`. The dashboard's **Usage** page renders that data three ways so you can plan capacity, spot anomalies, and pick the right pricing tier.

## What's tracked

For every call:

| Field | Use |
|-------|-----|
| `store_id` | Which connected store the call targeted. |
| `tool_name` | Which of the 8 MCP tools was invoked. |
| `execution_time_ms` | End-to-end gateway latency for that call. |
| `success` | Did the tool return successfully? |
| `created_at` | Timestamp, used for the daily and time-series views. |

Note: the **arguments** to the call are not stored. We log *that* `search_products` was called, not the query string. This is by design — your customers' search history shouldn't be queryable from Horizon, and our DB isn't a target for catalog data exfiltration.

## The three views

### Daily volume

An area chart over the last N days (selectable: 7, 30, 90). Shows total calls per day, plus a stacked breakdown by `success` so you can see error bursts.

Plan-tier analytics retention (how far back you can query):

| Tier | Retention |
|------|-----------|
| Starter | 30 days |
| Pro | 90 days |
| Agency | 180 days |
| Enterprise | Custom |

### Tool mix

A bar chart showing call counts per tool. Typical healthy mix for a B2C store:

- `search_products`: 50-60%
- `get_product`: 25-30%
- `get_inventory`: 10%
- everything else: the long tail

If `ping` is suddenly your top tool, something's wrong with an agent client's keepalive — investigate.

### Per-store

A pie chart breaking down call volume across your connected stores. Useful for Agency tier customers running many merchants.

## Quota & overage

Your **account's** current month sits against the plan's monthly cap (the quota is account-wide across all your stores; the per-store view shows where the calls came from). The dashboard shows:

- **Used** — calls made this month.
- **Quota** — monthly cap.
- **Remaining** — quota minus used.
- **Overage** — calls beyond quota (paid tiers only — the free trial is hard-capped).

When usage approaches the quota, the dashboard surfaces a warning. Past 100% on a paid tier, calls continue and the excess is tracked.

Overage pricing is $5 per 1,000 calls (see [pricing](https://byte8.io/products/horizon#pricing)). **Automated overage billing is coming soon** — until it ships, overage is settled per your plan terms rather than charged automatically.

## Reading the data programmatically

Three GraphQL queries surface the same data:

- `usageAnalytics(days: Int)` — aggregate across all stores. Returns daily, per-tool, per-store rollups.
- `storeUsageAnalytics(storeId: ID!, days: Int)` — same shape but scoped to one store.
- `rateLimitStatus` — current month usage vs quota for billing-tier decisions.

See [GraphQL API](/docs/api/graphql) for the full type definitions.

## Capacity planning

A rough rule of thumb for picking a tier (account-wide):

- **< 300 calls / day** → Starter (10k / month).
- **300 – 3,000 calls / day** → Pro (100k / month).
- **3,000 – 15,000 calls / day** → Agency (500k / month, often for one or two heavy stores).
- **> 15,000 calls / day**, dedicated isolation, or compliance requirements → Enterprise.

If you're consistently in the overage band, upgrading is cheaper than the marginal $5/1k — the dashboard surfaces the break-even comparison.

## Anomaly detection

We don't ship automated anomaly alerts yet — they're on the [roadmap](https://byte8.io/products/horizon) under "Webhook notifications for catalog changes" and an upcoming "Unusual usage" alert. For now, eyeball the daily chart weekly; sudden 10× spikes correlate strongly with either a key leak or an agent client misconfiguration (infinite retry loop on a transient error).

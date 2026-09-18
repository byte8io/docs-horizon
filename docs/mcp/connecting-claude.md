---
sidebar_position: 2
title: Connecting Claude
description: Wire up Claude Desktop, the Anthropic SDK, or any MCP-aware client to your Horizon-connected Magento store.
---

# Connecting Claude

Horizon speaks the standard MCP Streamable HTTP transport, so anything that consumes MCP can connect. The recipes below cover the three most common entry points.

## Prerequisites

- A store added in [horizon.byte8.io/dashboard/stores](https://horizon.byte8.io/dashboard/stores).
- The store's API key (issued on creation — if you've lost it, [rotate](/docs/stores/api-keys#rotating-a-key)).
- A passing **Test connection** in the dashboard.

## Claude Desktop

Open Claude Desktop and go to **Settings → Developer → Edit Config**. Add a server block:

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

Save and restart Claude Desktop. The Horizon tools (`search_products`, `get_product`, etc.) appear in the tool drawer.

Try a query like *"Search the Acme catalog for hiking jackets in stock under £200"* — Claude will pick `search_products`, the call will land in your [usage analytics](/docs/stores/usage-analytics) within seconds.

### Multiple stores

Add one entry per store with a distinct key:

```json
{
  "mcpServers": {
    "acme-uk": {
      "transport": "http",
      "url": "https://horizon.byte8.io/mcp",
      "headers": { "Authorization": "Bearer KEY_FOR_ACME_UK" }
    },
    "acme-de": {
      "transport": "http",
      "url": "https://horizon.byte8.io/mcp",
      "headers": { "Authorization": "Bearer KEY_FOR_ACME_DE" }
    }
  }
}
```

Each key resolves to a different `stores` row server-side, so the two are fully isolated even though they hit the same endpoint.

## Anthropic SDK (Python)

If you're building an agent rather than chatting, use the SDK's MCP connector (beta — note the beta flag and the `mcp_toolset` entry, both required):

```python
from anthropic import Anthropic

client = Anthropic()

response = client.beta.messages.create(
    model="claude-sonnet-5",
    max_tokens=2048,
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
        {
            "role": "user",
            "content": "Find me three popular running shoes in stock, with prices.",
        }
    ],
)

for block in response.content:
    print(block)
```

The SDK forwards `authorization_token` as an `Authorization: Bearer` header — which is exactly what the `/mcp` endpoint expects. (`X-Horizon-Key` is a different header, used only between your Magento store and the gateway.)

## Anthropic SDK (TypeScript)

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.beta.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 2048,
  betas: ["mcp-client-2025-11-20"],
  mcp_servers: [
    {
      type: "url",
      url: "https://horizon.byte8.io/mcp",
      name: "horizon",
      authorization_token: process.env.HORIZON_API_KEY!,
    },
  ],
  tools: [{ type: "mcp_toolset", mcp_server_name: "horizon" }],
  messages: [
    { role: "user", content: "What's the stock level for SKU ABC-123?" },
  ],
});

console.log(response.content);
```

## Other agent frameworks

Anything that speaks MCP Streamable HTTP works. Two patterns:

- **Frameworks with native MCP client support** (LangGraph, AutoGen, Mastra, etc.): point them at `https://horizon.byte8.io/mcp` and set `Authorization: Bearer <key>` in their HTTP transport config.
- **Frameworks without MCP support yet**: call the gateway's MCP endpoint directly over JSON-RPC. The full transport spec is at [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports).

## Sanity-check call

Once your client is configured, the smallest possible call to verify everything:

```
ping(message: "hello")
```

You should see the response *"pong: hello"* (or just *"pong"* with no echo) and a row in **Dashboard → Usage** with `tool_name=ping`.

## Common setup pitfalls

| Symptom | Fix |
|---------|-----|
| Tools don't appear in Claude Desktop | Config didn't parse; check the file with `jq` and restart Claude Desktop. |
| Every call returns `401` | Wrong API key, or the key was rotated and you're using the old one. |
| Tools appear but every call returns `Magento unreachable` | The gateway can reach our auth, but not your store. Check the [connection test](/docs/getting-started/first-store#4-test-the-connection). |
| Calls work but data is stale | The Magento indexer hasn't caught up — see [Indexer behaviour](/docs/magento-extension/indexer). |

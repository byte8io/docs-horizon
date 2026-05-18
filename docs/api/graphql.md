---
sidebar_position: 1
title: GraphQL admin API
description: The Horizon dashboard's GraphQL endpoint — store management, connection testing, key rotation, usage analytics.
---

# GraphQL admin API

The Horizon dashboard is backed by an `async-graphql` admin API. The same API is available to you for scripting bulk store onboarding, rotating keys across many stores, or pulling usage data into your own dashboards.

## Endpoint

```
POST https://horizon.byte8.io/graphql
```

`GET` the same URL for the GraphiQL playground (development convenience — disabled in some environments).

## Authentication

Authenticated via the Byte8 platform's session cookie (`byte8.session_token`) issued by [auth.byte8.io](https://auth.byte8.io). The dashboard's browser already has this cookie; for server-to-server scripting you'll need to use a Personal Access Token (issued from your Byte8 account settings — same flow as Orbit).

This is **separate from** the MCP `X-Horizon-Key` header. The admin API authorises *you the operator* to manage stores; the MCP API authorises *an agent* to call into a specific store.

## Schema overview

### Queries

```graphql
type Query {
  # Stores
  stores: [Store!]!
  store(id: ID!): Store

  # Dashboard rollups
  dashboardStats: DashboardStats!

  # Usage
  usageAnalytics(days: Int!): UsageAnalytics!
  storeUsageAnalytics(storeId: ID!, days: Int!): UsageAnalytics!
  rateLimitStatus: RateLimitStatus!
}
```

### Mutations

```graphql
type Mutation {
  createStore(input: CreateStoreInput!): StoreWithApiKey!
  updateStore(id: ID!, input: UpdateStoreInput!): Store!
  deleteStore(id: ID!): Boolean!
  testStoreConnection(id: ID!): StoreConnectionStatus!
  rotateStoreApiKey(id: ID!): StoreWithApiKey!
}
```

### Key types

```graphql
type Store {
  id: ID!
  name: String!
  baseUrl: String!
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}

# Only returned by createStore and rotateStoreApiKey — the cleartext key is
# shown to you exactly once.
type StoreWithApiKey {
  store: Store!
  apiKey: String!
}

type StoreConnectionStatus {
  reachable: Boolean!
  magentoVersion: String
  moduleVersion: String
  latencyMs: Int
  error: String
}

input CreateStoreInput {
  name: String!
  baseUrl: String!
}

input UpdateStoreInput {
  name: String
  baseUrl: String
  isActive: Boolean
}
```

## Worked examples

### List your stores

```graphql
query {
  stores {
    id
    name
    baseUrl
    isActive
  }
}
```

### Add a new store

```graphql
mutation {
  createStore(input: {
    name: "Acme UK Production"
    baseUrl: "https://shop.acme.example"
  }) {
    store { id name baseUrl }
    apiKey      # capture this — shown once
  }
}
```

### Test connection

```graphql
mutation {
  testStoreConnection(id: "abc-123-def-456") {
    reachable
    magentoVersion
    moduleVersion
    latencyMs
    error
  }
}
```

### Rotate a key

```graphql
mutation {
  rotateStoreApiKey(id: "abc-123-def-456") {
    apiKey      # new key — old one is dead
  }
}
```

### Pull daily usage

```graphql
query {
  usageAnalytics(days: 30) {
    totalCalls
    daily { date count successCount errorCount }
    byTool { toolName count }
    byStore { storeId storeName count }
  }
}
```

## Error model

Errors follow the platform convention (see the root `CLAUDE.md`):

- Transport errors return `async_graphql::Error` with a `code` extension — `NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`, `INTERNAL`, `PROVIDER_ERROR`.
- Field-scoped validation errors return inside the payload as `errors: [FieldError!]!` so a client can red-underline a specific field rather than parse exception text.

## Rate limits

The admin API is rate-limited per session, generously (you should never hit it from interactive use). Bulk scripts (e.g. creating 50 stores at once) should add a small sleep between calls; we may tighten this if abuse appears.

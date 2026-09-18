---
sidebar_position: 1
title: GraphQL admin API
description: The Horizon dashboard's GraphQL endpoint — store management, connection testing, key rotation, usage analytics.
---

# GraphQL admin API

The Horizon dashboard is backed by an `async-graphql` admin API. The same API is available for scripting store onboarding, rotating keys, or pulling usage data into your own dashboards.

## Endpoint

```
POST https://horizon.byte8.io/graphql
```

`GET` the same URL serves the GraphiQL playground.

## Authentication

Authenticated via the Byte8 platform's session cookie (`byte8.session_token`) issued by [app.byte8.io](https://app.byte8.io). The dashboard's browser already has this cookie. Header-token access for server-to-server scripting (Personal Access Tokens) is **coming soon** — today the API is session-cookie only.

This is **separate from** the MCP bearer key. The admin API authorises *you the operator* to manage stores; the MCP API authorises *an agent* to call into a specific store.

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
  usageAnalytics(days: Int): UsageAnalytics!
  storeUsageAnalytics(storeId: ID!, days: Int): UsageAnalytics!
  rateLimitStatus: RateLimitInfo!

  # AI Shopping Assistant
  assistantSettings(storeId: ID!): AssistantSettings
  conversations(storeId: ID!, first: Int, after: String): ConversationConnection!
  conversation(id: ID!): ConversationDetail
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

  # AI Shopping Assistant
  updateAssistantSettings(storeId: ID!, input: UpdateAssistantSettingsInput!): AssistantSettings!
  rotateAssistantKey(storeId: ID!): AssistantSettingsWithKey!
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
# shown to you exactly once. Same fields as Store, plus the key.
type StoreWithApiKey {
  id: ID!
  name: String!
  baseUrl: String!
  apiKey: String!
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}

type StoreConnectionStatus {
  connected: Boolean!
  extensionVersion: String
  magentoVersion: String
  error: String
}

type UsageAnalytics {
  daily: [DailyUsage!]!        # date, totalCalls, successfulCalls, failedCalls, avgExecutionTimeMs
  byTool: [ToolUsage!]!        # toolName, totalCalls, successfulCalls, failedCalls, avgExecutionTimeMs
  byStore: [StoreUsage!]!      # storeId, storeName, totalCalls
  totalCalls: Int!
  totalSuccessful: Int!
  totalFailed: Int!
  avgExecutionTimeMs: Float!
}

type RateLimitInfo {
  planId: String!
  currentUsage: Int!
  monthlyLimit: Int!
  overLimit: Boolean!
  hardCap: Boolean!
  usageRatio: Float!
  maxStores: Int!
  currentStores: Int!
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

Assistant types (`AssistantSettings`, `ConversationConnection` — a Relay-style
cursor connection — and `ConversationDetail` with the full transcript) are
documented on the [assistant page](/docs/assistant).

## Worked examples

### List your stores

```graphql
query {
  stores { id name baseUrl isActive }
}
```

### Add a new store

```graphql
mutation {
  createStore(input: {
    name: "Acme UK Production"
    baseUrl: "https://shop.acme.example"
  }) {
    id
    name
    apiKey      # capture this — shown once
  }
}
```

### Test connection

```graphql
mutation {
  testStoreConnection(id: "abc-123-def-456") {
    connected
    extensionVersion
    magentoVersion
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
    daily { date totalCalls successfulCalls failedCalls }
    byTool { toolName totalCalls }
    byStore { storeId storeName totalCalls }
  }
}
```

## Error model

- Unauthenticated / unauthorised requests return a GraphQL error with a `code` extension (`UNAUTHENTICATED`, `FORBIDDEN`).
- Not-found and validation problems surface as standard GraphQL errors with a message you can display directly.

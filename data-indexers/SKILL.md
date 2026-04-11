---
name: stellarskills-data-indexers
description: Data indexers and analytics tools for Stellar — Mercury, Hubble (BigQuery), SubQuery, Goldsky, Zephyr, and other historical data access options.
---

# STELLARSKILLS — Data Indexers

> Data indexers and analytics tools for querying historical and real-time data from the Stellar network.

---

## Why Indexers?

Stellar RPC retains event history for a limited window (typically **7 days**). For historical queries, analytics dashboards, or complex aggregation, you need dedicated **indexers**.

---

## Available Indexers

| Indexer | Type | Best For |
|---------|------|----------|
| **Mercury** | WASM-based | Custom indexing logic, event processing |
| **SubQuery** | GraphQL API | Complex queries, dashboard data |
| **Goldsky** | Managed indexer | Production indexing, Mirror pipelines |
| **Zephyr VM** | WASM-based | Real-time event streams |
| **Hubble** (BigQuery) | SQL analytics | Historical data analysis, reporting |

---

## Hubble (Stellar Data Lake)

SDF maintains a public BigQuery dataset called **Hubble** containing historical Stellar data accessible via SQL.

- **Access**: Available through Google Cloud Platform BigQuery
- **Data**: Ledgers, transactions, operations, assets, accounts
- **Cost**: Free tier available for small queries

---

## RPC Limitation Workaround

For queries that need data beyond the 7-day RPC retention:

1. **Use an indexer** (Mercury, SubQuery) for event/history queries
2. **Use `getLedgers`** on Stellar RPC — this method can query back to genesis via Data Lake integration
3. **Use Horizon** for classic protocol historical data (note: SDF-hosted Horizon truncates to 1 year as of Aug 2024)

---

## Official documentation

- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Horizon (legacy): https://developers.stellar.org/docs/data/apis/horizon  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/data-indexers — MIT License*

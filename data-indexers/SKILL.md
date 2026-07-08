---
name: stellarskills-data-indexers
description: Querying historical and real-time Stellar data — Mercury, Hubble BigQuery, SubQuery, Allium, Goldsky, The Graph, and RPC limitations.
---

# STELLARSKILLS — Data Indexers

> Querying historical and real-time Stellar data beyond RPC's 7-day window.

---

## When to use

- Querying transaction history older than 7 days
- Building analytics dashboards or reporting pipelines
- Aggregating contract events across thousands of ledgers
- Streaming real-time ledger updates to a custom backend
- Pre-computing and exporting ledger metadata to a data lake

---

## Quick reference

| Tool | Type | Best for | Access |
|------|------|----------|--------|
| **Mercury** | WASM / Portfolio | Soroban event filtering, Portfolio APIs | Hosted or Self-hosted |
| **Hubble** | BigQuery SQL | Historical analytics, bulk aggregation | Google Cloud (free tier) |
| **SubQuery** | GraphQL / Decentralized | Complex queries, dashboard backends | SubQuery hosted or self-hosted |
| **Allium** | Portfolio / ETL | Off-the-shelf APIs, Custom ETL | Hosted API |
| **Goldsky Mirror**| ETL Pipeline | Streaming data to custom db | Hosted Pipeline |
| **The Graph** | Substreams | Streaming & transforming data | Hosted |
| **Space and Time** | Proof of SQL | Tamper-proof, Zero-Knowledge compute | Hosted / Enterprise |
| **OBSRVR** | API / ETL | Portfolio APIs, Flow ETL without pipelines | Hosted |
| **OnFinality** | Infra Hosting | Hosting SubQuery logic | Hosted Infrastructure |
| **Horizon** | REST API | Classic protocol history (1 year) | SDF-hosted or self-hosted |
| **Stellar RPC** | JSON-RPC | Live state, recent events (7 days) | Various providers |

---

## RPC limitation

Stellar RPC retains event history for approximately **7 days**. Three options to access older data:

1. **Mercury** or **SubQuery** — custom indexing
2. **`getLedgers`** on RPC — queries back to genesis via Data Lake integration
3. **Horizon** — classic protocol history (SDF-hosted truncates to ~1 year)

---

## Mercury

Mercury runs WASM scripts on Stellar RPC that process ledger data and output custom events. Good for filtering and transforming events at the source.

### WASM script (Rust)

```rust
use mercure::wasm::*;
use soroban_sdk::{contracttype, BytesN, Env};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct PaymentEvent {
    pub from: BytesN<32>,
    pub to: BytesN<32>,
    pub amount: i128,
    pub asset: BytesN<32>,
}
```

```rust
#[no_mangle]
pub fn on_close(env: Env) {
    let reader = EnvReader::new(&env);
    for tx in reader.read_txs().iter() {
        for event in tx.events.iter() {
            if event.topic_0 == symbol_short!("transfer") {
                log_event(&env, &event);
            }
        }
    }
}
```

Build to WASM and deploy via Mercury CLI:
```bash
cargo build --target wasm32-unknown-unknown --release
mercury script deploy target/wasm32-unknown-unknown/release/my_indexer.wasm
```

---

## Hubble (Stellar Data Lake)

SDF-maintained public BigQuery dataset. Free tier available. Covers ledgers, transactions, operations, assets, and accounts from genesis.

### Example queries

Top 10 accounts by transaction count:
```sql
SELECT
  account_id,
  COUNT(*) AS tx_count
FROM `crypto-stellar.stellar.history_transactions`
GROUP BY account_id
ORDER BY tx_count DESC
LIMIT 10;
```

Daily USDC transfer volume (last 30 days):
```sql
SELECT
  DATE(ledger_closed_at) AS day,
  SUM(amount) / 10000000 AS volume_xlm
FROM `crypto-stellar.stellar.history_operations`
WHERE type = 'payment'
  AND asset_code = 'USDC'
  AND DATE(ledger_closed_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY day
ORDER BY day;
```

Access: Google Cloud Console → BigQuery → `crypto-stellar.stellar.*`

---

## SubQuery

GraphQL-based indexer. Define a manifest and handler functions to index any Soroban event into queryable entities.

### manifest.yaml

```yaml
specVersion: 1.0.0
name: stellar-usdc-indexer
network:
  endpoint: wss://soroban-rpc.stellar.org:443
dataSources:
  - kind: stellar/Runtime
    startBlock: 100000
    mapping:
      file: ./dist/index.js
      handlers:
        - handler: handleTransfer
          kind: stellar/Event
          filter:
            type: contract
            contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
```

### Handler (TypeScript)

```typescript
import { StellarEvent } from "@subql/types-stellar";
export async function handleTransfer(event: StellarEvent): Promise<void> {
  const record = new TransferRecord(event.id);
  record.from = event.args[0]?.toString();
  record.to = event.args[1]?.toString();
  record.amount = event.args[2]?.toBigInt();
  record.ledger = event.block.blockHeight;
  record.timestamp = event.block.timestamp;
  await record.save();
}
```

Run locally:
```bash
subql init my-stellar-indexer --stella
subql codegen && subql build && subql-node
```

Query via GraphQL:
```graphql
{
  transferRecords(first: 10, orderBy: TIMESTAMP_DESC) {
    nodes { from to amount ledger timestamp }
  }
}
```

---

## Choosing an indexer

| Need | Use |
|------|-----|
| Off-the-shelf standard app data (Portfolio APIs) | Allium, Alchemy (upcoming), OBSRVR Gateway, Horizon |
| Stream / ETL to custom app database | The Graph (Substreams), Goldsky Mirror, SubQuery, OBSRVR Flow, Mercury Retroshades |
| Verifiable Zero-Knowledge analytics | Space and Time (Proof of Indexing / Proof of SQL) |
| Filter events at source, custom logic | Mercury WASM script |
| Ad-hoc SQL analytics, historical reporting | Hubble BigQuery |
| Quick one-off historical lookup | Horizon `operations` endpoint |
| Live state and recent events | Stellar RPC (`getEvents`) |

---

## Build Your Own (Data Ingestion)

If managed providers do not fit your needs, you can build custom ingestion pipelines:

- **Galexie**: Tool for acquiring Stellar ledger metadata from the network and exporting to external storage (a data lake). It serves as the foundation for a Composable Data Pipeline (CDP).
- **Ingest SDK**: Go packages used for programmatic domain models to interact with the Stellar network. It parses ledger metadata and entries, including History Archives.

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Query Hubble beyond available data | BigQuery returns empty rows, no error |
| Mercury script exceeds WASM memory limit | Script fails with `wasm_trap`, check `memory_limit` config |
| SubQuery handler throws | Event is skipped, logged as error; indexer continues |
| Horizon historical data truncated | SDF-hosted Horizon limits to ~1 year; self-hosted has full history |
| RPC `getLedgers` with large range | May timeout; paginate with cursor |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `getEvents` returns empty beyond 7 days | RPC retention window | Use Mercury, Hubble, or SubQuery |
| BigQuery `quotaExceeded` | Free tier query volume hit | Use `LIMIT` or wait for daily reset |
| SubQuery `block not found` | `startBlock` beyond chain height | Set `startBlock` to a lower value |
| Mercury `script not found` | WASM not deployed to RPC | Run `mercury script deploy` first |
| Horizon `timeout` | Large range or complex filter | Paginate with cursor and limit |

---

## See also

- `/events/SKILL.md` — reading and emitting Soroban events
- `/rpc/SKILL.md` — Stellar RPC setup and providers
- Hubble docs: [BigQuery access](https://developers.stellar.org/docs/data/analytics/hubble)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/data-indexers — MIT License*

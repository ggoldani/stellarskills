---
name: stellarskills-ingest-sdk
description: Building network data ingestion pipelines on Stellar. Reading the ledger, mapping to custom models, and outputting to datastores or message brokers using go-stellar-sdk.
---

# STELLARSKILLS — Ingestion Pipelines

> Building network data ingestion pipelines on Stellar. Reading the ledger, mapping to custom models, and outputting to datastores or message brokers using go-stellar-sdk.

---

## When to use

- Building an application that requires filtering live Stellar network transaction data
- Exporting network metadata as files to a CDP Datastore
- Streaming new ledgers as they close to a ZeroMQ Publisher Socket
- Creating an ingestion pipeline using the `github.com/stellar/go-stellar-sdk/ingest` package

---

## Quick reference

| Package | Purpose |
|---------|---------|
| `amount` | Converts prices from network transaction operations to string |
| `historyarchive` / `datastore` / `storage` | Wrappers for accessing history archives without low-level HTTP |
| `ingest` | Parsing network ledger metadata, converts to `LedgerTransaction` model |
| `network` | Convenient pre-configured settings for Testnet and Mainnet |
| `xdr` | Complete Golang binding to the Stellar network data model |

---

## Architecture

An end-to-end ingestion pipeline requires two separate applications:

1. **Ledger Metadata Export Pipeline**: Exports Stellar Ledger Metadata as files to a CDP Datastore (such as Google Cloud Storage).
2. **Ledger Metadata Consumer Pipeline**: Retrieves files from the datastore and processes them.

### Ledger Metadata Consumer Pipeline

The consumer pipeline has three roles:

- **Inbound Adapter**: Retrieves `LedgerCloseMeta` files from the Datastore and extracts the `LedgerCloseMeta` for each Ledger. The Go SDK provides `ApplyLedgerMetadata` for automated, performant retrieval.
- **Transformer**: Parses the ledger meta data using the `xdr` package, filters for specific operations (e.g. Payments), and converts them into an application-specific data model.
- **Outbound Adapter**: Subscribes to the application data model and publishes the data to an external datastore or message broker (like ZeroMQ).

---

## Tools

Use **Galexie** (a CDP command line program) to export network metadata to datastores.

For historical bounded range of ledgers:
```bash
--start <from_ledger> --end <to_ledger>
```

For continuous export of prior and all new ledgers:
```bash
--start <from_ledger>
```

---

## See also

- `/data-indexers/SKILL.md` — Querying historical data (Hubble, SubQuery)
- `/rpc/SKILL.md` — Stellar RPC for events and live state

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/ingest-sdk — MIT License*

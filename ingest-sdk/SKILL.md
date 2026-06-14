---
name: ingest-sdk
description: Build custom network ingestion pipelines on Stellar. Covers the Go Ingest SDK, history archives, ledger metadata, ApplyLedgerMetadata, Galexie exports, and real-time or historical data flows.
user-invocable: true
argument-hint: "[ingest task]"
---

# Stellar Ingestion Pipelines

> Build custom network ingestion pipelines on Stellar. Use the Go Ingest SDK to read ledger metadata, derive application models, and stream data to downstream systems.

## When to use this skill
- Building a pipeline that consumes live Stellar ledger metadata
- Exporting historical or continuous ledger data with Galexie
- Translating XDR metadata into a domain model
- Sending derived events to a datastore or message bus
- Choosing between a custom indexer, Galexie, and RPC/Hubble workflows

## Related skills
- Historical query and RPC/Horizon workflows → `../data-indexers/SKILL.md`
- Reading live network state or events → `../rpc/SKILL.md`
- Writing consumers that react to contract events → `../soroban/SKILL.md`

---

## What the Ingest SDK is

The Ingest SDK is a set of Go packages under `github.com/stellar/go-stellar-sdk` for acquiring and parsing Stellar network data.

It converts XDR-encoded streams from Stellar Core into typed data structures that are easier to process in application code.

## Quick reference

| Package | Purpose |
|---------|---------|
| `amount` | Converts operation prices and amounts into strings |
| `historyarchive` / `datastore` / `storage` | Accesses history archives and datastores |
| `ingest` | Parses ledger metadata and applies it to consumer callbacks |
| `network` | Pre-configured network constants for Testnet/Mainnet |
| `xdr` | Go bindings for the Stellar network data model |

## Typical pipeline

An end-to-end ingestion flow usually has two parts:

1. **Export pipeline** — exports Stellar ledger metadata to cloud storage.
2. **Consumer pipeline** — reads exported files and turns them into an app-specific model.

### Consumer pipeline roles

- **Inbound adapter** — reads `LedgerCloseMeta` files from storage and feeds them into `ApplyLedgerMetadata`.
- **Transformer** — parses ledger metadata with `xdr`, filters the operations you care about, and maps them to your model.
- **Outbound adapter** — publishes the derived model to a datastore, queue, or message bus.

## Galexie

Use **Galexie** to export Stellar ledger metadata to cloud storage.

Common modes:

```bash
--start <from_ledger> --end <to_ledger>
--start <from_ledger>
```

Galexie is the first step in Stellar's Composable Data Platform for building historical data lakes.

## Source of truth

- [Build Custom Network Ingestion Pipeline](https://developers.stellar.org/docs/build/apps/ingest-sdk)
- [Ingest SDK](https://developers.stellar.org/docs/data/indexers/build-your-own/ingest-sdk)
- [Galexie](https://developers.stellar.org/docs/data/indexers/build-your-own/galexie)
- [BufferedStorageBackend](https://developers.stellar.org/docs/data/indexers/build-your-own/ingest-sdk/developer_guide/ledgerbackends/bufferedstoragebackend)

## See also
- `/data-indexers/SKILL.md` — query historical data and indexers
- `/rpc/SKILL.md` — Stellar RPC for real-time state

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/ingest-sdk — MIT License*

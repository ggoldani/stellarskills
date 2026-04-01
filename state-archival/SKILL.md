---
name: stellarskills-state-archival
description: Manage Soroban state bloat using TTLs and State Archival. How to restore archived data, test TTL extension logic, and manually create restoration footprints using the Stellar JS SDK.
---

# STELLARSKILLS — State Archival

> Manage Soroban state bloat using TTLs and State Archival. How to restore archived data, test TTL extension logic, and manually create restoration footprints using the Stellar JS SDK.

---

## 1. What is State Archival?

Soroban uses a novel strategy to combat state bloat: State Archival. Ledger entries (like `Persistent` and `Instance` storage) require rent to stay active. If rent is not paid and the Time-To-Live (TTL) expires, the entry is archived.

Archived entries cannot be read or modified by smart contracts until they are explicitly **restored** to the live ledger.

---

## 2. Managing TTL and Rent

When building Soroban contracts, developers must actively manage the TTL of their data.

- **`Persistent` data:** Data meant to live indefinitely (e.g., user balances) but requires periodic rent payments (TTL extensions) by users or the contract to avoid archival.
- **`Instance` data:** Data associated with the contract instance (e.g., admin addresses). Extending instance data extends the contract's code and all instance storage together.
- **`Temporary` data:** Data that is cheap to write but cannot be restored once its TTL expires. Used for single-transaction flags or temporary allowances.

---

## 3. Restoring Archived Data

When data is archived, any transaction attempting to access it will fail. A restoration transaction must be submitted first using the `RestoreFootprintOp` operation.

Using the JavaScript SDK, you can handle restoration using the `SorobanRpc.assembleTransaction` workflow. When simulation detects that a required footprint is archived, the RPC returns a `restorePreamble`. You can use this preamble to build a restoration transaction before submitting your main transaction.

---

## 4. Official Documentation & Guides

- **State Archival Concept:** https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival
- **How-to Guides on Archival:** https://developers.stellar.org/docs/build/guides/archival
  - [Create a restoration footprint manually using JS SDK](https://developers.stellar.org/docs/build/guides/archival/create-restoration-footprint-js)
  - [Extend a persistent entry and contract using JS SDK](https://developers.stellar.org/docs/build/guides/archival/extend-persistent-entry-js)
  - [Restore a contract using JS SDK](https://developers.stellar.org/docs/build/guides/archival/restore-contract-js)
  - [Restore archived contract data using JS SDK](https://developers.stellar.org/docs/build/guides/archival/restore-data-js)
  - [Test TTL extension logic in smart contracts](https://developers.stellar.org/docs/build/guides/archival/test-ttl-extension)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/state-archival — MIT License*
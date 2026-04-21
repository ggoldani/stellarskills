---
name: stellarskills-state-archival
description: Soroban state archival and TTL management — storage expiration, restoration, and operational patterns for contract state on Stellar.
---

Soroban state archival is Stellar's mechanism for limiting long-term state growth through TTL-based expiration.

## When to use

- Working with Soroban contract storage that must remain readable over time
- Designing data retention around temporary, persistent, and instance storage
- Extending TTL before entries expire
- Restoring archived persistent or instance state
- Handling simulation or submission paths that include archival preambles
- Debugging missing contract data caused by expired storage entries

## Quick reference

| Operation | Detail |
|-----------|--------|
| Core concept | Soroban limits state bloat by expiring entries when TTL reaches zero |
| Temporary storage | Deleted at TTL `0`, cannot be restored |
| Persistent storage | Archived at TTL `0`, can be restored |
| Instance storage | Archived at TTL `0`, can be restored, shares TTL with the contract instance |
| Check TTL | Query entry lifetime before it gets too low |
| Extend TTL | Refresh lifetime before expiry |
| Automatic restore | Simulation can include restore preamble automatically |
| Manual restore | Build a transaction with `RestoreFootprintOp` |
| JS helper | `SorobanRpc.assembleTransaction` handles restore preamble automatically |
| Main docs | `https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival` |

## What state archival is

Soroban does not keep all contract state live forever by default. Each storage entry has a TTL, measured in ledgers. When the TTL expires, the network stops treating that entry as live state.

This is the strategy against state bloat. Instead of keeping unused data permanently active, Soroban lets expired entries fall out of active storage.

The effect depends on storage type.

## Storage types and archival behavior

| Storage type | At TTL 0 | Restorable | Notes |
|--------------|----------|------------|-------|
| Temporary | Deleted | No | Cheapest and short-lived |
| Persistent | Archived | Yes | Suitable for balances, ownership, durable user state |
| Instance | Archived | Yes | Shared with contract instance, contract-global |

### Temporary storage

Temporary entries are gone when TTL reaches zero. They cannot be restored. Use this for locks, short-lived nonces, and data that is safe to lose.

### Persistent storage

Persistent entries archive when TTL reaches zero. They are no longer readable until restored, but the underlying archived state can be brought back.

### Instance storage

Instance storage also archives and can be restored. It shares TTL with the contract instance. If instance state expires, the contract may become effectively unusable until restored.

## TTL management

TTL management is operational, not optional. If a contract depends on storage remaining live, it must extend TTL before expiry.

Typical patterns:

- extend on reads or writes for hot state
- extend only when TTL drops below a threshold
- use longer targets for contract-global config than for volatile user state
- avoid extending entries that can safely expire

## Extend TTL in contract code

The exact storage API differs by storage type, but the pattern is consistent: choose a threshold and extend before the entry gets too close to zero.

```rust
let key = DataKey::Balance(user.clone());
let store = env.storage().persistent();

if store.get_ttl(&key) < 5_000 {
    store.extend_ttl(&key, 5_000, 100_000);
}
```

Instance storage extension uses the instance store directly.

```rust
let instance = env.storage().instance();
instance.extend_ttl(5_000, 100_000);
```

Interpretation:

- first value is the threshold below which extension applies
- second value is the target TTL after extension
- extend before the entry falls out of live state

## Check TTL status from JavaScript

Operational tooling often needs to know whether a contract read is failing because the entry is archived.

```ts
import { Server } from "@stellar/stellar-sdk/rpc";

const rpc = new Server(process.env.RPC_URL!);
const ledger = await rpc.getLatestLedger();
console.log(ledger.sequence);
```

Applications usually learn about archival during simulation or failed reads, then respond by restoring and reassembling the transaction.

## Restoration paths

Archived persistent and instance entries can be restored in two main ways.

### Automatic restoration via simulation

Protocol 23 made restore handling much smoother. If simulation detects archived footprint entries, the transaction assembly path can prepend the needed restore operations automatically.

In JavaScript, `SorobanRpc.assembleTransaction` handles this restore preamble automatically when simulation indicates it is required.

```ts
import { SorobanRpc } from "@stellar/stellar-sdk";

const assembled = await SorobanRpc.assembleTransaction(
  transaction,
  simulation,
  process.env.NETWORK_PASSPHRASE!
);
```

This is the preferred path when you are already using simulation-driven transaction assembly.

### Manual restoration with `RestoreFootprintOp`

If you need explicit control, you can restore archived entries manually with `RestoreFootprintOp`, then submit the original operation after restore succeeds.

```ts
const restoreTx = new TransactionBuilder(account, txOpts)
  .addOperation(Operation.restoreFootprint({}))
  .setTimeout(30)
  .build();
```

Manual restore is useful when:

- you want separate operational control over restore and invoke steps
- you are debugging archival behavior directly
- your tooling does not automatically assemble restore preambles

## Example: invoke and let assembly restore state

A common JS flow is simulate first, then assemble. If archived entries are present, the assembly step prepares the needed restore logic.

```ts
const sim = await rpc.simulateTransaction(tx);
const ready = await SorobanRpc.assembleTransaction(
  tx,
  sim,
  networkPassphrase
);
const signed = ready.build().sign(keypair);
```

This avoids custom restore branching in the normal invoke path.

## Example: explicit restore flow

When handling restore separately, the sequence is restore, submit, then rebuild the business transaction.

```ts
const restore = new TransactionBuilder(account, txOpts)
  .addOperation(Operation.restoreFootprint({}))
  .setTimeout(30)
  .build();

const simRestore = await rpc.simulateTransaction(restore);
const readyRestore = await SorobanRpc.assembleTransaction(
  restore, simRestore, networkPassphrase
);
```

After restore succeeds, re-simulate and submit the original transaction.

## Operational guidance

| Topic | Practical rule |
|-------|----------------|
| Instance data | Keep small and extend regularly if contract must stay callable |
| Persistent user state | Extend on active use, not blindly on every ledger |
| Temporary data | Assume it can disappear forever |
| Restore flow | Prefer automatic restore via simulation-driven assembly |
| Monitoring | Treat archival-related simulation output as a maintenance signal |

## Design implications

Archival changes how you model durable data.

- not every entry should be permanent
- user inactivity can legitimately allow state to expire
- contracts that depend on instance config must guard against instance archival
- restore cost and latency should be considered for rarely used state
- temporary storage is for expendable data only

## Edge cases

| Situation | What happens | Handling |
|-----------|--------------|----------|
| Temporary entry expires | Entry is deleted forever | Recompute or recreate it; restore is impossible |
| Persistent entry expires during inactivity | Reads fail until restored | Use simulation + assemble flow or manual restore |
| Instance storage expires | Contract-global state archives | Restore first, then extend TTL to keep contract usable |
| TTL extended too late | Entry already archived | Restoration is required before normal reads resume |
| Restore submitted without correct footprint | Transaction fails | Re-simulate and rebuild footprint before restore |
| Original tx reused after restore | Footprint or sequence may be stale | Re-simulate and rebuild after restore completion |
| Blind TTL extension everywhere | Unnecessary rent and write overhead | Extend selectively by policy and threshold |

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing data that used to exist | Entry expired and archived or deleted | Determine storage type, then restore if restorable |
| Contract becomes uncallable | Instance storage archived | Restore instance footprint and extend instance TTL |
| Restore flow loops | Reusing stale simulation results | Re-simulate after each material state change |
| `RestoreFootprintOp` succeeds but invoke still fails | Original tx footprint no longer matches | Rebuild the invoke tx after restore |
| Expected restore for temporary storage | Temporary entries are not restorable | Redesign with persistent or instance storage if recovery is required |
| Assembly does not add restore preamble | Simulation did not include the archived requirement or flow skipped assembly | Use full simulate → assemble path |
| High rent from aggressive extension | Thresholds and targets set too high | Tune TTL policy to actual access patterns |

## SDKs

| SDK / Tool | Role |
|------------|------|
| `@stellar/stellar-sdk` | Build, simulate, assemble, restore, and submit Soroban transactions |
| `SorobanRpc.assembleTransaction` | Preferred helper for simulation-driven restore preamble assembly |
| `Operation.restoreFootprint` | Manual restore operation construction |

Verified sources:

- `https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival`
- `https://developers.stellar.org/docs/build/guides/archival`

## See also

- `/storage/SKILL.md`
- `/soroban/SKILL.md`

*raw.githubusercontent.com/ggoldani/stellarskills/main/state-archival — MIT License*

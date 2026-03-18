---
name: stellarskills-storage
description: Soroban storage — Instance, Persistent, Temporary, Events
---

# STELLARSKILLS — Soroban Host Storage (Data Structures)

> How to manage state in Soroban. Understanding Persistent, Temporary, and Instance storage, TTL/Rent, and migrating from Solidity mappings.

---

## 1. The "Solidity Mapping" Fallacy

If you are migrating from EVM/Solidity to Stellar/Soroban, **do not use Rust's in-memory data structures (`HashMap`, `Vec`, `BTreeMap`) to store unbounded global state** (like user balances).

In Solidity, you write: `mapping(address => uint256) public balances;`

In Soroban, memory is strictly limited per invocation (~40MB). If you try to deserialize an entire `Vec` or `Map` of 10,000 users into memory just to update one balance, the transaction will crash with a **Memory Limit Exceeded** error.

**The Solution:** You must interact directly with the Ledger State using **Host Storage** (`env.storage()`). The ledger itself *is* the mapping.

---

## 2. Defining Storage Keys

In Soroban, you query the ledger by passing a typed "Key". Best practice is to define an `enum` tagged with `#[contracttype]`.

```rust
use soroban_sdk::{contracttype, Address, String};

#[contracttype]
pub enum DataKey {
    Admin,                  // A single singleton key
    Balance(Address),       // A dynamically generated key per user
    Allowance(Address, Address), // Nested mapping: owner -> spender
    TokenName,
}
```

---

## 3. The Three Storage Tiers

Soroban divides storage into three tiers based on cost, lifespan, and access patterns.

### A. Instance Storage (`env.storage().instance()`)
- **What it is:** Data conceptually "attached" to the contract instance. If the contract is deleted/archived, this data goes with it.
- **Use Case:** Global configurations, the contract `Admin` address, token names, pausing flags.
- **Limitations:** You should only store a small number of keys here. All instance storage is loaded into memory simultaneously when the contract is invoked. Do not store user-specific data here.

```rust
// Write
env.storage().instance().set(&DataKey::Admin, &admin_address);

// Read (returns Option)
let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

// Check if exists
let has_admin = env.storage().instance().has(&DataKey::Admin);
```

### B. Persistent Storage (`env.storage().persistent()`)
- **What it is:** Data that must survive long-term. It cannot be arbitrarily deleted by the network unless its rent expires (TTL).
- **Use Case:** User balances, token ownership, collateral deposits. (The exact equivalent of a Solidity `mapping`).
- **Performance:** Only the specific key you request is loaded from the ledger into memory. Highly scalable.

```rust
// Write a user's balance
env.storage().persistent().set(&DataKey::Balance(user.clone()), &100_i128);

// Read a user's balance (defaulting to 0 if not found)
let bal: i128 = env.storage().persistent().get(&DataKey::Balance(user)).unwrap_or(0);

// Delete an entry to save state bloat
env.storage().persistent().remove(&DataKey::Balance(zero_balance_user));
```

### C. Temporary Storage (`env.storage().temporary()`)
- **What it is:** Cheap storage designed to expire quickly.
- **Use Case:** Reentrancy guards, signature nonces, oracle price data that becomes stale after 1 hour, short-lived rate limits.
- **Performance:** The cheapest form of storage available on Soroban.

```rust
// Set a reentrancy lock
env.storage().temporary().set(&DataKey::ReentrancyLock, &true);

// Read the lock
if env.storage().temporary().has(&DataKey::ReentrancyLock) {
    panic!("Reentrant call detected!");
}
```

---

## 4. TTL and State Rent (The "Archival" Problem)

Stellar charges "rent" to keep data active in the ledger. Every piece of storage has a TTL (Time-To-Live), measured in ledgers (1 ledger = ~5 seconds).

If the TTL reaches 0, the data is **Archived**. It still exists, but contracts cannot read or write to it until a user manually submits a `RestoreFootprint` transaction.

**As a developer, you must explicitly extend the TTL of data you care about during invocations.**

### Extending Instance Storage
You should generally extend the Instance TTL on *every* contract invocation, because if the Instance archives, the entire contract becomes uncallable.

```rust
// Extend instance storage to live for at least 100,000 ledgers (~5 days)
env.storage().instance().extend_ttl(
    50_000,    // minimum threshold: only extend if TTL is below this
    100_000,   // target: extend it up to this amount
);
```

### Extending Persistent/Temporary Storage
When a user interacts with their balance, bump their TTL so their funds don't get archived.

```rust
let key = DataKey::Balance(user.clone());

// Read balance
let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);

// Extend the TTL for THIS SPECIFIC user's balance entry
env.storage().persistent().extend_ttl(
    &key,
    1_000_000, // min threshold (e.g. 2 months)
    2_000_000, // target (e.g. 4 months)
);
```

---

## 5. Security & Best Practices

1. **Avoid `Vec` for state:** If you catch yourself writing `let mut users: Vec<Address> = env.storage().instance().get...`, stop. Use `persistent().set(&DataKey::User(addr))` instead. If you need to iterate over all users off-chain, emit an Event or use an Indexer (Mercury/Zephyr), do not iterate on-chain.
2. **Delete what you don't need:** If a user withdraws all funds, `remove()` their key from `persistent()` storage. State bloat increases fees.
3. **Always unwrap safely:** Never use `.unwrap()` on storage keys blindly. Always use `.unwrap_or(default_value)` or `if let Some(val) = ...`. An unhandled unwrap on a missing key will panic and crash the transaction.

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/storage — MIT License*

---
name: stellarskills-storage
description: Instance, Persistent, and Temporary storage in Soroban. TTL/rent, get/set/has/remove, best practices.
---

# STELLARSKILLS — Storage

> Instance, Persistent, and Temporary storage in Soroban. TTL/rent, get/set/has/remove, best practices.

---

## When to use

- Storing contract state (balances, config, allowances)
- Choosing between Instance, Persistent, or Temporary storage
- Extending TTL to prevent archival
- Migrating from Solidity mappings to Soroban host storage

---

## Quick reference

| Storage type | API | Typical use | Default TTL |
|-------------|-----|-------------|-------------|
| Instance | `env.storage().instance()` | Contract config, admin, token name | ~1 month |
| Persistent | `env.storage().persistent()` | User balances, ownership, allowances | ~1 month |
| Temporary | `env.storage().temporary()` | Reentrancy locks, nonces, rate limits | ~100 ledgers |

---

## Storage keys

Define typed keys with `#[contracttype]`:

```rust
use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Balance(Address),
    Allowance(Address, Address),
}
```

---

## Instance storage

Loaded entirely into memory on every invocation. Use for small, contract-global state only.

```rust
let s = env.storage().instance();
s.set(&DataKey::Admin, &admin);
let admin: Address = s.get(&DataKey::Admin).unwrap();
let has = s.has(&DataKey::Admin);
```

Extend on every invocation — if instance archives, the contract becomes uncallable:

```rust
env.storage().instance().extend_ttl(50_000, 100_000);
```

---

## Persistent storage

Per-key loading. One key per read/write — scalable for user-specific state. The direct equivalent of a Solidity mapping.

```rust
let s = env.storage().persistent();
let key = DataKey::Balance(user.clone());

s.set(&key, &100_i128);
let bal: i128 = s.get(&key).unwrap_or(0);
let has = s.has(&key);
s.remove(&DataKey::Balance(zero_balance_user));
```

---

## Temporary storage

Cheapest tier. Expires fast. Use for short-lived guards.

```rust
let s = env.storage().temporary();
s.set(&DataKey::ReentrancyLock, &true);

if s.has(&DataKey::ReentrancyLock) {
    panic!("Reentrant call");
}
```

---

## TTL and rent

Every storage entry has a TTL in ledgers (~5s each). When TTL hits 0, data is archived and unreadable until restored.

Extend TTL when users interact with their data:

```rust
let key = DataKey::Balance(user.clone());
let balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);

env.storage().persistent().extend_ttl(&key, 1_000_000, 2_000_000);
```

Check before extending (avoids unnecessary writes):

```rust
if env.storage().persistent().get_ttl(&key) < 5000 {
    env.storage().persistent().extend_ttl(&key, 5000, 100_000);
}
```

---

## Edge cases

| Situation | Result |
|-----------|--------|
| All instance keys archived | Contract becomes uncallable until restored |
| `unwrap()` on missing key | Transaction panics and fails |
| Store unbounded `Vec` in instance | Memory limit exceeded on load |
| Forget to extend persistent TTL | User data archives, becomes unreadable |
| Remove key then read it | Returns `None` — handle with `unwrap_or(default)` |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Memory limit exceeded | Loading large `Vec`/`Map` from storage | Use per-key persistent storage instead |
| `contract_instance_not_found` | Instance TTL expired | Submit `RestoreFootprint` + extend TTL |
| Transaction panics on `.unwrap()` | Missing key not handled | Use `unwrap_or(default)` or `if let Some(val)` |
| State bloat / high fees | Never removing stale entries | Call `remove()` on zero-balance or expired data |

---

## See also

- [Storing data — Soroban docs](https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data)
- [soroban-sdk storage API](https://docs.rs/soroban-sdk/latest/soroban_sdk/storage/struct.Persistent.html)
- [Resource limits & fees](https://developers.stellar.org/docs/networks/resource-limits-fees)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/storage — MIT License*

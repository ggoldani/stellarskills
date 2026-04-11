---
name: stellarskills-security
description: Auth patterns, input validation, access control, overflow protection, and storage TTL for Soroban contracts in Rust.
---

# STELLARSKILLS — Security

> Auth patterns, input validation, access control, overflow protection, and storage TTL for Soroban contracts in Rust.

---

## When to use

- Any Soroban function that modifies user state or spends funds
- Adding or reviewing auth checks, access control, or admin patterns
- Protecting arithmetic, storage, and iteration from edge-case failures
- Designing contract upgrade or admin transfer flows

---

## Quick reference

| Vulnerability | Prevention |
|---------------|-----------|
| Unauthorized state change | `address.require_auth()` on every function that modifies user-owned state |
| Over-permissioned auth | Use `require_auth_for_args()` when only a subset of args needs signing |
| Integer overflow | `checked_add` / `checked_sub` / `checked_mul` — never bare `+` or `-` on financial values |
| Unbounded iteration | Batch limits passed from client; never iterate over unbounded maps |
| Storage data loss | Extend TTL on every read/write of persistent entries |
| Accidental admin lockout | Two-step transfer: propose + accept with require_auth on both |
| Malicious upgrade | Timelock admin key or omit upgrade function for trustless protocols |

---

## require_auth

Soroban auth is pull-based — no implicit `msg.sender`. If a function modifies user state or spends their funds, it **must** call `.require_auth()`.

```rust
// VULNERABLE: anyone can withdraw from `user`
pub fn withdraw(env: Env, user: Address, amount: i128) {
    let balance = get_balance(&env, &user);
    set_balance(&env, &user, balance - amount);
}

// SECURE: caller must sign for this exact invocation
pub fn withdraw(env: Env, user: Address, amount: i128) {
    user.require_auth();
    let balance = get_balance(&env, &user);
    set_balance(&env, &user, balance - amount);
}
```

### require_auth vs require_auth_for_args

`require_auth()` authorizes the call with **all** arguments. `require_auth_for_args()` authorizes only the provided subset.

```rust
// User authorizes only (amount), not the recipient
let user_auth = user.require_auth_for_args((&amount,));
// Use when a function needs to verify user intent for a specific arg
// but the remaining args are determined by contract logic
```

### When to use which

| Scenario | Use |
|----------|-----|
| User transfers own tokens to any recipient | `require_auth()` — user approves the full call |
| Admin function with user-provided parameter | `require_auth()` on admin, validate user param separately |
| User approves amount but contract picks recipient | `require_auth_for_args((&amount,))` |

---

## Checks-Effects-Interactions

Soroban's synchronous execution prevents cross-contract reentrancy — contract B finishes before A resumes. No async/mempool reentrancy like EVM. Self-reentrancy is architecturally limited.

The pattern remains defense-in-depth: update state before external calls.

```rust
pub fn withdraw(env: Env, user: Address, amount: i128) {
    user.require_auth();
    let balance = get_balance(&env, &user);
    if balance < amount { panic!("insufficient funds"); }

    // Effects first
    set_balance(&env, &user, balance - amount);

    // Interaction last
    let token = token::Client::new(&env, &token_id);
    token.transfer(&env.current_contract_address(), &user, &amount);
}
```

---

## Arithmetic

Rust wraps on overflow in release mode (how contracts are compiled). Always use checked arithmetic for financial values.

```rust
// VULNERABLE: wraps silently in release
let new_balance = balance + amount;

// SECURE: panics on overflow — transaction fails safely
let new_balance = balance.checked_add(amount).expect("overflow");
```

---

## Iteration limits

Soroban has strict CPU/memory budgets. Unbounded iteration over storage can brick a contract.

```rust
// SECURE: client controls batch size
pub fn payout_batch(env: Env, users: Vec<Address>) {
    if users.len() > 50 { panic!("batch too large"); }
    for user in users.iter() {
        payout(&env, &user);
    }
}
```

Rules: never iterate over unbounded maps, always cap batch size, pass limits from the client.

---

## Storage TTL

Persistent storage entries expire if TTL is not extended. Expired data is archived — requires `RestoreFootprint` to recover. Temporary storage is deleted permanently.

```rust
pub fn get_balance(env: Env, user: Address) -> i128 {
    let key = DataKey::Balance(user);
    if let Some(balance) = env.storage().persistent().get::<_, i128>(&key) {
        env.storage().persistent().extend_ttl(&key, 1000, 100000);
        balance
    } else {
        0
    }
}
```

Extend TTL on every read and write. Default persistent TTL is ~2 weeks; max is ~1 year (see official docs for current values).

---

## Access control

### Admin pattern

```rust
pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
    let admin: Address = env.storage().instance()
        .get(&DataKey::Admin).unwrap();
    admin.require_auth();
    env.deployer().update_current_contract_wasm(new_wasm_hash);
}
```

### Two-step admin transfer

Prevents locking the contract by assigning admin to an unreachable address.

```rust
pub fn propose_admin(env: Env, new_admin: Address) {
    let admin: Address = env.storage().instance()
        .get(&DataKey::Admin).unwrap();
    admin.require_auth();
    env.storage().instance().set(&DataKey::PendingAdmin, &new_admin);
}

pub fn accept_admin(env: Env) {
    let pending: Address = env.storage().instance()
        .get(&DataKey::PendingAdmin).unwrap();
    pending.require_auth();
    env.storage().instance().set(&DataKey::Admin, &pending);
    env.storage().instance().remove(&DataKey::PendingAdmin);
}
```

---

## Edge cases

| Situation | Result |
|-----------|--------|
| `require_auth` on contract's own address | Always succeeds — contract invokes itself, no signature needed |
| Upgrade with no TTL extension on admin key | Admin key expires, contract becomes permanently unupgradeable |
| `checked_sub` where minuend < subtrahend | Returns `None` — handle with `.expect()` or early return |
| Batch size of 0 passed to iterator | No-op — not an error, but may hide a client bug |
| Temporary storage used for user balances | Data deleted after expiration — use persistent for financial state |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `AuthError::InvalidContext` | `require_auth` called on wrong address or in unexpected context | Verify the Address matches the signer of the transaction |
| Panic: arithmetic overflow | Bare `+`/`-`/`*` on financial values | Use `checked_add` / `checked_sub` / `checked_mul` |
| `HostError(Storage(Expiration))` | TTL expired, entry archived | Extend TTL on every read/write; use `RestoreFootprint` to recover |
| Contract bricked after upgrade | Bad WASM hash or logic error in new code | Test on testnet first; use timelock on admin |
| Admin locked out | Single-step admin transfer to unreachable address | Use two-step propose + accept pattern |

---

## See also

- `/accounts/SKILL.md` — keypairs, signers, multisig, and account-level auth
- [Soroban contract auth](https://developers.stellar.org/docs/build/guides/auth) — official authorization guide
- [Fees & resource limits](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) — CPU/memory budgets

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/security — MIT License*

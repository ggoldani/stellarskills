# STELLARSKILLS — Soroban Security

> Critical security patterns, common vulnerabilities, and best practices for writing Soroban smart contracts in Rust.

---

## 1. Authentication & Authorization

Soroban's auth model is explicitly "pull-based". You must explicitly require authorization from the caller, rather than implicitly trusting `msg.sender` like in EVM.

### The Golden Rule
**If a function modifies state belonging to a user, or spends their funds, it MUST call `.require_auth()` on that user's Address.**

```rust
// VULNERABLE: Anyone can call this and withdraw from `user`
pub fn withdraw(env: Env, user: Address, amount: i128) {
    let balance = get_balance(&env, &user);
    set_balance(&env, &user, balance - amount);
}

// SECURE: Ensures `user` signed the transaction authorizing this exact call
pub fn withdraw(env: Env, user: Address, amount: i128) {
    user.require_auth(); // <--- CRITICAL

    let balance = get_balance(&env, &user);
    set_balance(&env, &user, balance - amount);
}
```

### require_auth vs require_auth_for_args
`.require_auth()` authorizes the call with the *exact arguments passed to the function*.
If you need a user to authorize a subset of arguments, or a different internal action, use `.require_auth_for_args()`.

---

## 2. Reentrancy

Soroban does **NOT** prevent reentrancy inherently. If your contract calls another contract, that contract can call back into yours before your function finishes.

### The Vulnerability
If you update state *after* making an external call, a malicious contract can re-enter your function and drain funds.

```rust
// VULNERABLE: State updated AFTER external call
pub fn withdraw(env: Env, user: Address, amount: i128) {
    user.require_auth();
    let token = token::Client::new(&env, &token_id);

    // External call (execution control passes to token contract)
    token.transfer(&env.current_contract_address(), &user, &amount);

    // State update (too late!)
    let balance = get_balance(&env, &user);
    set_balance(&env, &user, balance - amount);
}
```

### The Fix (Checks-Effects-Interactions Pattern)
Always update your internal state *before* calling external contracts.

```rust
// SECURE: State updated BEFORE external call
pub fn withdraw(env: Env, user: Address, amount: i128) {
    user.require_auth();

    // 1. Checks
    let balance = get_balance(&env, &user);
    if balance < amount { panic!("insufficient funds"); }

    // 2. Effects (State Update)
    set_balance(&env, &user, balance - amount);

    // 3. Interactions (External Call)
    let token = token::Client::new(&env, &token_id);
    token.transfer(&env.current_contract_address(), &user, &amount);
}
```

---

## 3. Arithmetic Overflows

By default, Rust panics on integer overflow in debug mode, but **wraps** in release mode. Since contracts are compiled in release mode, overflows can silently corrupt balances.

### The Fix
Always use checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`) for financial calculations.

```rust
// VULNERABLE (Wraps in release mode)
let new_balance = balance + amount;

// SECURE
let new_balance = balance.checked_add(amount).expect("arithmetic overflow");
```

---

## 4. Unbounded Loops & Iteration

Soroban has strict resource limits (CPU and memory). If you iterate over an unbounded data structure (like a list of all users), an attacker can add enough entries to make the transaction hit the limit, permanently bricking the contract.

### The Fix
- Avoid arrays/vectors that grow indefinitely.
- Do not iterate over user maps.
- If pagination is necessary, pass limits and cursors from the client side.

```rust
// VULNERABLE: Fails if vec gets too large
let users: Vec<Address> = env.storage().instance().get(&DataKey::UserList).unwrap();
for user in users.iter() {
    payout(&env, user);
}

// SECURE: Client batches payouts
pub fn payout_batch(env: Env, users: Vec<Address>) {
    // Check batch size
    if users.len() > 50 { panic!("batch too large"); }
    for user in users.iter() {
        payout(&env, user);
    }
}
```

---

## 5. Storage Expiration & TTL

Soroban storage entries (`Persistent` and `Temporary`) expire if their Time-To-Live (TTL) is not explicitly extended.

### The Vulnerability
If you store a user's deposit balance in `Persistent` storage and fail to extend its TTL, the network will archive it. The user will lose access to their funds until a `RestoreFootprint` operation is executed. If you use `Temporary` storage, the data is permanently deleted.

### The Fix
Extend the TTL whenever a persistent record is read or written.

```rust
pub fn get_balance(env: Env, user: Address) -> i128 {
    let key = DataKey::Balance(user);

    if let Some(balance) = env.storage().persistent().get::<_, i128>(&key) {
        // Extend TTL whenever accessed
        env.storage().persistent().extend_ttl(&key, 1000, 100000);
        balance
    } else {
        0
    }
}
```

---

## 6. Admin Key Management

Contracts often use an admin key for upgrades or emergency pauses.

- Store the admin key in `Instance` storage.
- Always require admin auth via `admin.require_auth()`.
- Implement a two-step admin transfer process (propose admin, accept admin) to prevent accidentally assigning admin to a dead address.

---

## 7. Contract Upgrades

Contracts can upgrade their own WASM code.

```rust
pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();

    env.deployer().update_current_contract_wasm(new_wasm_hash);
}
```

**Security Risk**: Upgrades can maliciously alter contract logic. If building a trustless protocol, either omit the upgrade function or place the admin address under a timelocked DAO/multisig.

---

*stellarskills.vercel.app/security — MIT License*
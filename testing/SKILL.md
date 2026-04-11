---
name: stellarskills-testing
description: Testing Soroban smart contracts with Rust unit tests, SAC integration, Stellar CLI sandbox, and Testnet E2E.
---

# STELLARSKILLS — Testing

> Testing Soroban smart contracts with Rust unit tests, SAC integration, Stellar CLI sandbox, and Testnet E2E.

---

## When to use

- Writing unit tests for Soroban contracts in Rust
- Testing token interactions with the Stellar Asset Contract (SAC)
- Running contracts locally via Stellar CLI sandbox
- E2E testing against Testnet before Mainnet deployment

---

## Quick reference

| Test type | Tool / Command |
|-----------|---------------|
| Rust unit test | `cargo test` (with `soroban-sdk` `testutils` feature) |
| Mock all auths | `env.mock_all_auths()` |
| Assert specific auth | `env.auths()` — returns vec of auth tuples |
| Expected panic | `#[should_panic(expected = "...")]` |
| SAC token in test | `env.register_stellar_asset_contract(admin)` |
| CLI sandbox deploy | `stellar contract deploy --wasm ... --source alice` |
| CLI sandbox invoke | `stellar contract invoke --id my_contract --source bob -- ...` |
| Testnet fund | `stellar keys fund alice --network testnet` |
| Testnet deploy | `stellar contract deploy --wasm ... --source alice --network testnet` |

---

## Rust unit tests

Soroban's `testutils` feature provides an in-memory `Env` that simulates the Soroban VM. Enable it in `Cargo.toml`:

```toml
[dev-dependencies]
soroban-sdk = { version = "25.3.1", features = ["testutils"] }
```

### Basic structure

```rust
#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_deposit() {
    let env = Env::default();
    let contract_id = env.register(MyContract, ());
    let client = MyContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
```

```rust
    client.initialize(&admin);
    env.mock_all_auths();
    client.deposit(&user, &100);
    assert_eq!(client.get_balance(&user), 100);
}
```

### Authentication testing

Allow all auths (simplest):
```rust
env.mock_all_auths();
client.secure_action(&user);
```

Assert specific auths (strict):
```rust
client.secure_action(&user);
assert_eq!(
    env.auths(),
    std::vec![(
        user.clone(),
        client.address.clone(),
        Symbol::new(&env, "secure_action"),
        (&user,).into_val(&env)
    )]
);
```

Auth tuple shape varies by SDK release — check `docs.rs` for your pinned `soroban-sdk`.

### Testing expected panics

```rust
#[test]
#[should_panic(expected = "insufficient funds")]
fn test_withdraw_too_much() {
    let env = Env::default();
    let contract_id = env.register(MyContract, ());
    let client = MyContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    env.mock_all_auths();
    client.withdraw(&user, &9999);
}
```

---

## Testing with SAC

Deploy the Stellar Asset Contract in the test `Env` to test token interactions:

```rust
use soroban_sdk::token;

let env = Env::default();
env.mock_all_auths();
let token_admin = Address::generate(&env);

let token_id = env.register_stellar_asset_contract(token_admin.clone());
let token_client = token::AdminClient::new(&env, &token_id);
let token = token::Client::new(&env, &token_id);

let user = Address::generate(&env);
token_client.mint(&user, &1000);
```

Pass `token_id` into your contract functions:
```rust
let my_contract_id = env.register(MyContract, ());
let client = MyContractClient::new(&env, &my_contract_id);
client.deposit(&user, &token_id, &100);

assert_eq!(token.balance(&user), 900);
assert_eq!(token.balance(&my_contract_id), 100);
```

---

## Stellar CLI sandbox

Run contracts locally without network access:

```bash
stellar contract build

stellar keys generate alice
stellar keys generate bob
```

Deploy to local sandbox:
```bash
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source alice --alias my_contract
```

Invoke and read:
```bash
stellar contract invoke --id my_contract --source bob -- \
  deposit --user bob --amount 100

stellar contract read --id my_contract
```

---

## Testnet E2E testing

Add network config:
```bash
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

Fund and deploy:
```bash
stellar keys fund alice --network testnet

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source alice --network testnet
```

For JS/TS E2E scripts simulating frontend interactions, use `@stellar/stellar-sdk`.

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Auth required but `mock_all_auths()` not called | Test panics with auth error |
| Wrong auth tuple shape in `env.auths()` assertion | Test fails — shape varies by SDK release |
| SAC mint before `mock_all_auths()` | Panics — mint requires auth from admin |
| CLI sandbox with missing `--source` | Error — source identity required for all transactions |
| Testnet resets (quarterly) | All deployed contracts and state are wiped |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `testutils` feature not found | Missing in `Cargo.toml` dev-dependencies | Add `features = ["testutils"]` to `soroban-sdk` |
| Auth panic in test | Contract calls `require_auth()` without mock | Call `env.mock_all_auths()` before invoking |
| `should_panic` doesn't catch | Expected message string doesn't match | Match exact panic message from contract |
| CLI `contract deploy` not found | Stellar CLI not installed or not in PATH | Install via `cargo install stellar-cli` |
| Testnet `timeout` or `504` | RPC overloaded or network congested | Retry or use alternate RPC provider |

---

## See also

- Official docs: [Soroban testing](https://developers.stellar.org/docs/build/smart-contracts/testing)
- [Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers)
- [Network resource limits & fees](https://developers.stellar.org/docs/networks/resource-limits-fees)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/testing — MIT License*

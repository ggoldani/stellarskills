---
name: stellarskills-testing
description: How to test Soroban smart contracts using Rust's built-in testing framework and the Stellar CLI.
---

# STELLARSKILLS — Testing

> How to test Soroban smart contracts using Rust's built-in testing framework and the Stellar CLI.

---

## 1. Rust Unit & Integration Tests

Soroban provides a robust `testutils` feature that lets you run smart contract tests natively in Rust. This creates an in-memory test environment (`Env`) that simulates the Soroban VM exactly.

**Advantages:**
- Blazing fast (no network overhead).
- Complete access to internal contract state for assertions.
- Can test cross-contract calls by registering multiple contracts.

### Setup

In your `Cargo.toml`, ensure `testutils` is enabled for dev:
```toml
[dev-dependencies]
# Must match the `soroban-sdk` version your contracts use (see /soroban/SKILL.md and https://docs.rs/soroban-sdk/latest/soroban_sdk/)
soroban-sdk = { version = "25.3.1", features = ["testutils"] }
```

### Basic Test Structure

Create a `test.rs` file next to your contract implementation, or inline it at the bottom of your file.

```rust
#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_deposit_and_withdraw() {
    // 1. Initialize environment
    let env = Env::default();

    // 2. Mock contract deployment
    let contract_id = env.register(MyContract, ());

    // 3. Create a client to interact with the contract
    let client = MyContractClient::new(&env, &contract_id);

    // 4. Generate mock addresses
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // 5. Invoke contract functions
    client.initialize(&admin);

    // 6. Mock authorization (auto-approve all auth requests)
    env.mock_all_auths();

    client.deposit(&user, &100);

    // 7. Assert state
    assert_eq!(client.get_balance(&user), 100);
}
```

### Testing Authentication (Mocking Auths)

When testing functions that use `require_auth()`, the test environment will panic unless you tell it how to handle auth.

**Method 1: Allow all auths (Easiest)**
```rust
env.mock_all_auths();
client.secure_action(&user);
```

**Method 2: Assert specific auths (Strict)**
Validates that the contract actually requested the correct signatures.
```rust
client.secure_action(&user);

// Verify the contract requested auth from `user` for `secure_action`.
// Tuple shape and how you obtain the contract `Address` vary by soroban-sdk version — check docs.rs for your pinned `soroban-sdk`.
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

**Tip:** For more robust auth testing, consider using the `MockAuth` / `MockAuthInvoke` structs available in newer soroban-sdk versions — they provide specific auth scenario testing without raw tuple assertions.

### Testing Panics (Expected Failures)

Use `#[should_panic(expected = "...")]` to test that your contract correctly reverts on invalid input or unauthorized access.

```rust
#[test]
#[should_panic(expected = "insufficient funds")]
fn test_withdraw_too_much() {
    let env = Env::default();
    let contract_id = env.register(MyContract, ());
    let client = MyContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    env.mock_all_auths();
    client.withdraw(&user, &9999); // Should panic
}
```

### Running Tests

```bash
cargo test
```

---

## 2. Testing with Stellar Asset Contract (SAC)

To test contracts that interact with XLM or custom tokens, you need to deploy the built-in SAC within your test environment.

```rust
use soroban_sdk::token;

#[test]
fn test_with_token() {
    let env = Env::default();
    env.mock_all_auths();

    // Generate an admin for the token
    let token_admin = Address::generate(&env);

    // Deploy the SAC token natively in the test environment
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::AdminClient::new(&env, &token_id);
    let token = token::Client::new(&env, &token_id);

    // Mint tokens to a user
    let user = Address::generate(&env);
    token_client.mint(&user, &1000);

    // Deploy your contract
    let my_contract_id = env.register(MyContract, ());
    let client = MyContractClient::new(&env, &my_contract_id);

    // Now you can pass `token_id` into your contract functions
    client.deposit(&user, &token_id, &100);

    assert_eq!(token.balance(&user), 900);
    assert_eq!(token.balance(&my_contract_id), 100);
}
```

---

## 3. Testing via Stellar CLI (Local Sandbox)

Before deploying to Testnet, you can run an interactive sandbox using the Stellar CLI.

```bash
# Compile
stellar contract build

# Generate test identities
stellar keys generate alice
stellar keys generate bob

# Deploy contract to local sandbox (no network required)
stellar contract deploy --wasm target/.../my_contract.wasm \
  --source alice \
  --alias my_contract

# Invoke contract
stellar contract invoke \
  --id my_contract \
  --source bob \
  -- \
  deposit \
  --user bob \
  --amount 100

# Read contract storage
stellar contract read --id my_contract
```

---

## 4. Testnet Deployment & E2E Testing

Testnet is a live network maintained by SDF that resets periodically (usually quarterly).

**1. Set up network config:**
```bash
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```
(Example uses the SDF public **testnet** RPC host for quick setup; for production-like or high-volume testing, pick a URL from [Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers).)

**2. Fund identity on Testnet:**
```bash
stellar keys fund alice --network testnet
```

**3. Deploy:**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source alice \
  --network testnet
```

For E2E tests, you can write JavaScript/TypeScript scripts using `@stellar/stellar-sdk` to simulate frontend interactions against the deployed Testnet contract (see `/rpc/SKILL.md` for JS SDK usage).

---

## Official documentation

- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Network resource limits & fees: https://developers.stellar.org/docs/networks/resource-limits-fees  
- Stellar Lab network limits: https://lab.stellar.org/network-limits  
- Soroban overview: https://developers.stellar.org/docs/build/smart-contracts/overview  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/testing — MIT License*

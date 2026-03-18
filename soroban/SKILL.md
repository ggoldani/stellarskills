---
name: stellarskills-soroban
description: Soroban smart contracts (Rust/WASM), syntax, architecture
---

# STELLARSKILLS — Soroban

> Stellar's smart contract platform. Rust/WASM contracts, storage types, auth, invocation, resource limits.

---

## What is Soroban?

Soroban is Stellar's smart contract platform, live on mainnet since 2024. Contracts are written in **Rust**, compiled to **WASM**, and executed in a deterministic sandbox on-chain.

Key differences from EVM:
- No Solidity — Rust only
- No global mutable state — contracts use typed storage (Instance, Persistent, Temporary)
- Explicit auth model — `env.require_auth(&address)` rather than `msg.sender`
- Resource budget — every invocation has CPU/memory/ledger read-write limits
- Classic assets accessible via SAC (Stellar Asset Contract) — see `/assets/SKILL.md`

---

## Project Setup

```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Create new contract project
stellar contract init my_contract
cd my_contract
```

```toml
# Cargo.toml
[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { version = "21.0.0", features = ["alloc"] }

[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils", "alloc"] }
```

---

## Contract Structure

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

// Define storage key types
#[contracttype]
pub enum DataKey {
    Balance(Address),
    Admin,
    TotalSupply,
}

// Mark struct as a contract
#[contract]
pub struct MyContract;

// Implement contract functions
#[contractimpl]
impl MyContract {
    /// Initialize the contract (called once after deploy)
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    /// Get a value
    pub fn get_balance(env: Env, address: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    /// Set a value (auth required)
    pub fn set_balance(env: Env, admin: Address, target: Address, amount: i128) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("not admin");
        }
        env.storage().persistent().set(&DataKey::Balance(target), &amount);
    }
}
```

---

## Storage Types & Data Structures

Soroban does **not** use EVM-like global memory structures (like `mapping(address => uint)`). It uses explicit typed ledger storage (`Persistent`, `Instance`, `Temporary`) to prevent unbounded memory scaling and handle state rent (TTL).

👉 **For detailed instructions on how to structure data, store maps, and manage TTL rent, you must read `/storage/SKILL.md`.**

---

## Authentication & Authorization

Soroban uses an explicit pull-based auth model. Contracts pull authorization from addresses — they don't infer it from transaction signers.

```rust
// Require that `caller` has authorized this invocation
caller.require_auth();

// Require auth with specific args (more secure — prevents reuse)
caller.require_auth_for_args(
    (amount, destination).into_val(&env)
);
```

### Contract-to-Contract Authorization
When contract A calls contract B, contract A can authorize on behalf of the user it has already authenticated:

```rust
// In contract A — after user has authorized A:
user.require_auth();

// Now call contract B — authorization flows through
let token_client = token::Client::new(&env, &token_contract);
token_client.transfer(&user, &recipient, &amount);
```

### Invoker Auth
If a transaction directly invokes a contract (no sub-call), the invoker is automatically authorized for that contract. No explicit signing needed in simple cases.

---

## Events

```rust
env.events().publish(
    (symbol_short!("transfer"),),       // topics (up to 4)
    (from.clone(), to.clone(), amount), // data
);
```

Events are indexed by topic and can be queried via Soroban RPC (`getEvents`). Use `symbol_short!` for single-word topics (up to 9 chars).

---

## Cross-Contract Calls

```rust
use soroban_sdk::{contract, contractclient, Address, Env};

// Define the interface of the contract you're calling
#[contractclient(name = "TokenClient")]
trait TokenInterface {
    fn balance(env: Env, id: Address) -> i128;
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

// In your contract implementation:
let token = TokenClient::new(&env, &token_contract_id);
let bal = token.balance(&user);
token.transfer(&user, &recipient, &amount);
```

---

## Working with XLM and Classic Assets

Use the SAC (Stellar Asset Contract) to interact with classic assets inside Soroban:

```rust
use soroban_sdk::token;

// XLM native SAC
let xlm_client = token::Client::new(&env, &xlm_contract_id);
xlm_client.transfer(&from, &to, &amount_in_stroops);

// USDC SAC
let usdc_client = token::Client::new(&env, &usdc_contract_id);
let balance = usdc_client.balance(&user);
```

Get contract IDs via JS SDK:
```javascript
import { Asset, Networks } from "@stellar/stellar-sdk";
const xlmContractId = Asset.native().contractId(Networks.MAINNET);
const usdcContractId = new Asset("USDC", USDC_ISSUER).contractId(Networks.MAINNET);
```

---

## Resource Limits & Budget

Every Soroban invocation has a resource budget. Exceeding it causes the transaction to fail.

Key limits (approximate, subject to change):
- **CPU instructions**: ~100M per transaction
- **Memory**: ~40MB
- **Ledger entries read**: 40 per transaction
- **Ledger entries write**: 25 per transaction
- **Events**: 8KB total

### Check resource usage during simulation
```javascript
const sim = await sorobanRpc.simulateTransaction(tx);
console.log(sim.cost); // { cpuInsns, memBytes }
console.log(sim.minResourceFee);
```

If simulation fails with resource errors, optimize your contract (reduce storage reads, avoid large data in events).

---

## Build & Compile

```bash
# Build contract
stellar contract build

# Optimized build (smaller WASM)
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/my_contract.wasm
```

Output: `target/wasm32-unknown-unknown/release/my_contract.wasm`

---

## Deploy

```bash
# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source my-key \
  --network testnet

# Returns: CONTRACT_ID (C...)
```

```javascript
// Deploy via JS SDK
import { SorobanRpc, TransactionBuilder } from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const account = await server.getAccount(sourcePublicKey);

const uploadTx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
  .setTimeout(30)
  .build();

const preparedTx = await server.prepareTransaction(uploadTx);
preparedTx.sign(keypair);
const result = await server.sendTransaction(preparedTx);
```

---

## Invoke a Contract

```bash
# Via CLI
stellar contract invoke \
  --id CONTRACT_ID \
  --source my-key \
  --network testnet \
  -- \
  initialize \
  --admin GADMIN_ADDRESS
```

```javascript
// Via JS SDK
import { Contract, SorobanRpc } from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract(contractId);

const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
  .addOperation(
    contract.call("get_balance", nativeToScVal(userAddress, { type: "address" }))
  )
  .setTimeout(30)
  .build();

// Simulate first (always simulate before sending)
const sim = await server.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);

const preparedTx = assembleTransaction(tx, sim);
preparedTx.sign(keypair);
const sendResult = await server.sendTransaction(preparedTx);
```

---

## Common Patterns

### Access Control
```rust
fn only_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
}
```

### Reentrancy Protection
Soroban is NOT inherently reentrancy-safe in all cases. Use a lock flag for sensitive operations:
```rust
fn get_and_lock(env: &Env) {
    if env.storage().temporary().has(&DataKey::Lock) {
        panic!("reentrant call");
    }
    env.storage().temporary().set(&DataKey::Lock, &true);
}
```

### Safe Integer Math
Rust's default integer overflow panics in debug mode and wraps in release. Use checked arithmetic:
```rust
let new_balance = balance.checked_add(amount).expect("overflow");
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `wasm_vm_error` | Contract panicked or exceeded budget | Check logic, reduce resource usage |
| `auth_not_authorized` | Missing `require_auth` signature | Ensure invoker signed and auth matches |
| `storage_not_live` | Accessing expired entry | Extend TTL before reading |
| `invoke_error: value missing` | Storage key not set | Use `.unwrap_or()` or check `.has()` first |
| Simulation succeeds, submission fails | State changed between sim and submit | Re-simulate with latest ledger |

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/soroban — MIT License*

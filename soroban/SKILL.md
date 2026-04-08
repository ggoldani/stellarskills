---
name: stellarskills-soroban
description: Stellar's smart contract platform. Rust/WASM contracts, constructors, storage types, auth, invocation, resource limits.
---

# STELLARSKILLS — Soroban

> Stellar's smart contract platform. Rust/WASM contracts, constructors, storage types, auth, invocation, resource limits.

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
# Pin to the soroban-sdk release that matches your Protocol / `stellar contract build` toolchain.
# Latest on docs.rs is often ahead of testnet — verify: https://docs.rs/soroban-sdk/latest/soroban_sdk/
soroban-sdk = { version = "25.3.0", features = ["alloc"] }

[dev-dependencies]
soroban-sdk = { version = "25.3.0", features = ["testutils", "alloc"] }
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
    /// Constructor (called automatically once upon deployment, introduced in Protocol 22)
    pub fn __constructor(env: Env, admin: Address) {
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

Events are indexed by topic and can be queried via **Stellar RPC** (`getEvents`). Use `symbol_short!` for single-word topics (up to 9 chars).

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

Get contract IDs via JS SDK (Circle USDC issuers — verify: https://developers.circle.com/stablecoins/usdc-contract-addresses):
```javascript
import { Asset, Networks } from "@stellar/stellar-sdk";
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const xlmContractId = Asset.native().contractId(Networks.MAINNET);
const usdcMainnet = new Asset("USDC", USDC_ISSUER_MAINNET).contractId(Networks.MAINNET);
const usdcTestnet = new Asset("USDC", USDC_ISSUER_TESTNET).contractId(Networks.TESTNET);
```

---

## Resource limits, fees, and metering

Every Soroban transaction must stay within **validator-voted** per-transaction limits (CPU instructions, ledger entry reads/writes, I/O bytes, transaction size, events/return value size, etc.) and pay **resource + inclusion** fees. Limits and fee **rates change** — never hardcode production caps from a blog or old tutorial.

**Official sources (use these, not static numbers in this skill):**

- [Fees, resource limits, and metering](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) — inclusion vs resource fee, surge pricing, smart contract vs classic competition  
- [Resource Limits & Fees](https://developers.stellar.org/docs/networks/resource-limits-fees) — how to read current values (**Stellar Lab**, `stellar network settings`)  
- [Stellar Lab — Network limits](https://lab.stellar.org/network-limits) — live tables for Testnet / Mainnet / Futurenet  
- Canonical fee implementation (protocol): [rs-soroban-env fees.rs](https://github.com/stellar/rs-soroban-env/blob/main/soroban-env-host/src/fees.rs) (linked from the official fees doc)

### Check resource usage during simulation
```javascript
const sim = await sorobanRpc.simulateTransaction(tx);
console.log(sim.cost); // e.g. cpuInsns, memBytes — shape depends on SDK version
console.log(sim.minResourceFee);
```

If simulation fails with resource errors, optimize your contract (fewer storage reads/writes, smaller events) or adjust declared budgets per official guidance.

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
# Deploy to testnet with constructor arguments
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source my-key \
  --network testnet \
  -- \
  --admin GADMIN_ADDRESS

# Returns: CONTRACT_ID (C...)
```

In tests, the constructor arguments are passed when registering the contract:
```rust
let contract_id = env.register(MyContract, (admin_address,));
```

```javascript
// Deploy via JS SDK — use an RPC URL from https://developers.stellar.org/docs/data/apis/rpc/providers (SDF testnet host shown for quick dev only)
import { SorobanRpc, TransactionBuilder, Operation, Networks, Keypair } from "@stellar/stellar-sdk";

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
  get_balance \
  --address GUSER_ADDRESS
```

```javascript
// Via JS SDK (Stellar RPC) — RPC URL: see https://developers.stellar.org/docs/data/apis/rpc/providers
import { Contract, SorobanRpc, TransactionBuilder, Networks, nativeToScVal } from "@stellar/stellar-sdk";

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

const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
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

## Official documentation

- Soroban overview: https://developers.stellar.org/docs/build/smart-contracts/overview  
- Storing data / storage concepts: https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Network resource limits & fees: https://developers.stellar.org/docs/networks/resource-limits-fees  
- Stellar Lab network limits: https://lab.stellar.org/network-limits  
- Fees & metering: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering  
- soroban-sdk (Rust): https://docs.rs/soroban-sdk/latest/soroban_sdk/  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/soroban — MIT License*

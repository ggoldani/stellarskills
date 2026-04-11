---
name: stellarskills-soroban
description: Stellar smart contracts. Rust/WASM, constructors, storage, auth, invocation, resource limits.
---

# STELLARSKILLS — Soroban

> Stellar smart contracts: Rust → WASM, constructors (Protocol 22), explicit auth, typed storage, resource budget per invocation.

---

## When to use

- Writing or deploying smart contracts on Stellar (Rust/WASM)
- Calling contracts from CLI or JS SDK
- Working with SAC (Stellar Asset Contract) to transfer XLM or classic assets inside contracts
- Debugging contract auth, storage TTL, or resource limit errors

---

## Quick reference

| Operation | Key detail |
|-----------|------------|
| Init project | `stellar contract init my_contract` |
| Build | `stellar contract build` → WASM in `target/wasm32-unknown-unknown/release/` |
| Deploy (CLI) | `stellar contract deploy --wasm ... --source KEY --network testnet` |
| Invoke (CLI) | `stellar contract invoke --id C... --source KEY --network testnet -- fn_name --arg val` |
| Invoke (JS) | `Contract.call("fn", ...args)` — SDK v15+ auto-converts args via `type` param |
| Get SAC contract ID | `Asset.native().contractId(Networks.MAINNET)` |
| USDC mainnet issuer | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` (verify: https://developers.circle.com/stablecoins/usdc-contract-addresses) |
| Auth pull | `address.require_auth()` or `address.require_auth_for_args(...)` |
| Event | `env.events().publish((topic,), (data,))` |

---

## Project setup

```bash
cargo install --locked stellar-cli
stellar contract init my_contract && cd my_contract
```

```toml
[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { version = "25.3.1" } # verify: https://docs.rs/soroban-sdk/latest/soroban_sdk/

[dev-dependencies]
soroban-sdk = { version = "25.3.1", features = ["testutils"] }
```

---

## Contract skeleton

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn hello(env: Env) -> Symbol {
        soroban_sdk::symbol_short!("hello")
    }
}
```

---

## Storage keys

```rust
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
    Admin,
    TotalSupply,
}
```

Storage types — choose by lifecycle:
- **Instance** (`env.storage().instance()`) — lives as long as the contract. Cleared when contract is removed.
- **Persistent** (`env.storage().persistent()`) — survives across contract upgrades. TTL rent applies.
- **Temporary** (`env.storage().temporary()`) — one transaction only. No TTL needed.

---

## Contract functions example

```rust
#[contractimpl]
impl MyContract {
    /// Constructor — called automatically once upon deployment (Protocol 22)
    pub fn __constructor(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    pub fn get_balance(env: Env, address: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }
}
```

---

## Authentication

Soroban uses pull-based auth — contracts explicitly require authorization from addresses.

```rust
// Basic: require caller authorized this invocation
caller.require_auth();

// Safer: bind to specific args (prevents signature reuse)
caller.require_auth_for_args((amount, destination).into_val(&env));
```

Contract-to-contract auth: after `user.require_auth()` in contract A, calling contract B flows the authorization through automatically.

---

## Events

```rust
env.events().publish(
    (symbol_short!("transfer"),),
    (from.clone(), to.clone(), amount),
);
```

Topics indexed by RPC `getEvents`. `symbol_short!` max 9 chars.

---

## Cross-contract calls

```rust
#[contractclient(name = "TokenClient")]
trait TokenInterface {
    fn balance(env: Env, id: Address) -> i128;
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

let token = TokenClient::new(&env, &token_contract_id);
let bal = token.balance(&user);
token.transfer(&user, &recipient, &amount);
```

---

## Working with SAC (classic assets)

```rust
use soroban_sdk::token;

let xlm_client = token::Client::new(&env, &xlm_contract_id);
xlm_client.transfer(&from, &to, &amount_in_stroops);

let usdc_client = token::Client::new(&env, &usdc_contract_id);
let balance = usdc_client.balance(&user);
```

Get contract IDs:
```javascript
import { Asset, Networks } from "@stellar/stellar-sdk";
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const xlmContractId = Asset.native().contractId(Networks.MAINNET);
const usdcMainnet = new Asset("USDC", USDC_ISSUER_MAINNET).contractId(Networks.MAINNET);
```

---

## Build

```bash
stellar contract build
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/my_contract.wasm
```

Output: `target/wasm32-unknown-unknown/release/my_contract.wasm`

---

## Deploy

CLI:
```bash
# Deploy to testnet — constructor args passed after --
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source my-key \
  --network testnet \
  -- \
  --admin GADMIN_ADDRESS
```

JS SDK:
```javascript
import { SorobanRpc, TransactionBuilder, Operation, Networks } from "@stellar/stellar-sdk";
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const account = await server.getAccount(sourcePublicKey);
const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
  .setTimeout(30).build();
const preparedTx = await server.prepareTransaction(tx);
preparedTx.sign(keypair);
await server.sendTransaction(preparedTx);
```

---

## Invoke

In tests, constructor args are passed when registering:
```rust
let contract_id = env.register(MyContract, (admin_address,));
```

CLI invoke (no `initialize` needed — constructor ran on deploy):
```bash
stellar contract invoke \
  --id CONTRACT_ID --source my-key --network testnet \
  -- get_balance --address GUSER_ADDRESS
```

JS SDK:
```javascript
import { Contract, SorobanRpc, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
const contract = new Contract(contractId);
const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
  .addOperation(contract.call("get_balance", ...args)) // SDK v15+: auto-converts args via type param
  .setTimeout(30).build();
const sim = await server.simulateTransaction(tx);
const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
preparedTx.sign(keypair);
await server.sendTransaction(preparedTx);
```

---

## Resource limits

Per-invocation limits are validator-voted and change — never hardcode production caps.

| Source | What it has |
|--------|------------|
| [Fees, limits & metering](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering) | Inclusion vs resource fee, surge pricing |
| [Network limits](https://developers.stellar.org/docs/networks/resource-limits-fees) | Current values via `stellar network settings` |
| [Stellar Lab](https://lab.stellar.org/network-limits) | Live tables for testnet/mainnet |

```javascript
const sim = await sorobanRpc.simulateTransaction(tx);
console.log(sim.cost);        // cpuInsns, memBytes
console.log(sim.minResourceFee);
```

---

## Common patterns

### Safe integer math
```rust
let new_balance = balance.checked_add(amount).expect("overflow");
```

### Access control
```rust
fn only_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
}
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Simulation succeeds, submission fails | State changed between sim and submit — re-simulate |
| Access expired storage entry | `storage_not_live` — extend TTL before reading |
| Self-reentrancy via recursion | Possible but architecturally limited (sync execution model) |
| Contract removed, persistent storage remains | Data persists until TTL expires — can migrate to new contract |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `wasm_vm_error` | Contract panicked or exceeded budget | Check logic, reduce resource usage |
| `auth_not_authorized` | Missing `require_auth` signature | Ensure invoker signed and auth matches args |
| `storage_not_live` | Accessing expired entry | Extend TTL before reading |
| `invoke_error: value missing` | Storage key not set | Use `.unwrap_or()` or check `.has()` first |
| Sim OK, send fails | State drift between sim and submit | Re-simulate with latest ledger |

---

## SDKs

```bash
npm install @stellar/stellar-sdk        # JS/TS (verify: https://github.com/stellar/js-stellar-sdk/releases)
pip install stellar-sdk                 # Python
```

---

## See also

- `/storage/SKILL.md` — TTL rent, maps, storage patterns (deep-dive)
- `/security/SKILL.md` — `require_auth()` edge cases, reentrancy guards
- [Soroban docs](https://developers.stellar.org/docs/build/smart-contracts/overview)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/soroban — MIT License*

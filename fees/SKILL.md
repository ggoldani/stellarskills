---
name: stellarskills-fees
description: Stellar transaction fees, base fee, surge pricing, Soroban resource fees, and fee bumps.
---

# STELLARSKILLS — Fees

> Stellar transaction fees, base fee, surge pricing, resource fees (Soroban / Stellar RPC), and fee bumps.

---

## The Fee Philosophy

Stellar is designed to be inexpensive. Fees exist primarily as a spam deterrent, not as a major source of revenue or yield for validators.

On Stellar:
- **Base Fee**: Applies to classic operations (payments, trustlines, etc.)
- **Resource Fee**: Applies to Soroban smart contracts (CPU, memory, ledger I/O)
- **Refunds**: You specify a maximum fee, but you are only charged the effective inclusion fee needed to clear the ledger, up to that cap. **Note:** For classic transactions, unused fee is refunded. For Soroban smart contracts, most resource fees are NOT refunded even if under-declared.

---

## Classic Fees (Base Fee)

Every transaction specifies a `fee` (in **stroops**, where 1 XLM = 10,000,000 stroops). This is the **maximum total fee** you are willing to pay for the transaction.

### Minimum Fee Calculation
The minimum fee for a classic transaction is:
```
min_fee = base_fee × number_of_operations
```

- **Default base fee**: 100 stroops (0.00001 XLM)
- Transaction with 1 operation: min fee = 100 stroops
- Transaction with 10 operations: min fee = 1000 stroops

```javascript
import { TransactionBuilder, BASE_FEE } from "@stellar/stellar-sdk";

// BASE_FEE constant is 100
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, // 100 stroops per operation
  // ...
});
```

### Surge pricing (official behavior)

Per [Fees, resource limits, and metering](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering): if traffic is **below** the per-ledger capacity (**currently** up to **1,000 operations** for transactions that **do not** execute smart contracts, and separate limits for **smart contract** transactions), you typically pay only the **network minimum** inclusion fee (currently **100 stroops** per operation unless validators change it). If traffic **exceeds** capacity, the network enters **surge pricing**: transactions sort by inclusion fee bid; you pay the **minimum** fee among those included in the set, not necessarily your max bid.

Smart contract transactions compete on **multiple resources** (instructions, ledger entry accesses, I/O, etc.) and hit surge **more often** than classic traffic — plan fee bids accordingly.

**Crucial detail:** Your transaction `fee` field is a **maximum** bid; you are charged the **effective** inclusion fee needed to clear the ledger, up to that cap (see official doc above).

Current limits and fee rates are easiest to inspect live in **[Stellar Lab → Network limits](https://lab.stellar.org/network-limits)** (linked from the same doc).

### Dynamic Fee Estimation
Always fetch current fee stats before building a transaction in production to avoid stalled transactions:

```javascript
import { Horizon, TransactionBuilder } from "@stellar/stellar-sdk";
// Horizon is legacy for new integrations — see https://developers.stellar.org/docs/data/apis/horizon
// On-chain fee stats for new systems: use Stellar RPC / providers — https://developers.stellar.org/docs/data/apis/rpc/providers
const server = new Horizon.Server("https://horizon.stellar.org");
const feeStats = await server.feeStats();

// Use the 99th percentile for high priority, or 50th for normal
const priorityFee = feeStats.fee_charged.p99;
const normalFee = feeStats.fee_charged.p50;

const tx = new TransactionBuilder(account, {
  fee: priorityFee.toString(),
  // ...
});
```

---

## Soroban Resource Fees

Soroban smart contracts charge for the exact resources they consume:
1. CPU instructions
2. Memory (RAM)
3. Ledger reads/writes (I/O)
4. Transaction size (bytes)
5. Events emitted

### How to calculate
You never calculate this manually. You must use `simulateTransaction` on **Stellar RPC** (JSON-RPC; JS: `SorobanRpc.Server`). See also `/rpc/SKILL.md` for the full submit/poll flow.

```javascript
import {
  SorobanRpc,
  TransactionBuilder,
  Contract,
  Networks,
  BASE_FEE,
  nativeToScVal,
} from "@stellar/stellar-sdk";

// RPC URL: https://developers.stellar.org/docs/data/apis/rpc/providers
const sorobanServer = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract(contractId);

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    contract.call("my_func", nativeToScVal(arg, { type: "..." })) // match arg types to your contract
  )
  .setTimeout(30)
  .build();

const sim = await sorobanServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(String(sim.error));

const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
// preparedTx has footprint + resource fee from simulation — sign and sendTransaction next
```

### Extending Soroban Budgets
If simulation fails because it hits the default resource limits, you can manually increase the budget (if the network max allows it):

*(Note: Most dApps should optimize their contracts rather than increasing limits, as limits protect network throughput).*

---

## Fee Bump Transactions

A fee bump transaction allows Account A to pay the fee for Account B's transaction *after* Account B has already signed it.

**Use cases:**
- Rescuing a stuck transaction (one submitted with too low a fee during a surge).
- Sponsoring fees for users (dApp pays the gas so the user doesn't need XLM).

### Creating a Fee Bump
```javascript
import { FeeBumpTransaction, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

// 1. You receive an inner transaction signed by the user (it might be stuck)
// const innerTx = ...

// 2. Wrap it in a FeeBump
const feeBump = TransactionBuilder.buildFeeBumpTransaction(
  sponsorKeypair,          // Account paying the higher fee
  "5000",                  // New max base fee per operation (in stroops)
  innerTx,                 // The original signed transaction
  Networks.MAINNET
);

// 3. Sponsor signs
feeBump.sign(sponsorKeypair);

// 4. Submit
await server.submitTransaction(feeBump);
```

**Important**: The inner transaction's sequence number and signatures remain valid. Only the fee payer changes.

---

## Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `tx_insufficient_fee` | The network is surging and your fee is too low | Fetch `feeStats` and submit with higher fee, or use Fee Bump |
| `op_underfunded` | Account doesn't have enough XLM to cover fee + min balance | Add more XLM. Remember minimum balance requirements! |
| Soroban simulation `wasm_vm_error` | Contract exceeded resource budget (often CPU) | Optimize contract logic or reduce storage reads/writes |

---

## Official documentation

- Fees & resource metering (fundamentals): https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering  
- Network resource limits & fees (entry point; often defers to Lab / CLI): https://developers.stellar.org/docs/networks/resource-limits-fees  
- Live limits in **Stellar Lab**: https://lab.stellar.org/network-limits  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/fees — MIT License*

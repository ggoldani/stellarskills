# STELLARSKILLS — Fees

> Stellar transaction fees, base fee, surge pricing, resource fees (Soroban), and fee bumps.

---

## The Fee Philosophy

Stellar is designed to be inexpensive. Fees exist primarily as a spam deterrent, not as a major source of revenue or yield for validators.

On Stellar:
- **Base Fee**: Applies to classic operations (payments, trustlines, etc.)
- **Resource Fee**: Applies to Soroban smart contracts (CPU, memory, ledger I/O)
- **Refunds**: You specify a maximum fee, but you are only charged the minimum necessary to be included in the ledger. The rest is refunded.

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

### Surge Pricing (Fee Market)
If the network is congested (more than 1000 operations per ledger), surge pricing activates. Transactions with higher base fees are prioritized.

**Crucial detail**: You only pay the *lowest* fee required to make it into the ledger, up to your specified maximum. If you set your fee to 10,000 stroops, but the clearing price is 500 stroops, you only pay 500.

### Dynamic Fee Estimation
Always fetch current fee stats before building a transaction in production to avoid stalled transactions:

```javascript
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
You never calculate this manually. You must use `simulateTransaction` on the Soroban RPC.

```javascript
// 1. Build raw tx with a placeholder fee
const tx = new TransactionBuilder(account, { fee: "100" })
  .addOperation(contract.call("my_func"))
  .build();

// 2. Simulate
const sim = await sorobanServer.simulateTransaction(tx);

// 3. Assemble (applies footprint and calculated resource fee)
const preparedTx = SorobanRpc.assembleTransaction(tx, sim);

// preparedTx now has the correct fee and resources attached
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

*stellarskills.vercel.app/fees — MIT License*
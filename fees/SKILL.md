---
name: stellarskills-fees
description: Transaction fees, base fee, surge pricing, Soroban resource fees, and fee bumps.
---

# STELLARSKILLS — Fees

> Transaction fees, base fee, surge pricing, Soroban resource fees, and fee bumps.

---

## When to use

- Setting transaction fees for classic or Soroban operations
- Estimating fees before submission to avoid stalled transactions
- Building fee bump transactions (sponsor fees, rescue stuck txs)
- Debugging fee-related failures (`tx_insufficient_fee`, `op_underfunded`)

---

## Quick reference

| Fee type | Formula / detail |
|----------|-----------------|
| Classic min fee | `base_fee × num_operations` (base fee = 100 stroops default) |
| 1 XLM in stroops | 10,000,000 stroops |
| Soroban resource fee | CPU + memory + I/O + tx size + events (via simulation) |
| Surge pricing | Network sorts by fee bid; you pay the minimum that clears, up to your max |
| Fee bump | `buildFeeBumpTransaction(sponsor, newFee, innerTx, network)` |
| Refunds (classic) | Unused fee refunded — you pay only the effective inclusion fee |
| Refunds (Soroban) | Most resource fees are **not** refunded even if under-declared |

---

## Classic fees

Every transaction specifies a `fee` in stroops — the **maximum** total fee. You pay the effective inclusion fee needed to clear the ledger, up to that cap.

```
min_fee = base_fee × number_of_operations
```

```javascript
import { TransactionBuilder, BASE_FEE } from "@stellar/stellar-sdk";

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, // 100 stroops per operation
}).setTimeout(30).build();
```

### Surge pricing

When traffic exceeds per-ledger capacity, the network enters surge pricing: transactions sort by inclusion fee bid. Smart contract transactions compete on multiple resources and hit surge more often than classic traffic.

### Dynamic fee estimation

Fetch live fee stats before building transactions in production:

```javascript
const feeStats = await server.feeStats();
const priorityFee = feeStats.fee_charged.p99;  // high priority
const normalFee = feeStats.fee_charged.p50;     // normal priority
```

Live limits: [Stellar Lab → Network limits](https://lab.stellar.org/network-limits).

---

## Soroban resource fees

Soroban charges for exact resources consumed: CPU instructions, memory, ledger reads/writes, tx size, and events. Calculate via `simulateTransaction` on Stellar RPC — never manually.

```javascript
import { SorobanRpc, Contract, TransactionBuilder, Networks, BASE_FEE } from "@stellar/stellar-sdk";

const sorobanServer = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract(contractId);
```

```javascript
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
}).addOperation(contract.call("my_func", nativeToScVal(arg, { type: "..." })))
  .setTimeout(30).build();

const sim = await sorobanServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(String(sim.error));
const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
```

`preparedTx` includes footprint + resource fee from simulation — sign and `sendTransaction` next.

If simulation hits default resource limits, increase budget only if the network max allows. Prefer optimizing contract logic over raising limits.

---

## Fee bump transactions

Account A pays the fee for Account B's already-signed transaction. Use cases: rescuing stuck transactions during surge, sponsoring fees for users without XLM.

```javascript
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const feeBump = TransactionBuilder.buildFeeBumpTransaction(
  sponsorKeypair, "5000", innerTx, Networks.MAINNET
);
feeBump.sign(sponsorKeypair);
await server.submitTransaction(feeBump);
```

The inner transaction's sequence number and signatures remain valid. Only the fee payer changes.

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Fee too low during surge | `tx_insufficient_fee` — tx sits in pool until it expires |
| Fee bump on already-included tx | Fails — transaction is already finalized |
| Soroban resource under-declared | Simulation returns actual cost; if you set fee below it, submission fails |
| Classic tx with extra stroops | Unused fee refunded to source account |
| Soroban tx with extra resource fee | Most resource fees are **not** refunded |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `tx_insufficient_fee` | Network surging, fee too low | Fetch `feeStats`, use higher fee, or fee bump |
| `op_underfunded` | Not enough XLM for fee + minimum balance | Fund account with more XLM |
| `wasm_vm_error` (simulation) | Contract exceeded CPU/budget limit | Optimize contract logic or reduce storage ops |

---

## See also

- `/accounts/SKILL.md` — minimum balance and reserve calculations
- `/rpc/SKILL.md` — full Soroban submit/poll flow via Stellar RPC
- [Fees, resource limits, and metering](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/fees — MIT License*

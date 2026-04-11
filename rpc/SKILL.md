---
name: stellarskills-rpc
description: Stellar RPC (JSON-RPC) for Soroban smart contracts — simulation, invocation, ledger state, events.
---

# STELLARSKILLS — Stellar RPC

> JSON-RPC 2.0 API for Soroban smart contracts. Separate from Horizon (legacy REST). Tooling may still expose `SorobanRpc` in the JS SDK.

---

## When to use

- Calling a Soroban smart contract (read or write)
- Reading contract storage (ledger entries) without invoking
- Fetching contract events for indexing or UI
- Checking network health, fees, or ledger state
- Any new integration — Horizon is legacy; use RPC for smart contracts

---

## Quick reference

| Method | Purpose | Key params |
|--------|---------|------------|
| `getHealth` | Liveness check | — |
| `getLatestLedger` | Current sequence + protocol version | — |
| `getNetwork` | Network passphrase | — |
| `getFeeStats` | Fee percentiles (p10–p99) | — |
| `simulateTransaction` | Dry-run a tx, returns footprint + result | Transaction XDR |
| `sendTransaction` | Submit signed transaction | Signed Transaction XDR |
| `getTransaction` | Poll submitted tx status | Transaction hash |
| `getLedgerEntries` | Fetch raw contract storage entries | LedgerKey array |
| `getEvents` | Fetch historical contract events | startLedger, filters, limit |

### Providers

| Provider | URL | Notes |
|----------|-----|-------|
| SDF public (testnet) | `https://soroban-testnet.stellar.org` | Rate-limited, dev only |
| Blockdaemon, QuickNode, etc. | See [providers list](https://developers.stellar.org/docs/data/apis/rpc/providers) | Mainnet requires a provider |

---

## Setup

```javascript
import {
  SorobanRpc, Networks, Keypair, TransactionBuilder,
  Contract, BASE_FEE, nativeToScVal, xdr,
} from "@stellar/stellar-sdk";

// verify: https://developers.stellar.org/docs/data/apis/rpc/providers
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
```

---

## Contract invocation flow

Three steps: simulate → assemble → submit.

### Simulate

```javascript
const contract = new Contract(contractId);
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    contract.call("get_balance", nativeToScVal(userAddress, { type: "address" }))
  )
  .setTimeout(30).build();

const sim = await server.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) {
  console.error("Simulation failed:", sim.error);
}
```

### Assemble & sign

```javascript
const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
preparedTx.sign(keypair);
```

### Submit

```javascript
const sendRes = await server.sendTransaction(preparedTx);

if (sendRes.status === "ERROR") {
  console.error("Send failed:", sendRes.errorResultXdr);
}
```

### Poll for result

```javascript
while (true) {
  const status = await server.getTransaction(sendRes.hash);
  if (status.status !== "NOT_FOUND") break;
  await new Promise(r => setTimeout(r, 2000));
}

if (status.status === "SUCCESS") {
  console.log("Result:", status.returnValue);
}
```

---

## Reading contract state (ledger entries)

Fetch raw storage without invoking the contract — cheaper than simulation.

```javascript
const key = xdr.ScVal.scvSymbol("Admin");
const ledgerKey = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Contract(contractId).address().toScAddress(),
    key,
    durability: xdr.ContractDataDurability.persistent(),
  })
);

const res = await server.getLedgerEntries(ledgerKey);
if (res.entries?.length > 0) {
  const value = res.entries[0].val.contractData().val();
}
```

---

## Fetching events

```javascript
const events = await server.getEvents({
  startLedger: 1000000,
  filters: [{
    type: "contract",
    contractIds: [contractId],
    topics: [
      [xdr.ScVal.scvSymbol("transfer").toXDR("base64"), "*"],
    ],
  }],
  limit: 100,
});

events.events.forEach(e => {
  console.log("Ledger:", e.ledger, "Data:", e.value);
});
```

Historical queries beyond provider retention (often ~7 days) require an indexer (Mercury, Zephyr).

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Assemble without simulating | Missing footprint — transaction fails on submission |
| Two txs from same account concurrently | `tx_bad_seq` on the second — fetch fresh sequence |
| Fee too low during surge | `tx_insufficient_fee` — check `getFeeStats` percentiles |
| `startLedger` too old | Provider returns empty or error — retention window varies |
| Contract invoked without required auth | `auth_not_authorized` — invoker must sign the auth payload |
| Horizon URL used as RPC endpoint | Connection refused — they are separate APIs |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Simulation error (missing footprint) | Assembled without simulating | Always `simulateTransaction` first |
| `tx_bad_seq` | Stale or reused sequence number | Re-fetch account before building |
| `tx_insufficient_fee` | Resource fee increased during surge | Use `getFeeStats`, bump fee |
| `auth_not_authorized` | Invoker didn't sign auth payload | Match `require_auth` logic with signers |

---

## SDKs

```bash
npm install @stellar/stellar-sdk        # JS/TS (verify: https://github.com/stellar/js-stellar-sdk/releases)
pip install stellar-sdk                 # Python
go get github.com/stellar/go-stellar-sdk@latest  # Go
```

---

## See also

- `/accounts/SKILL.md` — keypairs, account creation, funding
- [RPC API reference](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction)
- [Resource limits & fees](https://developers.stellar.org/docs/networks/resource-limits-fees)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/rpc — MIT License*

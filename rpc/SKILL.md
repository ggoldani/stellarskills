---
name: stellarskills-rpc
description: Stellar RPC (JSON-RPC) for Soroban smart contracts — simulation, invocation, ledger state, events. Official successor naming for Soroban RPC.
---

# STELLARSKILLS — Stellar RPC

> **Stellar RPC** is the supported JSON-RPC API for the Stellar network’s smart-contract layer (Soroban). It was previously referred to as “Soroban RPC”; tooling may still expose `SorobanRpc` in the JS SDK. Official docs: https://developers.stellar.org/docs/data/apis/rpc

---

## What is Stellar RPC?

Stellar RPC is the gateway to **Stellar smart contracts (Soroban)**. It is separate from **Horizon** (REST). Horizon is [legacy](https://developers.stellar.org/docs/data/apis/horizon) for new integrations; see [migration from Horizon to RPC](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc).

| Horizon (REST, legacy) | Stellar RPC (JSON-RPC) |
|------------------------|-------------------------|
| Classic protocol (payments, offers, trustlines) | Smart contracts (Rust/WASM) |
| REST API | JSON-RPC 2.0 |
| `https://horizon.stellar.org` | Provider-specific JSON-RPC URL — see [Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers) |

**Use Stellar RPC when you need to:**
- Simulate a smart contract call
- Submit a smart contract transaction (`InvokeHostFunction` operation)
- Fetch contract state (storage)
- Fetch contract events
- Fetch recent ledger state for contract execution

---

## Endpoints

**Official source of RPC URLs:** pick Testnet, Mainnet, or Futurenet from **[Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers)** (Blockdaemon, Validation Cloud, QuickNode, NowNodes, etc.).

| Network | Typical approach | Notes |
|---------|------------------|--------|
| **Mainnet** | URL from a **provider** | Required for reliable production traffic; no single mandatory public URL. |
| **Testnet** | Provider **or** SDF public host | SDF operates `https://soroban-testnet.stellar.org` for **development** (rate-limited); prefer a provider for CI/production-like tests. |
| **Futurenet** | Provider **or** `https://rpc-futurenet.stellar.org` | Preview features before they reach testnet. |

---

## Setup JS SDK

```javascript
import { SorobanRpc, Networks, Keypair, TransactionBuilder, Contract, BASE_FEE, nativeToScVal } from "@stellar/stellar-sdk";

// Replace with your chosen RPC URL from https://developers.stellar.org/docs/data/apis/rpc/providers
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
```

---

## The Contract Invocation Flow

Calling a Soroban smart contract is a 3-step process:

1. **Simulate** — Ask the RPC to run the contract locally. It returns the expected output, state changes, and required fee/resource footprint.
2. **Assemble & Sign** — Add the resource footprint and fee to the transaction, then sign it.
3. **Send & Poll** — Submit to the network, wait for it to be included in a ledger, and get the final result.

### 1. Build & Simulate
```javascript
const contractId = "C...";
const contract = new Contract(contractId);

// 1. Build raw transaction
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    contract.call("get_balance", nativeToScVal(userAddress, { type: "address" }))
  )
  .setTimeout(30)
  .build();

// 2. Simulate
const sim = await server.simulateTransaction(tx);

if (SorobanRpc.Api.isSimulationError(sim)) {
  console.error("Simulation failed:", sim.error);
  // Throw or handle
}

// 3. Assemble (applies footprint and minResourceFee from simulation)
const preparedTx = SorobanRpc.assembleTransaction(tx, sim);
```

### 2. Sign & Submit
```javascript
preparedTx.sign(keypair);

const sendResponse = await server.sendTransaction(preparedTx);

if (sendResponse.status === "ERROR") {
  console.error("Send failed:", sendResponse.errorResultXdr);
} else {
  console.log("Tx Hash:", sendResponse.hash);
}
```

### 3. Poll for Result
```javascript
let statusResponse;
while (true) {
  statusResponse = await server.getTransaction(sendResponse.hash);

  if (statusResponse.status !== "NOT_FOUND") {
    break;
  }

  // Wait 2 seconds before polling again
  await new Promise(resolve => setTimeout(resolve, 2000));
}

if (statusResponse.status === "SUCCESS") {
  console.log("Success! Result XDR:", statusResponse.returnValue);
  // Decode result XDR if needed
} else if (statusResponse.status === "FAILED") {
  console.error("Transaction failed on-chain.");
}
```

---

## Reading Contract State (Without Invoking)

If you only need to read data and don't want to use `simulateTransaction` (which has overhead), you can fetch raw ledger entries directly.

### GetLedgerEntries
```javascript
import { xdr } from "@stellar/stellar-sdk";

// Define the storage key you want to fetch
// This must match exactly how the contract stores it (e.g. Symbol("Admin"))
const key = xdr.ScVal.scvSymbol("Admin");

const ledgerKey = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Contract(contractId).address().toScAddress(),
    key: key,
    durability: xdr.ContractDataDurability.persistent(),
  })
);

const response = await server.getLedgerEntries(ledgerKey);

if (response.entries && response.entries.length > 0) {
  const entry = response.entries[0].val;
  const contractData = entry.contractData();
  const value = contractData.val();
  // Decode value based on expected type
}
```

---

## Fetching Events

Contracts emit events that are stored historically (not just in the active ledger state).

### GetEvents
```javascript
const response = await server.getEvents({
  startLedger: 1000000,
  filters: [
    {
      type: "contract",
      contractIds: [contractId],
      topics: [
        [
          xdr.ScVal.scvSymbol("transfer").toXDR("base64"),
          "*",
        ],
      ],
    },
  ],
  limit: 100,
});

response.events.forEach(event => {
  console.log("Ledger:", event.ledger);
  console.log("Topics:", event.topic);
  console.log("Data:", event.value); // ScVal XDR
});
```

**Note**: RPC Providers often restrict the `startLedger` window (e.g. only keeping the last 7 days of events) to save storage.

### Using an Indexer (The Graph Equivalents)
If you need to query historical events beyond the RPC's short retention window, or if you need to build complex aggregated views of contract state, you cannot rely on the RPC alone. You must use a dedicated **indexer**.

In the Stellar ecosystem, the standard indexers are **Mercury** and **Zephyr** (which compile WebAssembly indexing scripts). These act as the equivalents to The Graph or Envio in the EVM ecosystem.

---

## Useful Endpoints Reference

| Method | Description | Use Case |
|--------|-------------|----------|
| `getHealth` | Returns `healthy` if node is synced | Liveness check |
| `getLatestLedger` | Current sequence and protocol version | Checking sync status |
| `getNetwork` | Returns network passphrase | Verify you are on mainnet/testnet |
| `simulateTransaction` | Dry-run a tx, returns footprint | Mandatory before sending |
| `sendTransaction` | Submit signed tx | Executing state changes |
| `getTransaction` | Get status of submitted tx | Polling for completion |
| `getLedgerEntries` | Fetch raw storage | Reading contract state cheaply |
| `getEvents` | Fetch historical events | Indexing, UI updates |
| `getFeeStats` | Inclusion fee distributions (p10-p99 percentiles) for Soroban and Stellar transactions | Fee estimation |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Simulation Error (Missing Footprint) | Trying to assemble without simulating | Always run `simulateTransaction` first |
| `tx_bad_seq` | Sequence number used or stale | Re-fetch account sequence |
| `tx_insufficient_fee` | Resource fee bumped during surge | Use `getFeeStats` and increase fee |
| `auth_not_authorized` | Invoker didn't sign the auth payload | Ensure `require_auth` logic matches signers |

---

## Official documentation

- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- RPC methods (example: `simulateTransaction`): https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Network resource limits & fees: https://developers.stellar.org/docs/networks/resource-limits-fees  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/rpc — MIT License*

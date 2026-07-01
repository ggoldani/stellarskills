---
name: stellarskills-openzeppelin-relayer
description: OpenZeppelin Relayer for Stellar — reliable transaction submission, fee management, and tracking for Soroban smart contracts.
---

# STELLARSKILLS — OpenZeppelin Relayer

> OpenZeppelin Relayer for Stellar — reliable transaction submission, fee management, and tracking for Soroban smart contracts.

---

## When to use

- Submitting Stellar transactions via OpenZeppelin's managed infrastructure
- Ensuring reliable transaction delivery with automatic parallel processing and fee management
- Outsourcing transaction lifecycle management for Soroban smart contracts
- Tracking transaction status through a dedicated API
- Replacing the deprecated Launchtube service for transaction submission

---

## Installation

```bash
npm install @stellar/stellar-sdk @openzeppelin/relayer-plugin-channels
```

---

## Quick Start

### 1. Initialize Channels Client

Configure the client with your API key from OpenZeppelin. Note: Channels Relayer runs on the Channels Service endpoint.

```javascript
import * as RPChannels from '@openzeppelin/relayer-plugin-channels';

// Initialize Channels Client
const client = new RPChannels.ChannelsClient({
  baseUrl: 'https://channels.openzeppelin.com/testnet',
  apiKey: 'YOUR-API-KEY', // Generate from OpenZeppelin platform
});
```

### 2. Prepare Transaction (Account Transfer Example)

```javascript
import * as StellarSDK from '@stellar/stellar-sdk';

// Initialize RPC Server
const rpc = new StellarSDK.rpc.Server('https://soroban-testnet.stellar.org');

// Load the source account from the secret key (must be securely managed in production)
const sourceKeypair = StellarSDK.Keypair.fromSecret(process.env.SOURCE_SECRET);
const sourcePublicKey = sourceKeypair.publicKey();
const sourceAccount = await rpc.getAccount(sourcePublicKey);

// Build the transaction
const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
  fee: StellarSDK.BASE_FEE,
  networkPassphrase: StellarSDK.Networks.TESTNET,
})
.addOperation(
  StellarSDK.Operation.payment({
    destination: "GD...DESTINATION",
    asset: StellarSDK.Asset.native(),
    amount: "10", // Amount in XLM
  })
)
.setTimeout(30) // Transaction expires after 30 seconds
.build();

// Sign the transaction
transaction.sign(sourceKeypair);
```

### 3. Submit to Relayer

```javascript
try {
  // Submit the XDR to the Relayer
  const response = await client.submitTransaction({
    xdr: transaction.toXDR(), // base64 envelope XDR
  });

  // Return the transaction hash
  return response.hash;

} catch (error) {
  console.error("Failed to submit via Relayer:", error);
  throw error;
}
```

## Smart Contract Invocation Example

You can submit Soroban smart contract invocations through the Relayer. This requires simulating the transaction first to extract the function and auth XDRs, which are then submitted using `submitSorobanTransaction`.

```javascript
// Example building a contract invocation (after preparing sourceAccount)
const contractId = "CDAZ...CONTRACT_ID";
const func = "increment";
const args = []; // e.g. using StellarSDK.nativeToScVal

const contract = new StellarSDK.Contract(contractId);

// Build the initial transaction for simulation
const tx = new StellarSDK.TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: StellarSDK.Networks.TESTNET,
})
.addOperation(contract.call(func, ...args))
.setTimeout(30)
.build();

// Simulate to get auth entries and required fees/resources
const simulation = await rpc.simulateTransaction(tx);
const assembled = StellarSDK.rpc.assembleTransaction(tx, simulation).build();

// Extract function and auth XDRs
const op = assembled.operations[0];
const contractFunc = op.func.toXDR('base64');
const contractAuth = (op.auth ?? []).map((a) => a.toXDR('base64'));

// Build request for Relayer
const request = {
    func: contractFunc,
    auth: contractAuth,
};

// Submit to Channels Relayer (uses submitSorobanTransaction instead of submitTransaction)
const response = await client.submitSorobanTransaction(request);

// Poll for transaction result
let txResponse = await rpc.pollTransaction(response.hash);

// Return the decoded result from the ScVal
return StellarSDK.scValToNative(txResponse.returnValue);
```

---

## Response Object

A successful submission returns:

```json
{
  "transactionId": "string", // Internal OpenZeppelin tracking ID
  "hash": "string",          // Stellar transaction hash
  "status": "string"         // Transaction status (e.g., "confirmed")
}
```

---

## Service Status

Live status of the OpenZeppelin relayer can be viewed at: https://status.channels.openzeppelin.com/

---

## Common Errors & Edge Cases

| Issue | Cause | Fix |
|-------|-------|-----|
| Client-side CORS Error | Calling OpenZeppelin endpoints directly from a browser | Always use the SDK server-side (e.g., in a Next.js Server Action or API route) |
| Missing Auth Entries | Submitting smart contract calls using `submitTransaction` | Contract invocations should use `submitSorobanTransaction` and pass `func` and `auth` XDRs extracted via simulation |
| Transaction expired | Timeout reached before Relayer submitted | Increase `setTimeout(30)` or check network congestion |
| API Key rejected | Invalid or wrong network API key | Ensure key matches the `baseUrl` environment (`channels.openzeppelin.com/testnet` vs mainnet) |

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin-relayer — MIT License*

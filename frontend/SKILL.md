# STELLARSKILLS — Frontend Integration

> Connecting web apps to Stellar. Freighter extension, WalletConnect, and submitting transactions.

---

## 1. Connecting a Wallet

To interact with Stellar dApps, users install a browser wallet. The standard for Stellar web development is **Freighter** (built by SDF).

For mobile users and other wallets (like Lobstr), the standard is **WalletConnect**.

### Using the Freighter API

Install the API package:
```bash
npm install @stellar/freighter-api
```

Connect and get the user's address:
```javascript
import { isConnected, requestAccess, getNetworkDetails } from "@stellar/freighter-api";

async function connectWallet() {
  if (await isConnected()) {
    const address = await requestAccess(); // Prompts user
    const network = await getNetworkDetails(); // "PUBLIC", "TESTNET", or "FUTURENET"
    console.log(`Connected: ${address} on ${network.network}`);
    return address;
  } else {
    alert("Please install Freighter!");
  }
}
```

---

## 2. Signing Transactions (Classic)

If you are sending payments, creating trustlines, or placing DEX offers, you build the transaction using the JS SDK and pass it to Freighter to sign.

```javascript
import { signTransaction } from "@stellar/freighter-api";
import { TransactionBuilder, Networks, BASE_FEE, Operation, Asset } from "@stellar/stellar-sdk";

// 1. Build transaction (requires fetching account sequence from Horizon first)
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.payment({
    destination: "GBB...",
    asset: Asset.native(),
    amount: "10",
  }))
  .setTimeout(30)
  .build();

// 2. Request signature from Freighter
// Pass the XDR string and the network name
const signedTxXdr = await signTransaction(tx.toXDR(), { network: "TESTNET" });

// 3. Reconstruct the signed transaction from the returned XDR
const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);

// 4. Submit to Horizon
await horizonServer.submitTransaction(signedTx);
```

---

## 3. Signing Transactions (Soroban)

When calling a smart contract, you must simulate the transaction first to get the resource footprint and fee, *then* pass it to Freighter.

```javascript
import { signTransaction } from "@stellar/freighter-api";
import { TransactionBuilder, Networks, BASE_FEE, Contract } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);

// 1. Build initial tx
let tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(contract.call("deposit", ...))
  .setTimeout(30)
  .build();

// 2. Simulate via RPC
const sim = await rpcServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw sim.error;

// 3. Assemble with footprint and correct fee
tx = SorobanRpc.assembleTransaction(tx, sim);

// 4. Sign with Freighter
const signedXdr = await signTransaction(tx.toXDR(), { network: "TESTNET" });
const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);

// 5. Submit to RPC and poll
const sendResponse = await rpcServer.sendTransaction(signedTx);
// ... poll getTransaction(sendResponse.hash)
```

---

## 4. WalletKit (Universal Connection)

If you want to support Freighter, WalletConnect, Lobstr, and xBull simultaneously without writing custom logic for each, use **Stellar WalletKit**.

```bash
npm install @creit.tech/stellar-wallets-kit
```

```javascript
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID
} from '@creit.tech/stellar-wallets-kit';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

// Open modal to let user choose wallet
await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id);
    const publicKey = await kit.getPublicKey();
    console.log(publicKey);
  }
});

// Sign a transaction (handles the specifics of whatever wallet they chose)
const { signedXDR } = await kit.signTx({
  xdr: myBuiltTx.toXDR(),
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET
});
```

---

## 5. SEP-10 Auth for the Frontend

If your app has a backend and needs to securely authenticate the user, implement SEP-10.

```javascript
// 1. Fetch challenge from your backend (which gets it from the Anchor)
const challengeResponse = await fetch("/api/auth/challenge?account=" + userAddress);
const { transaction, network_passphrase } = await challengeResponse.json();

// 2. Sign challenge with Freighter
const signedXdr = await signTransaction(transaction, { network: "TESTNET" });

// 3. Send signed challenge back to backend to get JWT
const tokenResponse = await fetch("/api/auth/token", {
  method: "POST",
  body: JSON.stringify({ transaction: signedXdr }),
});
const { jwt } = await tokenResponse.json();

// 4. Use JWT for subsequent requests
localStorage.setItem("auth_token", jwt);
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/frontend — MIT License*
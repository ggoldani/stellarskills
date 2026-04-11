---
name: stellarskills-frontend
description: Connecting web apps to Stellar. Stellar Wallets Kit, Freighter API, signing Soroban transactions, and secure SEP-10 Web3 Auth.
---

# STELLARSKILLS — Frontend Integration

> Connecting web apps to Stellar. Stellar Wallets Kit, Freighter API, signing Soroban transactions, and secure SEP-10 Web3 Auth.

---

## 1. Connecting Wallets (The Modern Standard)

To build a professional dApp with high UX, you must support multiple wallets (Freighter, Albedo, xBull, Lobstr, and WalletConnect) simultaneously. **Do not write custom logic for each extension.**

Instead, use **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`), the standard "RainbowKit equivalent" for Stellar.

```bash
npm install @creit.tech/stellar-wallets-kit
```

### Initializing the Kit & Showing the Modal

```javascript
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID
} from '@creit.tech/stellar-wallets-kit';

// 1. Initialize the kit globally in your React Context or state manager
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

// 2. Open the beautiful native UI modal to let user choose their wallet
await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id);
    const { address } = await kit.getAddress();
    console.log(`Connected with ${option.name}: ${address}`);
  }
});
```

---

## 2. Signing Transactions (Wallets Kit)

Once connected, you can sign XDR transactions agnostically. The kit handles the extension pop-up whether the user is on Freighter or Albedo.

```javascript
import { TransactionBuilder, Networks, BASE_FEE, Operation, Asset, Horizon } from "@stellar/stellar-sdk";

// 1. Build the transaction — load sequence via Horizon (legacy) or Stellar RPC (`getAccount` on SorobanRpc.Server)
// Horizon: https://developers.stellar.org/docs/data/apis/horizon (legacy — prefer Stellar RPC for new integrations)
const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await horizonServer.loadAccount(userPublicKey);

const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.payment({ destination: "GBB...", asset: Asset.native(), amount: "10" }))
  .setTimeout(30)
  .build();

// 2. Sign via Wallets Kit
const { signedXDR } = await kit.signTx({
  xdr: tx.toXDR(),
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET
});

// 3. Reconstruct and submit (Horizon example below; prefer aligning new apps with Stellar RPC migration)
const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
await horizonServer.submitTransaction(signedTx);
```

---

## 3. Low-Level Integration: Freighter API

If you absolutely must build a low-level, Freighter-only integration without UI wrappers, use `@stellar/freighter-api`.

```bash
npm install @stellar/freighter-api
```

```javascript
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

// Connect
if (await isConnected()) {
  const address = await requestAccess();
}

// Sign
const signedTxXdr = await signTransaction(tx.toXDR(), { network: "TESTNET" });
```

---

## 4. Signing Transactions (Soroban / Stellar RPC)

When calling a Soroban smart contract, you cannot simply sign the operation. You must **simulate** the transaction first to fetch the correct resource footprint and fee, assemble it, and *then* request the user's signature. Use **Stellar RPC** (`SorobanRpc.Server` in JS). Docs: https://developers.stellar.org/docs/data/apis/rpc

```javascript
import { TransactionBuilder, Networks, BASE_FEE, Contract, nativeToScVal } from "@stellar/stellar-sdk";
import { SorobanRpc } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);

// 1. Build initial tx with placeholder fee; encode args with nativeToScVal (types must match your contract)
let tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(
    contract.call(
      "deposit",
      nativeToScVal(amount, { type: "i128" }),
      nativeToScVal(userAddress, { type: "address" })
    )
  )
  .setTimeout(30)
  .build();

// 2. Simulate via RPC to calculate the exact footprint and CPU fee
const sim = await rpcServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw sim.error;

// 3. Assemble transaction with the correct simulated footprint
tx = SorobanRpc.assembleTransaction(tx, sim);

// 4. Request user signature via Wallets Kit or Freighter API
const { signedXDR } = await kit.signTx({ xdr: tx.toXDR(), publicKeys: [userPublicKey] });

// 5. Submit to RPC and poll
const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
const sendResponse = await rpcServer.sendTransaction(signedTx);
```

---

## Official documentation

- Stellar docs: https://developers.stellar.org/docs  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Smart contracts overview: https://developers.stellar.org/docs/build/smart-contracts/overview  
- JS SDK releases: https://github.com/stellar/js-stellar-sdk/releases (verify current tag, e.g. **v15.0.1** (Protocol 26))  

---

## 5. SEP-10 Web3 Auth (Security Warning)

If your app has a backend and needs to securely authenticate the user via Web3, implement the **SEP-10** standard.

### ⚠️ SECURITY RULE: Never store JWTs in LocalStorage
Do not store the returned `auth_token` in `localStorage` or `sessionStorage`. This makes your frontend highly vulnerable to XSS (Cross-Site Scripting) attacks. The backend must set the JWT inside an `HttpOnly`, `Secure`, and `SameSite=Strict` (or `Lax`) cookie. Ensure all `fetch` calls to your protected API include `credentials: "include"`.

### Frontend Implementation
```javascript
// 1. Fetch SEP-10 challenge from your backend
const challengeResponse = await fetch("/api/auth/challenge?account=" + userPublicKey);
const { transaction, network_passphrase } = await challengeResponse.json();

// 2. Request user to sign the challenge transaction via wallet
const { signedXDR } = await kit.signTx({
  xdr: transaction,
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET
});

// 3. Send signed challenge back to backend
// The backend verifies the signature. It MUST NOT return the token in the JSON body.
// Instead, the backend sets the HttpOnly cookie in the response headers.
await fetch("/api/auth/token", {
  method: "POST",
  body: JSON.stringify({ transaction: signedXDR }),
  headers: { "Content-Type": "application/json" }
});

// 4. Subsequent authenticated requests
// The browser will automatically attach the HttpOnly cookie
const userProfile = await fetch("/api/me", { credentials: "include" });
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/frontend — MIT License*

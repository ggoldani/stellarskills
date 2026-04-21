---
name: stellarskills-frontend
description: Connecting web apps to Stellar via Wallets Kit, Freighter API, signing classic and Soroban transactions, and SEP-10 Web3 Auth.
---

# STELLARSKILLS — Frontend Integration

> Connecting web apps to Stellar via Wallets Kit, Freighter API, signing classic and Soroban transactions, and SEP-10 Web3 Auth.

---

## When to use

- Connecting a web app to Stellar wallets (Freighter, Albedo, xBull, Lobstr, WalletConnect)
- Signing and submitting classic or Soroban transactions from the browser
- Implementing SEP-10 challenge-response authentication
- Building wallet-agnostic dApp flows (single integration, multiple wallets)

---

## Quick reference

| Action | Method |
|--------|--------|
| Init wallet connection | `new StellarWalletsKit({ network, modules: allowAllModules() })` |
| Open wallet selector | `kit.openModal({ onWalletSelected })` |
| Get connected address | `kit.getAddress()` |
| Sign classic tx | `kit.signTx({ xdr, publicKeys, network })` |
| Sign Soroban tx | simulate → assemble → `kit.signTx()` → `rpcServer.sendTransaction()` |
| Freighter (low-level) | `isConnected()`, `requestAccess()`, `signTransaction()` from `@stellar/freighter-api` |
| SEP-10 auth | fetch challenge → sign via wallet → POST signed XDR to backend |

---

## Connecting wallets

Use **Stellar Wallets Kit** for multi-wallet support. Do not build per-extension logic.

```bash
npm install @creit.tech/stellar-wallets-kit  # verify: https://github.com/creit-tech/stellar-wallets-kit/releases
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
```

```javascript
await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id);
    const { address } = await kit.getAddress();
  }
});
```

---

## Signing classic transactions

### Build

```javascript
import { TransactionBuilder, Networks, BASE_FEE, Operation, Asset, Horizon } from "@stellar/stellar-sdk";

// Prefer RPC for new integrations; Horizon is legacy REST
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await server.loadAccount(userPublicKey);

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.payment({
    destination: "GBB...", asset: Asset.native(), amount: "10",
  }))
  .setTimeout(30)
  .build();
```

### Sign

```javascript
const { signedXDR } = await kit.signTx({
  xdr: tx.toXDR(),
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET,
});
```

### Submit

```javascript
const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
await server.submitTransaction(signedTx);
```

---

## Signing Soroban transactions

Requires simulate → assemble → sign → submit. RPC is mandatory (Horizon does not support Soroban).

### Build

```javascript
import { TransactionBuilder, Networks, BASE_FEE, Contract, nativeToScVal, SorobanRpc } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);
let tx = new TransactionBuilder(account, {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
})
  .addOperation(contract.call(
    "deposit",
    nativeToScVal(amount, { type: "i128" }),
    nativeToScVal(userAddress, { type: "address" }),
  ))
  .setTimeout(30)
  .build();
```

### Simulate

```javascript
const sim = await rpcServer.simulateTransaction(tx);
if (SorobanRpc.Api.isSimulationError(sim)) throw sim.error;
```

### Assemble and sign

```javascript
tx = SorobanRpc.assembleTransaction(tx, sim);

const { signedXDR } = await kit.signTx({
  xdr: tx.toXDR(),
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET,
});
```

### Submit

```javascript
const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
const sendResponse = await rpcServer.sendTransaction(signedTx);
```

---

## Freighter API (low-level alternative)

Freighter-only integration without Wallets Kit.

```bash
npm install @stellar/freighter-api  # verify: https://www.npmjs.com/package/@stellar/freighter-api
```

```javascript
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

const connected = await isConnected();
const address = await requestAccess();
const signedXdr = await signTransaction(tx.toXDR(), { network: "TESTNET" });
```

---

## SEP-10 Web3 Auth

Challenge-response authentication. Backend issues a challenge, frontend signs it via wallet, backend verifies and sets session.

**Security: never store JWTs in localStorage/sessionStorage.** Backend must set `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Frontend uses `credentials: "include"`.

### Fetch and sign challenge

```javascript
const challengeResp = await fetch(
  "/api/auth/challenge?account=" + userPublicKey
);
const { transaction } = await challengeResp.json();

const { signedXDR } = await kit.signTx({
  xdr: transaction,
  publicKeys: [userPublicKey],
  network: WalletNetwork.TESTNET,
});
```

### Send to backend and use session

```javascript
// Backend verifies signature, sets HttpOnly cookie (no JSON body token)
await fetch("/api/auth/token", {
  method: "POST",
  body: JSON.stringify({ transaction: signedXDR }),
  headers: { "Content-Type": "application/json" },
});

// Cookie sent automatically on subsequent requests
const profile = await fetch("/api/me", { credentials: "include" });
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| No wallet extension installed | Modal shows install prompt for available wallets |
| User rejects signing | `signTx` throws — catch and show retry UI |
| Soroban simulation fails | `isSimulationError(sim)` is `true` — inspect `sim.error` |
| Horizon returns `tx_bad_seq` | Sequence number stale — reload account before rebuilding |
| Wallet disconnected mid-session | `getAddress()` throws — re-trigger `openModal` |
| SEP-10 cookie not sent | Missing `credentials: "include"` on fetch or `SameSite` mismatch |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `signTx` throws | Wallet extension not connected or user rejected | Re-connect via `openModal`, handle rejection in UI |
| `isSimulationError` | Contract call reverted or insufficient resources | Check `sim.error` for revert reason, add fee/budget |
| `tx_bad_seq` | Stale sequence number | Reload account before each transaction build |
| CORS on `/api/auth/*` | Backend missing CORS headers | Set `Access-Control-Allow-Origin` and `credentials: true` |
| Cookie not attached | `SameSite` mismatch or missing `credentials: "include"` | Ensure `SameSite=Lax` or `Strict`, add credentials to fetch |

---

## SDK install

```bash
npm install @stellar/stellar-sdk  # verify: https://github.com/stellar/js-stellar-sdk/releases
```

---

## See also

- `/accounts/SKILL.md` — keypairs, account creation, multisig, minimum balance
- [Stellar RPC docs](https://developers.stellar.org/docs/data/apis/rpc)
- [Smart contracts overview](https://developers.stellar.org/docs/build/smart-contracts/overview)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/frontend — MIT License*

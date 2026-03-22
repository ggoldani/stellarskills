---
name: stellarskills-operations
description: Reference for all Stellar transaction operations. Payments, account management, offers, trustlines.
---

# STELLARSKILLS — Operations

> Reference for all Stellar transaction operations. Payments, account management, offers, trustlines.

---

## Transaction & Operation Structure

A Stellar transaction is a wrapper around 1 to 100 **Operations**.
- The transaction defines the `sourceAccount`, `fee`, `sequenceNumber`, and `timeBounds`.
- Operations define the actual state changes (e.g., send money, create trustline).
- By default, operations execute under the transaction's `sourceAccount`. You can override this by providing a `source` to the operation itself.

```javascript
import { TransactionBuilder, Operation, Asset } from "@stellar/stellar-sdk";

const tx = new TransactionBuilder(account, { fee: BASE_FEE })
  .addOperation(Operation.payment({ ... }))
  .addOperation(Operation.changeTrust({ ... })) // Both execute atomically
  .build();
```

### Circle USDC issuers (verify on [Circle’s list](https://developers.circle.com/stablecoins/usdc-contract-addresses))

```javascript
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_ISSUER = USDC_ISSUER_MAINNET; // use TESTNET constant on testnet
```

---

## Core Operations

### Create Account
Funds a new account. The destination account must not exist yet.
```javascript
Operation.createAccount({
  destination: "G...",
  startingBalance: "2.5", // in XLM
})
```

### Payment
Sends an asset from the source to the destination. Destination must exist and have a trustline.
```javascript
Operation.payment({
  destination: "G...",
  asset: new Asset("USDC", USDC_ISSUER), // or Asset.native()
  amount: "100.50",
})
```

### Path Payment Strict Send
Sends exactly X of an asset, recipient gets at least Y of a different asset. Uses DEX for conversion.
```javascript
Operation.pathPaymentStrictSend({
  sendAsset: Asset.native(),
  sendAmount: "10",
  destination: "G...",
  destAsset: new Asset("USDC", USDC_ISSUER),
  destMin: "1.5", // Fails if < 1.5 USDC is received
  path: [],       // Array of intermediate Assets (optional)
})
```

### Path Payment Strict Receive
Recipient gets exactly X of an asset, sender pays at most Y of a different asset.
```javascript
Operation.pathPaymentStrictReceive({
  sendAsset: Asset.native(),
  sendMax: "11",  // Fails if > 11 XLM is spent
  destination: "G...",
  destAsset: new Asset("USDC", USDC_ISSUER),
  destAmount: "1.5",
  path: [],
})
```

---

## Asset & Trustline Operations

### Change Trust
Creates, updates, or deletes a trustline.
```javascript
Operation.changeTrust({
  asset: new Asset("USDC", USDC_ISSUER),
  limit: "1000000", // Optional. Set to "0" to delete (if balance is 0)
})
```

### Set trustline flags (replaces deprecated Allow Trust)
Issuers use **`setTrustLineFlags`** (modern path). The legacy **`allowTrust`** operation still exists in the protocol for backward compatibility but new code should follow current SDK / [list of operations](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations).
```javascript
Operation.setTrustLineFlags({
  trustor: "G_USER...",
  asset: new Asset("USDC", USDC_ISSUER),
  flags: { authorized: true }, // or { authorizedToMaintainLiabilities: true }
})
```

### Clawback
Used by issuers (with `AUTH_CLAWBACK_ENABLED`) to seize tokens from an account.
```javascript
Operation.clawback({
  from: "G_USER...",
  asset: new Asset("USDC", USDC_ISSUER),
  amount: "50",
})
```

---

## Account Management Operations

### Set Options
Updates account configuration (signers, thresholds, domain, flags).
```javascript
Operation.setOptions({
  masterWeight: 1,
  lowThreshold: 1,
  medThreshold: 2,
  highThreshold: 2,
  signer: { ed25519PublicKey: "G_SIGNER...", weight: 1 },
  homeDomain: "example.com",
  setFlags: 1,   // AUTH_REQUIRED
  clearFlags: 2, // remove AUTH_REVOCABLE
})
```

### Account Merge
Deletes the account and sends its remaining XLM to a destination. Only works if the account has no subentries (no trustlines, offers, data).
```javascript
Operation.accountMerge({
  destination: "G...",
})
```

### Manage Data
Sets, updates, or deletes a key-value pair on the account. Values are base64 strings. Max 64 bytes per value.
```javascript
Operation.manageData({
  name: "kyc_status",
  value: "verified", // Buffer or string. Null to delete.
})
```

---

## DEX & Liquidity Operations

### Manage Sell Offer
Creates or updates an order to sell asset A for asset B.
```javascript
Operation.manageSellOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER),
  amount: "100", // Amount to sell
  price: "0.15", // Price of 1 unit of selling in terms of buying
  offerId: "0",  // 0 creates new. >0 updates existing.
})
```

### Manage Buy Offer
Creates or updates an order to buy asset A by selling asset B.
```javascript
Operation.manageBuyOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER),
  buyAmount: "15", // Amount to buy
  price: "0.15",
  offerId: "0",
})
```

### Create Passive Sell Offer
Creates an offer that won't execute against a worse price, used by market makers.
```javascript
Operation.createPassiveSellOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER),
  amount: "100",
  price: "0.15",
})
```

### Liquidity Pool Deposit
Deposits assets into an AMM.
```javascript
Operation.liquidityPoolDeposit({
  liquidityPoolId: poolIdHex,
  maxAmountA: "10",
  maxAmountB: "100",
  minPrice: "0.09",
  maxPrice: "0.11",
})
```

### Liquidity Pool Withdraw
Withdraws assets from an AMM by burning pool shares.
```javascript
Operation.liquidityPoolWithdraw({
  liquidityPoolId: poolIdHex,
  amount: "50", // Amount of pool shares to burn
  minAmountA: "4",
  minAmountB: "40",
})
```

---

## Sponsorship Operations

Allows an account to pay the XLM minimum balance reserve for another account's data.

```javascript
// 1. Sponsor begins
Operation.beginSponsoringFutureReserves({
  sponsoredId: "G_USER...", // The account being sponsored
})
// 2. The sponsored action (e.g. create account, change trust)
Operation.changeTrust({
  asset: new Asset("USDC", USDC_ISSUER),
  source: "G_USER...", // Executes under user's account
})
// 3. User ends sponsorship
Operation.endSponsoringFutureReserves({
  source: "G_USER...",
})
```

---

## Soroban-related operations (classic transaction envelope)

Protocol reference: [List of operations](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations) — **Invoke Host Function**, **Extend Footprint TTL**, **Restore Footprint**.

### Invoke host function (typical dapp path)

Prefer the high-level **contract** helper in `@stellar/stellar-sdk` (builds `InvokeHostFunction` with correct XDR):

```javascript
import { Contract, nativeToScVal } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);
const op = contract.call("my_fn", nativeToScVal(arg, { type: "..." }));
// Add to TransactionBuilder, then simulate on Stellar RPC before submit — see /rpc/SKILL.md
```

Low-level `Operation.invokeHostFunction({ func, auth })` requires hand-built `xdr.HostFunction` and Soroban auth entries — use only when you are not using `Contract.call`. JS SDK reference: https://stellar.github.io/js-stellar-sdk/Operation.html

### Extend footprint TTL

Extends TTL for entries referenced in the transaction’s **read-only footprint** (see protocol doc: [Extend Footprint TTL](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations#extend-footprint-ttl)).

```javascript
import { Operation } from "@stellar/stellar-sdk";

Operation.extendFootprintTtl({
  extendTo: 1_000_000, // target ledger sequence (protocol field "extendTo") — must match your SDK version’s opts shape
});
```

Confirm exact option names in your SDK: https://stellar.github.io/js-stellar-sdk/Operation.html#.extendFootprintTtl

### Restore footprint

Restores **archived** entries in the **read-write** footprint — [Restore Footprint](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations#restore-footprint).

```javascript
import { Operation } from "@stellar/stellar-sdk";

Operation.restoreFootprint({});
```

---

## Official documentation

- List of operations: https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/operations — MIT License*

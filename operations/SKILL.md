---
name: stellarskills-operations
description: All Stellar transaction operations. Payments, account management, DEX, trustlines, sponsorship, Soroban.
---

# STELLARSKILLS — Operations

> All Stellar transaction operations. Payments, account management, DEX, trustlines, sponsorship, Soroban.

---

## When to use

- Building any Stellar transaction — this is the operation reference
- Sending payments (XLM or assets), converting via path payments
- Managing accounts (options, merge, data), trustlines, or DEX offers
- Setting up sponsorship or invoking Soroban contracts from classic tx
- Quick lookup of operation params and edge-case behavior

---

## Quick reference

| Operation | Key params | When to use |
|-----------|-----------|-------------|
| `createAccount` | `destination`, `startingBalance` | Fund new account (min 1 XLM) |
| `payment` | `destination`, `asset`, `amount` | Send asset to existing account |
| `pathPaymentStrictSend` | `sendAsset`, `sendAmount`, `destAsset`, `destMin`, `path` | Send exact X, get ≥Y (DEX swap) |
| `pathPaymentStrictReceive` | `sendAsset`, `sendMax`, `destAsset`, `destAmount`, `path` | Get exact Y, pay ≤X (DEX swap) |
| `changeTrust` | `asset`, `limit` | Create/update/delete trustline |
| `setTrustLineFlags` | `trustor`, `asset`, `flags` | Authorize/freeze trustlines (issuer) |
| `clawback` | `from`, `asset`, `amount` | Seize tokens (requires clawback flag) |
| `setOptions` | `signer`, `thresholds`, `homeDomain`, `setFlags` | Update account config |
| `accountMerge` | `destination` | Delete account, send XLM to dest |
| `manageData` | `name`, `value` | Set/delete account data entry |
| `manageSellOffer` | `selling`, `buying`, `amount`, `price` | Sell A for B on DEX |
| `manageBuyOffer` | `selling`, `buying`, `buyAmount`, `price` | Buy A with B on DEX |
| `createPassiveSellOffer` | `selling`, `buying`, `amount`, `price` | Non-crossing sell offer |
| `liquidityPoolDeposit` | `poolId`, `maxAmountA`, `maxAmountB` | Deposit into AMM pool |
| `liquidityPoolWithdraw` | `poolId`, `amount` | Withdraw from AMM pool |
| `beginSponsoringFutureReserves` | `sponsoredId` | Start sponsorship sequence |
| `invokeHostFunction` | `func`, `auth` | Call Soroban contract (classic envelope) |
| `extendFootprintTtl` | `extendTo` | Extend TTL for read-only entries |
| `restoreFootprint` | `{}` | Restore archived read-write entries |

---

## Transaction structure

1–100 operations per transaction. Each tx has `sourceAccount`, `fee`, `sequenceNumber`, `timeBounds`.

```javascript
import { TransactionBuilder, Operation, Asset, BASE_FEE, Networks } from "@stellar/stellar-sdk";

const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.payment({ ... }))
  .addOperation(Operation.changeTrust({ ... }))
  .setTimeout(30)
  .build();
```

Operations execute under the tx source account by default. Override per-op with `source`:

```javascript
Operation.changeTrust({ asset: usdc, source: "G_USER..." })
```

### USDC issuers

```javascript
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
```

---

## Core operations

### Create Account

Funds a new account. Destination must not exist. Min starting balance: 1 XLM.

```javascript
Operation.createAccount({
  destination: "G...",
  startingBalance: "2.5",
})
```

### Payment

Sends asset to existing account. Destination must have a trustline for non-XLM assets.

```javascript
Operation.payment({
  destination: "G...",
  asset: new Asset("USDC", USDC_ISSUER_MAINNET),
  amount: "100.50",
})
```

### Path Payment Strict Send

Send exactly X of one asset, receive at least Y of another. DEX handles conversion.

```javascript
Operation.pathPaymentStrictSend({
  sendAsset: Asset.native(),
  sendAmount: "10",
  destination: "G...",
  destAsset: new Asset("USDC", USDC_ISSUER_MAINNET),
  destMin: "1.5",
  path: [],
})
```

### Path Payment Strict Receive

Receive exactly Y of one asset, spend at most X of another.

```javascript
Operation.pathPaymentStrictReceive({
  sendAsset: Asset.native(),
  sendMax: "11",
  destination: "G...",
  destAsset: new Asset("USDC", USDC_ISSUER_MAINNET),
  destAmount: "1.5",
  path: [],
})
```

---

## Asset & trustline operations

### Change Trust

Create, update, or delete a trustline. Set `limit` to `"0"` to delete (balance must be 0).

```javascript
Operation.changeTrust({
  asset: new Asset("USDC", USDC_ISSUER_MAINNET),
  limit: "1000000",
})
```

### Set Trustline Flags

Issuer operation — authorize, freeze, or configure trustlines. Modern replacement for the legacy `allowTrust` (still in protocol for backward compat).

```javascript
Operation.setTrustLineFlags({
  trustor: "G_USER...",
  asset: new Asset("USDC", USDC_ISSUER_MAINNET),
  flags: { authorized: true },
})
```

Available flags: `authorized`, `authorizedToMaintainLiabilities`, `clawbackEnabled`. Combine as needed.

### Clawback

Issuer seizes tokens from a holder. Requires `AUTH_CLAWBACK_ENABLED` on the issuing account.

```javascript
Operation.clawback({
  from: "G_USER...",
  asset: new Asset("USDC", USDC_ISSUER_MAINNET),
  amount: "50",
})
```

---

## Account management

### Set Options

Update signers, thresholds, domain, and issuer flags.

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

Deletes the account and transfers remaining XLM to destination. Account must have zero subentries.

```javascript
Operation.accountMerge({ destination: "G..." })
```

### Manage Data

Set, update, or delete a key-value pair. Values are base64 strings, max 64 bytes. Costs +0.5 XLM reserve.

```javascript
Operation.manageData({
  name: "kyc_status",
  value: "verified", // null to delete
})
```

---

## DEX & liquidity

### Manage Sell Offer

Create or update a sell order. `offerId: "0"` = new, `>0` = update existing.

```javascript
Operation.manageSellOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER_MAINNET),
  amount: "100",
  price: "0.15",
  offerId: "0",
})
```

### Manage Buy Offer

Create or update a buy order.

```javascript
Operation.manageBuyOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER_MAINNET),
  buyAmount: "15",
  price: "0.15",
  offerId: "0",
})
```

### Create Passive Sell Offer

Won't execute against a price worse than `price`. Used by market makers.

```javascript
Operation.createPassiveSellOffer({
  selling: Asset.native(),
  buying: new Asset("USDC", USDC_ISSUER_MAINNET),
  amount: "100",
  price: "0.15",
})
```

### Liquidity Pool Deposit

Deposit into an AMM pool. Requires the pool to already exist.

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

Burn pool shares to withdraw assets.

```javascript
Operation.liquidityPoolWithdraw({
  liquidityPoolId: poolIdHex,
  amount: "50",
  minAmountA: "4",
  minAmountB: "40",
})
```

---

## Sponsorship

Sponsor pays XLM reserves for another account's subentries. Both must sign.

```javascript
const tx = new TransactionBuilder(sponsorAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.beginSponsoringFutureReserves({ sponsoredId: "G_USER..." }))
  .addOperation(Operation.changeTrust({ asset: usdc, source: "G_USER..." }))
  .addOperation(Operation.endSponsoringFutureReserves({ source: "G_USER..." }))
  .setTimeout(30)
  .build();
tx.sign(sponsorKeypair);
tx.sign(userKeypair);
```

---

## Soroban operations (classic envelope)

### Invoke Host Function

Prefer `Contract.call()` for most cases:

```javascript
import { Contract, nativeToScVal } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);
const op = contract.call("my_fn", nativeToScVal(arg, { type: "..." }));
// simulate on Stellar RPC before submit
```

Low-level `Operation.invokeHostFunction({ func, auth })` requires hand-built XDR — use only when `Contract.call` doesn't fit. SDK reference: https://stellar.github.io/js-stellar-sdk/Operation.html

### Extend Footprint TTL

Extends TTL for entries in the read-only footprint. `extendTo` is a target ledger sequence.

```javascript
Operation.extendFootprintTtl({ extendTo: 1_000_000 });
```

### Restore Footprint

Restores archived entries in the read-write footprint before they can be read/written.

```javascript
Operation.restoreFootprint({});
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Payment to unfunded account | `op_no_destination` — must `createAccount` first |
| `changeTrust` with `limit: "0"` | Deletes trustline only if balance is zero |
| Path payment with empty `path` | Uses direct DEX pair if it exists, else fails |
| `accountMerge` with subentries | Fails — must remove all trustlines, offers, data first |
| `manageSellOffer` with `amount: "0"` | Deletes the offer matching that `offerId` |
| Sponsorship without sponsored account signing | Fails — both sponsor and sponsored must sign |
| Clawback without `AUTH_CLAWBACK_ENABLED` | Fails — issuer must set the flag via `setOptions` |
| `invokeHostFunction` without simulation | Fails at submission — always simulate on RPC first |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_destination` | Recipient doesn't exist | Use `createAccount` or fund first |
| `op_low_reserve` | Below minimum balance | Fund more XLM or remove subentries |
| `tx_bad_seq` | Wrong/reused sequence number | Re-fetch account before building tx |
| `op_underfunded` | Insufficient balance | Check balance minus reserve + fees |
| `op_no_trust` | Missing trustline | Add `changeTrust` before payment |
| `op_line_full` | Trustline limit reached | Raise limit with `changeTrust` |
| `op_cross_self` | Offer would trade with own offers | Cancel existing offer first |
| `op_not_clawback_enabled` | Issuer lacks clawback flag | Set `AUTH_CLAWBACK_ENABLED` via `setOptions` |

---

## See also

- `/accounts/SKILL.md` — account creation, multisig, sponsorship deep-dive
- `/assets/SKILL.md` — asset issuance, trustlines, issuer configuration
- [List of operations](https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations) — official protocol reference

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/operations — MIT License*

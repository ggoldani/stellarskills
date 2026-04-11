---
name: stellarskills-assets
description: Custom asset issuance, trustlines, asset types, Stellar Asset Contract (SAC), USDC and stablecoins.
---

# STELLARSKILLS — Assets

> Custom asset issuance, trustlines, asset types, Stellar Asset Contract (SAC), USDC and stablecoins.

---

## When to use

- Issuing a custom token or creating an asset issuer
- Setting up trustlines to receive non-XLM assets
- Working with USDC, EURC, or other stablecoins on Stellar
- Using a classic asset inside a Soroban contract (SAC)
- Building path payments (cross-asset swaps via DEX)

---

## Quick reference

| Operation | Key detail |
|-----------|------------|
| Create asset | `new Asset("CODE", issuerPublicKey)` — code 4 or 12 chars |
| Native XLM | `Asset.native()` |
| Trustline | `Operation.changeTrust({asset, limit})` — costs 0.5 XLM reserve |
| Remove trustline | `changeTrust({asset, limit: "0"})` — balance must be zero |
| Check trustline | `account.balances.find(b => b.asset_code === "CODE")` |
| Mint tokens | Issuer sends asset to a trustline holder |
| Burn tokens | Send asset back to the issuer |
| Lock issuer | `setOptions({masterWeight: 0})` — permanent, no more minting |
| SAC contract ID | `asset.contractId(Networks.MAINNET)` → `C...` |
| SAC transfer (Rust) | `token::Client::new(&env, &id).transfer(&from, &to, &amt)` |
| Path payment | `pathPaymentStrictReceive` / `pathPaymentStrictSend` — auto DEX routing |
| Freeze trustline | `setTrustLineFlags({trustor, asset, flags: {authorized: false}})` |
| Clawback | `Operation.clawback({asset, from, amount})` |
| Issuer flags | `setOptions({setFlags})` — AUTH_REQUIRED, AUTH_REVOCABLE, AUTH_CLAWBACK_ENABLED |
| stellar.toml | `https://domain.com/.well-known/stellar.toml` — asset discovery |

---

## Asset types

| Type | Description | Example |
|------|-------------|---------|
| `native` | XLM | `Asset.native()` |
| `credit_alphanum4` | Code up to 4 chars | `USD`, `BTC`, `BRL` |
| `credit_alphanum12` | Code up to 12 chars | `USDC`, `yXLM`, `EURC` |

Non-native assets = **code + issuer**. Same code, different issuer = different asset. Always verify issuer address.

```javascript
import { Asset } from "@stellar/stellar-sdk";

const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
// verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const XLM = Asset.native();
const USDC_MAINNET = new Asset("USDC", USDC_ISSUER_MAINNET);
```

---

## Stablecoins (verify before production)

| Asset | Network | Issuer |
|-------|---------|--------|
| USDC | Mainnet | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| USDC | Testnet | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |
| EURC | Mainnet | `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP` |
| USDT | Mainnet | `GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V` |

Source: https://developers.circle.com/stablecoins/usdc-contract-addresses

---

## Trustlines

Account must have a trustline before receiving any non-native asset. Costs 0.5 XLM reserve.

```javascript
import { TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Keypair, Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");
const kp = Keypair.fromSecret(process.env.SECRET);
const account = await server.loadAccount(kp.publicKey());

const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.changeTrust({
    asset: new Asset("USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
    limit: "1000000",
  }))
  .setTimeout(30)
  .build();
tx.sign(kp);
await server.submitTransaction(tx);
```

Remove trustline: `changeTrust` with `limit: "0"` — balance must be zero.

```javascript
const hasTrustline = account.balances.some(
  b => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER_MAINNET
);
```

---

## Issuing a custom asset

Distributor pattern: issuer mints, distributor distributes. Never use issuer directly for payments.

```javascript
// Distributor creates trustline to issuer's asset
const tx = new TransactionBuilder(distAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.changeTrust({
    asset: new Asset("MYTOKEN", issuerKeypair.publicKey()),
    limit: "1000000000",
  }))
  .setTimeout(30)
  .build();
tx.sign(distKeypair);
await server.submitTransaction(tx);
```

```javascript
// Issuer mints by sending to distributor
const tx = new TransactionBuilder(issuerAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.payment({
    destination: distKeypair.publicKey(),
    asset: new Asset("MYTOKEN", issuerKeypair.publicKey()),
    amount: "1000000",
  }))
  .setTimeout(30)
  .build();
tx.sign(issuerKeypair);
await server.submitTransaction(tx);
```

Lock issuer (fixed supply): `Operation.setOptions({ masterWeight: 0 })`.

---

## Asset flags

Set on **issuer account** via `setOptions`. For detailed flag config see `accounts/SKILL.md`.

| Flag | Effect |
|------|--------|
| `AUTH_REQUIRED` | Holders need issuer authorization |
| `AUTH_REVOCABLE` | Issuer can freeze trustlines |
| `AUTH_IMMUTABLE` | Flags permanently locked |
| `AUTH_CLAWBACK_ENABLED` | Issuer can claw back tokens |

```javascript
Operation.setOptions({ setFlags: 0b0111 });
// AUTH_REQUIRED | AUTH_REVOCABLE | AUTH_CLAWBACK_ENABLED
```

Authorize: `Operation.setTrustLineFlags({trustor, asset, flags: {authorized: true}})`
Freeze: `Operation.setTrustLineFlags({trustor, asset, flags: {authorized: false}})`
Clawback: `Operation.clawback({asset, from, amount})`

---

## Stellar Asset Contract (SAC)

Every classic asset has an automatic Soroban contract (ERC-20-like). Use `contractId()` to get the address.

```javascript
import { Asset, Networks } from "@stellar/stellar-sdk";

const usdcSAC = new Asset("USDC", USDC_ISSUER_MAINNET).contractId(Networks.MAINNET);
console.log(usdcSAC);  // C...
```

```rust
use soroban_sdk::{token, Address, Env};

let usdc_client = token::Client::new(&env, &usdc_contract_id);
usdc_client.transfer(&from, &to, &amount);
let balance = usdc_client.balance(&address);
```

SAC supports: `transfer`, `transfer_from`, `approve`, `allowance`, `balance`, `mint` (issuer), `burn`.

---

## Path payments

Stellar DEX converts assets in one transaction. Send USDC → receive BRL.

```javascript
// Exact destination amount (variable source)
Operation.pathPaymentStrictReceive({
  sendAsset: USDC, sendMax: "110",
  destination: recipientPubKey,
  destAsset: BRL, destAmount: "100",
  path: [],
});

// Exact source amount (variable destination)
Operation.pathPaymentStrictSend({
  sendAsset: USDC, sendAmount: "100",
  destination: recipientPubKey,
  destAsset: BRL, destMin: "90",
  path: [],
});
```

---

## stellar.toml

Issuers publish at `https://domain.com/.well-known/stellar.toml` for wallet/explorer discovery.

```toml
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
ACCOUNTS=["GISSUER..."]

[[CURRENCIES]]
code="MYTOKEN"
issuer="GISSUER..."
display_decimals=2
name="My Token"
```

Set home domain on issuer: `Operation.setOptions({ homeDomain: "yourdomain.com" })`

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Receive non-native asset without trustline | `op_no_trust` — tx rejected |
| Remove trustline with non-zero balance | Fails — must transfer/sell balance first |
| Send asset to self | `op_self_not_allowed` — use different destination |
| Issuer master weight set to 0 | Permanent — no more minting, no flag changes |
| Same asset code, different issuer | Different assets — verify issuer address always |
| Fiat-backed anchor sunsets asset | Tokens may become unrecoverable — verify issuer active |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_trust` | Recipient has no trustline | `changeTrust` first |
| `op_not_authorized` | Issuer has AUTH_REQUIRED, holder not authorized | Issuer calls `setTrustLineFlags` |
| `op_line_full` | Would exceed trustline limit | Increase limit via `changeTrust` |
| `op_low_reserve` | Not enough XLM for trustline reserve | Fund +0.5 XLM per trustline |
| `op_self_not_allowed` | Sending asset to self | Use different destination |
| `tx_bad_seq` | Wrong or reused sequence | Re-fetch account before building tx |

---

## See also

- `/accounts/SKILL.md` — issuer flags, multisig, minimum balance, account creation
- `/security/SKILL.md` — `require_auth()` for contract accounts (C...)
- [Stellar Asset Contract](https://developers.stellar.org/docs/tokens/stellar-asset-contract)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/assets — MIT License*

---
name: stellarskills-assets
description: Custom asset issuance, trustlines, asset types, Stellar Asset Contract (SAC), USDC and stablecoins.
---

# STELLARSKILLS — Assets

> Custom asset issuance, trustlines, asset types, Stellar Asset Contract (SAC), USDC and stablecoins.

---

## Asset Types

Stellar has three asset types:

| Type | Description | Example |
|------|-------------|---------|
| `native` | XLM, the protocol's native asset | `Asset.native()` |
| `credit_alphanum4` | Asset code up to 4 characters | `USD`, `BTC`, `BRL` |
| `credit_alphanum12` | Asset code up to 12 characters | `USDC`, `yXLM`, `EURC` |

All non-native assets are identified by **code + issuer**:
```javascript
import { Asset } from "@stellar/stellar-sdk";

// Circle USDC — verify anytime: https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const XLM = Asset.native();
const USDC_MAINNET = new Asset("USDC", USDC_ISSUER_MAINNET);
const USDC_TESTNET = new Asset("USDC", USDC_ISSUER_TESTNET);
// Example BRL on mainnet (historical issuer — verify issuer + anchor are still active before use)
const BRL  = new Asset("BRL",  "GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP");
```

**Two assets with the same code but different issuers are DIFFERENT assets.** Always verify the issuer address. Do not trust an asset code alone. **Fiat-backed / anchor assets:** corridors and issuers **change or sunset** — confirm `stellar.toml`, the anchor’s docs, and an explorer **at integration time**; never treat table rows as permanent.

---

## Canonical stablecoins (verify before production)

**USDC (Circle)** — official list: https://developers.circle.com/stablecoins/usdc-contract-addresses

| Network | Asset | Issuer |
|---------|-------|--------|
| **Public mainnet** | USDC | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| **Testnet** | USDC | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

**Other mainnet examples** (confirm with issuer / explorer):

| Asset | Issuer (mainnet) |
|-------|------------------|
| EURC (Circle) | `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP` |
| USDT (Tether) | `GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V` |

**Official Stellar docs:** https://developers.stellar.org/docs — tokens / assets sections for SAC and anatomy of an asset.

---

## Trustlines

> Examples below use **Horizon** (`Horizon.Server`) for sequence load and submit. Horizon is [legacy](https://developers.stellar.org/docs/data/apis/horizon) — prefer [Stellar RPC](https://developers.stellar.org/docs/data/apis/rpc) + [migration guide](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc) for new work.

**Before an account can receive any non-native asset, it must have a trustline to that asset.**

A trustline is a subentry (costs 0.5 XLM in minimum balance reserve) that says "this account trusts and can hold this asset."

### Create a trustline (changeTrust)
```javascript
import { TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Keypair } from "@stellar/stellar-sdk";
import { Horizon } from "@stellar/stellar-sdk";

const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

const server = new Horizon.Server("https://horizon.stellar.org");
const keypair = Keypair.fromSecret(process.env.SECRET);
const account = await server.loadAccount(keypair.publicKey());

const USDC = new Asset("USDC", USDC_ISSUER_MAINNET);

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.MAINNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: USDC,
      limit: "1000000",  // maximum this account can hold; "0" to remove trustline
    })
  )
  .setTimeout(30)
  .build();

tx.sign(keypair);
await server.submitTransaction(tx);
```

### Remove a trustline
Set `limit: "0"` — but only when balance is zero.

### Check if trustline exists
```javascript
const account = await server.loadAccount(publicKey);
const issuer = USDC_ISSUER_MAINNET; // or USDC_ISSUER_TESTNET on testnet
const hasTrustline = account.balances.some(
  b => b.asset_code === "USDC" && b.asset_issuer === issuer
);
```

---

## Issuing a Custom Asset

### Step 1: Create an issuer keypair
The issuing account is the source of truth for the asset. Its public key becomes part of the asset identity. **Never lose the issuing keypair.**

```javascript
const issuerKeypair = Keypair.random();
const distributorKeypair = Keypair.random();
// Best practice: use a separate distributor account, not the issuer directly
```

### Step 2: Fund both accounts
Both must exist on-chain (minimum balance funded).

### Step 3: Distributor establishes trustline to issuer
```javascript
// Distributor creates trustline
const tx = new TransactionBuilder(distributorAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.changeTrust({
    asset: new Asset("MYTOKEN", issuerKeypair.publicKey()),
    limit: "1000000000",
  }))
  .setTimeout(30)
  .build();
tx.sign(distributorKeypair);
await server.submitTransaction(tx);
```

### Step 4: Issuer sends tokens to distributor (minting)
```javascript
const tx = new TransactionBuilder(issuerAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.payment({
    destination: distributorKeypair.publicKey(),
    asset: new Asset("MYTOKEN", issuerKeypair.publicKey()),
    amount: "1000000",
  }))
  .setTimeout(30)
  .build();
tx.sign(issuerKeypair);
await server.submitTransaction(tx);
```

**Any payment FROM the issuer to an account with a trustline mints tokens. Any payment TO the issuer burns tokens.**

### Step 5: Lock the issuer (optional, for fixed supply)
```javascript
// Set master weight to 0 — issuer can never sign again
Operation.setOptions({ masterWeight: 0 });
```

---

## Asset Flags (Issuer Controls)

Set these on the **issuer account** via `setOptions`:

```javascript
Operation.setOptions({
  setFlags: 0b0111,  // AUTH_REQUIRED | AUTH_REVOCABLE | AUTH_CLAWBACK_ENABLED
});
```

| Flag Name | Bit | Effect |
|-----------|-----|--------|
| `AUTH_REQUIRED` | 0x1 | Holders need explicit authorization from issuer |
| `AUTH_REVOCABLE` | 0x2 | Issuer can freeze individual trustlines |
| `AUTH_IMMUTABLE` | 0x4 | No more flag changes (permanent) |
| `AUTH_CLAWBACK_ENABLED` | 0x8 | Issuer can claw back tokens from any account |

### Authorize a trustline (when AUTH_REQUIRED is set)
```javascript
Operation.setTrustLineFlags({
  trustor: userPublicKey,
  asset: myAsset,
  flags: { authorized: true },
});
```

### Freeze a trustline
```javascript
Operation.setTrustLineFlags({
  trustor: userPublicKey,
  asset: myAsset,
  flags: { authorized: false },  // freezes — user can't send or receive
});
```

### Clawback
```javascript
Operation.clawback({
  asset: myAsset,
  from: userPublicKey,
  amount: "100",
});
```

---

## Stellar Asset Contract (SAC)

Every Stellar asset automatically has a **Soroban-compatible contract** called the Stellar Asset Contract (SAC). This allows classic assets (XLM, USDC, custom tokens) to be used inside Soroban smart contracts as if they were ERC-20 tokens.

### Get SAC contract ID for an asset
```javascript
import { Contract, Networks } from "@stellar/stellar-sdk";

const usdcSAC = new Asset("USDC", USDC_ISSUER_MAINNET).contractId(Networks.MAINNET);
// Testnet: new Asset("USDC", USDC_ISSUER_TESTNET).contractId(Networks.TESTNET)

console.log(usdcSAC);  // C... contract address
```

### Using SAC in Soroban contracts (Rust)
```rust
use soroban_sdk::{token, Address, Env};

// Transfer USDC using SAC
let usdc_client = token::Client::new(&env, &usdc_contract_id);
usdc_client.transfer(&from_address, &to_address, &amount);

// Check balance
let balance = usdc_client.balance(&address);
```

SAC supports: `transfer`, `transfer_from`, `approve`, `allowance`, `balance`, `mint` (issuer only), `burn`.

---

## stellar.toml — Asset Discovery

Issuers publish a `stellar.toml` file at `https://yourdomain.com/.well-known/stellar.toml` that describes their assets. Wallets and explorers use this for display names, logos, and metadata.

Minimal example:
```toml
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
ACCOUNTS=["GISSUER..."]

[[CURRENCIES]]
code="MYTOKEN"
issuer="GISSUER..."
display_decimals=2
name="My Token"
desc="A description of the token"
image="https://yourdomain.com/logo.png"
is_asset_anchored=false
```

**Home domain** must be set on the issuer account:
```javascript
Operation.setOptions({
  homeDomain: "yourdomain.com",
});
```

---

## Path Payments (Cross-Asset)

Stellar can automatically convert assets in a single transaction using the DEX. Send USDC, recipient receives BRL — Stellar finds the path.

```javascript
// Send exactly X of destination asset (variable source amount)
Operation.pathPaymentStrictReceive({
  sendAsset: USDC,
  sendMax: "110",       // max USDC to spend
  destination: recipientPublicKey,
  destAsset: BRL,
  destAmount: "100",    // exact BRL recipient gets
  path: [],             // [] lets Stellar find the path automatically
});

// Send exactly X of source asset (variable destination amount)
Operation.pathPaymentStrictSend({
  sendAsset: USDC,
  sendAmount: "100",    // exact USDC to spend
  destination: recipientPublicKey,
  destAsset: BRL,
  destMin: "90",        // minimum BRL to receive (slippage protection)
  path: [],
});
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_trust` | Destination has no trustline | Establish trustline first |
| `op_not_authorized` | Asset is AUTH_REQUIRED and not authorized | Issuer must authorize trustline |
| `op_line_full` | Would exceed trustline limit | Increase limit via changeTrust |
| `op_low_reserve` | Not enough XLM for trustline reserve | Add 0.5 XLM per trustline |
| `op_self_not_allowed` | Sending to self | Use a different destination |

---

## Official documentation

- Stellar docs: https://developers.stellar.org/docs  
- Assets (data structures): https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets  
- Stellar Asset Contract: https://developers.stellar.org/docs/tokens/stellar-asset-contract  
- Circle USDC addresses (mainnet + testnet issuers): https://developers.circle.com/stablecoins/usdc-contract-addresses  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/assets — MIT License*

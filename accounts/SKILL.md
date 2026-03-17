# STELLARSKILLS — Accounts

> Keypairs, account creation, signers, multisig, minimum balance, sponsorship, muxed accounts.

---

## Keypairs

A Stellar account is identified by a **public key** (G...) and controlled by a **secret key** (S...). Both are base32-encoded 32-byte Ed25519 keys.

```javascript
import { Keypair } from "@stellar/stellar-sdk";

// Generate new keypair
const keypair = Keypair.random();
console.log(keypair.publicKey());  // G...
console.log(keypair.secret());     // S...

// From existing secret
const kp = Keypair.fromSecret("SCZANGBA5RLCQ6LXXPJ7FJZLOL3ZRIQGXKVBIMKTSLK5DGNECJHPQMQ");
```

**NEVER log or transmit secret keys.** Store them in environment variables or a secrets manager.

---

## Account Creation

Accounts do NOT exist until explicitly created and funded on-chain. Generating a keypair does not create an account.

### Fund with createAccount operation
```javascript
import { TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const sourceKeypair = Keypair.fromSecret(process.env.SOURCE_SECRET);
const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

const newKeypair = Keypair.random();

const tx = new TransactionBuilder(sourceAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.createAccount({
      destination: newKeypair.publicKey(),
      startingBalance: "1",  // minimum ~1 XLM; more if adding trustlines
    })
  )
  .setTimeout(30)
  .build();

tx.sign(sourceKeypair);
await server.submitTransaction(tx);
```

### Testnet: fund via Friendbot
```javascript
// Only works on testnet
await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
```

---

## Minimum Balance

Every account must maintain a minimum XLM balance. **If a transaction would drop balance below minimum, it fails.**

Formula:
```
minimumBalance = (2 + numSubentries) × baseReserve + liabilities
```

- `baseReserve` = **0.5 XLM** (current value)
- `numSubentries` = number of trustlines + offers + signers + data entries + sponsored entries
- Base minimum = **1 XLM** (2 × 0.5)
- Each trustline adds **0.5 XLM** to minimum balance
- Each additional signer adds **0.5 XLM**

**Practical implication**: Before sending someone tokens, verify they have enough XLM headroom. If you're creating an account that will hold 3 trustlines, fund with at least 2.5 XLM (1 base + 1.5 for trustlines).

```javascript
const account = await server.loadAccount(publicKey);
const subentries = account.subentry_count;
const minBalance = (2 + subentries) * 0.5;
console.log(`Min balance: ${minBalance} XLM`);
```

---

## Account Flags

Accounts can have flags set by the issuer. Relevant for asset issuers:

| Flag | Effect |
|------|--------|
| `AUTH_REQUIRED` | Users must be authorized before holding the asset |
| `AUTH_REVOCABLE` | Issuer can revoke trustlines (freeze assets) |
| `AUTH_IMMUTABLE` | Account flags can never be changed |
| `AUTH_CLAWBACK_ENABLED` | Issuer can claw back assets from any account |

For regular user accounts, flags are usually not set.

---

## Signers & Multisig

Every account has a **master key** (the keypair) and can have **additional signers**. Transactions are authorized if the combined weight of signers meets the threshold.

### Thresholds
Each account has three thresholds:
- **Low** (default 0): used for operations like allowTrust, bumpSequence
- **Medium** (default 0): most operations (payments, offers, etc.)
- **High** (default 0): setOptions, accountMerge

Default threshold is 0, master key weight is 1 — so single-signature works out of the box.

### Adding a signer
```javascript
const tx = new TransactionBuilder(sourceAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: secondSignerPublicKey,
        weight: 1,
      },
    })
  )
  .setTimeout(30)
  .build();
```

### 2-of-3 Multisig Setup
```javascript
// Set master weight and thresholds
Operation.setOptions({
  masterWeight: 1,
  lowThreshold: 2,
  medThreshold: 2,
  highThreshold: 3,
  signer: { ed25519PublicKey: signer2, weight: 1 },
});
// Repeat for signer3
```

### Pre-authorized transactions
You can add a hash of a future transaction as a signer — it authorizes itself when submitted. Useful for time-locked operations.

---

## Sponsorship

Account sponsorship lets one account pay the minimum balance reserves for another account's subentries (trustlines, offers, signers, data).

The **sponsor** pays the reserve; the **sponsored** account doesn't need extra XLM for those entries.

```javascript
const tx = new TransactionBuilder(sponsorAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.beginSponsoringFutureReserves({
    sponsoredId: userPublicKey,
  }))
  .addOperation(Operation.createAccount({
    destination: userPublicKey,
    startingBalance: "0",  // sponsor covers reserve
  }))
  .addOperation(Operation.endSponsoringFutureReserves())  // signed by sponsored account
  .setTimeout(30)
  .build();

// Must be signed by BOTH sponsor AND sponsored
tx.sign(sponsorKeypair);
tx.sign(userKeypair);
```

**Use case**: Onboarding users without requiring them to own XLM first. The dApp or service sponsors the account creation and trustline reserves.

---

## Muxed Accounts

A **muxed account** (M...) is a virtual sub-account derived from a G... address with an embedded 64-bit ID. It allows a single Stellar account to represent many logical users — useful for exchanges, custodians, and payment processors.

```javascript
import { MuxedAccount } from "@stellar/stellar-sdk";

const baseKeypair = Keypair.fromSecret(process.env.SECRET);
const muxed = new MuxedAccount(
  await server.loadAccount(baseKeypair.publicKey()),
  "12345678"  // arbitrary user ID
);

console.log(muxed.accountId());  // M... address

// Use as source or destination in transactions
const tx = new TransactionBuilder(muxed, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.payment({
    destination: recipientMuxed.accountId(),
    asset: Asset.native(),
    amount: "10",
  }))
  .setTimeout(30)
  .build();
```

**Important**: Muxed accounts share the base account's XLM balance and sequence number. They are a labeling mechanism, not isolated wallets.

---

## Loading Account State

```javascript
const server = new Horizon.Server("https://horizon.stellar.org");

const account = await server.loadAccount(publicKey);

console.log(account.sequence);        // current sequence number
console.log(account.balances);        // array of { asset_type, asset_code, asset_issuer, balance }
console.log(account.signers);         // array of signers with weights
console.log(account.thresholds);      // low/med/high thresholds
console.log(account.subentry_count);  // number of subentries
console.log(account.flags);           // auth flags
```

### Check specific balance
```javascript
const xlmBalance = account.balances.find(b => b.asset_type === "native");
const usdcBalance = account.balances.find(
  b => b.asset_code === "USDC" && b.asset_issuer === "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
);
```

---

## Sequence Numbers

Every transaction must include the **next** sequence number for the source account. Horizon auto-increments it. If you submit two transactions concurrently from the same account, the second will fail (wrong sequence).

For concurrent transactions:
- Use different source accounts (e.g., a fee account + user account)
- Or queue transactions and submit sequentially
- Or use Soroban (which has different state model)

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_destination` | Destination account doesn't exist | Create account first with `createAccount` |
| `op_low_reserve` | Would drop below minimum balance | Add more XLM or reduce subentries |
| `tx_bad_seq` | Wrong sequence number | Re-fetch account and rebuild transaction |
| `op_underfunded` | Not enough balance | Check balance including minimum reserve |
| `tx_insufficient_fee` | Fee too low during surge | Use fee bump or increase base fee |

---

## SDKs

```bash
npm install @stellar/stellar-sdk        # JavaScript / TypeScript
pip install stellar-sdk                 # Python
go get github.com/stellar/go/clients/horizonclient  # Go
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/accounts — MIT License*

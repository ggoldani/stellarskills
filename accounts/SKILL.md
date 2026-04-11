---
name: stellarskills-accounts
description: Keypairs, account creation, signers, multisig, minimum balance, sponsorship, muxed accounts, smart wallets.
---

# STELLARSKILLS — Accounts

> Keypairs, account creation, signers, multisig, minimum balance, sponsorship, muxed accounts, smart wallets.

---

## When to use

- Creating or funding Stellar accounts
- Setting up multisig (2-of-3, co-signers)
- Sponsoring account reserves for users who don't have XLM
- Reading account state (balances, signers, sequence)
- Working with muxed accounts (exchanges, custodians)

---

## Quick reference

| Operation | Key detail |
|-----------|------------|
| Generate keypair | `Keypair.random()` → G... + S... |
| Create account | `Operation.createAccount({destination, startingBalance})` — minimum 1 XLM |
| Minimum balance | `(2 + subentries) × 0.5` XLM |
| Add signer | `Operation.setOptions({signer: {ed25519PublicKey, weight}})` |
| Set thresholds | `Operation.setOptions({lowThreshold, medThreshold, highThreshold})` |
| Sponsor reserves | `beginSponsoringFutureReserves` → ops → `endSponsoringFutureReserves` |
| Fund on testnet | `GET https://friendbot.stellar.org?addr=G...` |
| Load account (Horizon) | `server.loadAccount(publicKey)` |
| Load account (RPC) | `rpcServer.getAccount(publicKey)` |

---

## Keypairs

Public key (G...) identifies the account. Secret key (S...) controls it. Ed25519, base32-encoded.

```javascript
import { Keypair } from "@stellar/stellar-sdk";

const keypair = Keypair.random();
keypair.publicKey();  // G...
keypair.secret();     // S... — store in env var, never log
```

```javascript
const kp = Keypair.fromSecret(process.env.SECRET_KEY);
```

---

## Account creation

Accounts do not exist until funded on-chain. Generating a keypair alone does nothing.

```javascript
import { TransactionBuilder, Networks, Operation, BASE_FEE, Horizon } from "@stellar/stellar-sdk";
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
const tx = new TransactionBuilder(sourceAccount, {
  fee: BASE_FEE, networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.createAccount({
    destination: newKeypair.publicKey(), startingBalance: "1",
  }))
  .setTimeout(30)
  .build();
tx.sign(sourceKeypair);
await server.submitTransaction(tx);
```

Testnet only — fund without a source account:
```javascript
await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
```

---

## Minimum balance

Every account must maintain a minimum XLM balance. Transactions that would drop below minimum fail.

```
minimumBalance = (2 + numSubentries) × 0.5 XLM
```

| Subentry | Adds to minimum |
|----------|----------------|
| Each trustline | +0.5 XLM |
| Each signer | +0.5 XLM |
| Each offer | +0.5 XLM |
| Each data entry | +0.5 XLM |

Fund with at least `2.5 XLM` for an account that will hold 3 trustlines.

```javascript
const account = await server.loadAccount(publicKey);
const minBalance = (2 + account.subentry_count) * 0.5;
```

Verify current values at [Stellar Lab → Network limits](https://lab.stellar.org/network-limits).

---

## Issuer flags

Set on the **issuing account** via `setOptions`. Control how the issued asset behaves.

| Flag | Effect |
|------|--------|
| `AUTH_REQUIRED` | Holders must be authorized to hold the asset |
| `AUTH_REVOCABLE` | Issuer can freeze individual trustlines |
| `AUTH_IMMUTABLE` | Issuer flags can no longer be changed |
| `AUTH_CLAWBACK_ENABLED` | Issuer can claw back tokens from holders |

These apply to asset issuers only. Regular accounts use signers and thresholds (see below).

---

## Smart Wallets

**Smart wallets** are contract accounts (C...) that act as user wallets. Instead of a single secret key (S...), they enforce authorization via a `__check_auth` function — enabling programmable policies like spend limits, allow lists, and timelocks.

### Passkeys (WebAuthn)

The most common smart wallet pattern uses **passkeys** (Touch ID, Face ID, hardware keys) instead of seed phrases.

- Passkeys use **secp256r1** (P-256) keys — natively verified on-chain since Protocol 21
- No browser extension or seed phrase required
- Registration: WebAuthn creates device keypair, public key stored in contract state
- Signing: WebAuthn assertion returns a signature, verified in `__check_auth`

### Key tools

| Tool | Purpose |
|------|---------|
| [Passkey Kit](https://github.com/kalepail/passkey-kit) | TypeScript SDK for passkey-based smart wallets |
| [Smart Account Kit](https://github.com/OpenZeppelin/stellar-contracts) | OZ smart wallet with programmable policies |
| [Launchtube](https://github.com/stellar/launchtube) | Relay for submitting txs and handling fees (like EVM Paymaster) |

### When to use

- You want passwordless UX (biometrics, no seed phrases)
- You need programmable auth (limits, multi-factor, session keys)
- You want flexible signer mixes: passkeys + Ed25519 + policy signers

→ `/smart-accounts/SKILL.md` — full smart account deployment, policies, session keys
→ [Smart Wallets guide](https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets)

---

## Signers & Multisig

An account has a master key (weight 1 by default) and optional additional signers. A transaction is authorized when the combined weight of signers meets the threshold.

| Threshold | Default | Used for |
|-----------|---------|----------|
| Low | 0 | allowTrust, bumpSequence |
| Medium | 0 | payments, offers, most operations |
| High | 0 | setOptions, accountMerge |

Default thresholds are 0 with master key weight 1 — single-signature works without configuration.

### Add a signer
```javascript
const tx = new TransactionBuilder(sourceAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.setOptions({
    signer: { ed25519PublicKey: signer2PubKey, weight: 1 },
  }))
  .setTimeout(30)
  .build();
```

### 2-of-3 Multisig
```javascript
Operation.setOptions({
  masterWeight: 1,
  lowThreshold: 2, medThreshold: 2, highThreshold: 3,
  signer: { ed25519PublicKey: signer2, weight: 1 },
});
// Repeat .addOperation for signer3
```

### Pre-authorized transactions

Add a hash of a future transaction as a signer — it authorizes itself when submitted. Used for time-locked operations.

---

## Sponsorship

One account (sponsor) pays the XLM reserves for another account's subentries. The sponsored account does not need XLM for those entries.

```javascript
const tx = new TransactionBuilder(sponsorAccount, { fee: BASE_FEE, networkPassphrase: Networks.MAINNET })
  .addOperation(Operation.beginSponsoringFutureReserves({ sponsoredId: userPublicKey }))
  .addOperation(Operation.createAccount({ destination: userPublicKey, startingBalance: "0" }))
  .addOperation(Operation.endSponsoringFutureReserves())
  .setTimeout(30)
  .build();

tx.sign(sponsorKeypair);
tx.sign(userKeypair);  // both must sign
```

Common use: onboarding users who don't own XLM — sponsor account creation + trustline reserves.

---

## Muxed accounts

A muxed account (M...) is a virtual sub-account derived from a G... address with an embedded 64-bit ID. Shares the base account's balance and sequence number — it is a labeling mechanism, not an isolated wallet.

```javascript
import { MuxedAccount } from "@stellar/stellar-sdk";

const muxed = new MuxedAccount(
  await server.loadAccount(baseKeypair.publicKey()),
  "12345678"
);
muxed.accountId();  // M...
```

Use as source or destination in any operation that accepts an address.

---

## Loading account state

```javascript
// Horizon (legacy REST)
const account = await server.loadAccount(publicKey);
// account.sequence, .balances, .signers, .thresholds, .subentry_count, .flags

// RPC
const { sequence } = await rpcServer.getAccount(publicKey);
```

Check a specific balance:
```javascript
const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const usdcBalance = account.balances.find(
  b => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER_MAINNET
);
```

---

## Sequence numbers

Every transaction needs the source account's **next** sequence number. Submitting two transactions concurrently from the same account causes `tx_bad_seq` on the second.

Options: use different source accounts, queue sequentially, or use Soroban (different sequence model).

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Send XLM to unfunded keypair | `op_no_destination` — account must be created first |
| Create account with < 1 XLM | `op_low_reserve` — minimum starting balance is 1 XLM |
| Remove last trustline while holding balance | Fails — must sell/transfer balance first |
| Sponsor revokes sponsorship while subentries exist | Fails — must remove subentries first or transfer sponsorship |
| Muxed account receives payment | Credits the base G... account, not a separate balance |
| Master weight set to 0 with no other signers | Account is permanently locked — cannot recover |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_destination` | Recipient account doesn't exist | Create account with `createAccount` first |
| `op_low_reserve` | Would drop below minimum balance | Fund more XLM or remove subentries |
| `tx_bad_seq` | Wrong or reused sequence number | Re-fetch account before building transaction |
| `op_underfunded` | Insufficient balance for payment + fees | Check balance minus minimum reserve + fees |
| `tx_insufficient_fee` | Fee too low during surge pricing | Use `getFeeStats` or fee bump transaction |

---

## SDKs

```bash
npm install @stellar/stellar-sdk        # JS/TS (verify: https://github.com/stellar/js-stellar-sdk/releases)
pip install stellar-sdk                 # Python
go get github.com/stellar/go-stellar-sdk@latest  # Go
```

---

## See also

- `/assets/SKILL.md` — trustlines and asset issuance (required before receiving non-XLM tokens)
- `/security/SKILL.md` — `require_auth()` for contract accounts (C...)
- Official docs: [Accounts](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/accounts — MIT License*

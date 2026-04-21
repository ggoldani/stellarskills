---
name: stellarskills-passkeys
description: Passkeys and smart wallets on Stellar — WebAuthn authentication, secp256r1 signatures, contract accounts, and relayed transaction flows.
---

Passkeys on Stellar replace seed-phrase signing with WebAuthn-backed smart wallet authorization.

## When to use

- Onboarding users with Touch ID, Face ID, Windows Hello, or hardware security keys
- Building wallets that should not expose or manage seed phrases
- Using smart wallets with programmable authorization rules
- Adding contract-account auth via `__check_auth`
- Sponsoring fees or relaying transactions for new users
- Combining WebAuthn login UX with on-chain signature verification

## Quick reference

| Operation | Detail |
|-----------|--------|
| Passkey standard | WebAuthn credential backed by device or hardware authenticator |
| Curve | `secp256r1` / P-256 |
| On-chain verification | Natively supported on Stellar since Protocol 21 |
| Wallet type | Smart wallet implemented as a contract account |
| Auth entry point | `__check_auth` validates authorization rules |
| Registration | Create credential in browser and bind signer metadata |
| Signing | User approves challenge with passkey authenticator |
| Verification | Contract account verifies WebAuthn-derived signature data |
| SDK | Passkey Kit for TypeScript integration |
| Smart wallet tooling | Smart Account Kit from OpenZeppelin |
| Relay / paymaster | Launchtube |
| Smart account address | Contract account, typically `C...` |

## What passkeys mean on Stellar

A passkey is a WebAuthn credential. The user signs with biometrics, PIN, or a hardware key. The device stores the private material and exposes only the public credential information needed for verification. There is no seed phrase in the normal UX.

On Stellar, passkeys map well to smart wallets because contract accounts can define their own authorization logic. Instead of a classic account signing a transaction directly, the contract account receives an auth request and decides whether the provided proof is valid.

The verification curve is `secp256r1`, also called P-256. Stellar supports native on-chain verification for this curve, which makes passkey-based auth practical without custom cryptography workarounds.

## Smart wallets and `__check_auth`

A smart wallet on Stellar is a contract account. Its authorization policy lives in contract code.

When a transaction requires authorization from that contract account, Stellar invokes `__check_auth`. The wallet contract evaluates:

- what operation is being authorized
- which signatures or proofs were supplied
- whether local wallet policy allows the action
- optional limits, scopes, or time conditions

This is the core difference from a classic `G...` account. The wallet is programmable.

## Registration → Signing → Verification

Passkey flows on Stellar break into three stages.

### 1) Registration

The app asks the browser or device to create a WebAuthn credential. The result includes a credential ID, public key material, and attestation-related data. The wallet or app stores enough metadata to reference that signer later.

### 2) Signing

When the user approves a transaction or auth challenge, the authenticator signs the challenge using the registered credential. The browser returns the signature payload and related authenticator data.

### 3) Verification

The smart wallet contract checks the signature proof inside `__check_auth`, using P-256 verification and whatever policy rules the wallet defines.

## Tooling

| Tool | Role |
|------|------|
| Passkey Kit | TypeScript SDK for passkey creation, management, and signing flows |
| Smart Account Kit | OpenZeppelin toolkit for Stellar smart account patterns |
| Launchtube | Relay / paymaster path for fee sponsorship and user-friendly submission |

## Create a wallet with a passkey

The exact APIs vary by package composition, but the typical shape is: create credential, derive wallet context, deploy or initialize smart account.

```ts
import { PasskeyKit } from "passkey-kit";

const pk = new PasskeyKit({
  rpId: "app.example.com",
  rpName: "Example App",
});

const credential = await pk.register({
  userName: "gold@example.com",
  displayName: "Gold",
});
```

What registration should persist:

- credential ID
- public key or verifier-ready key material
- relying party context
- wallet or account identifier linked to that credential
- optional metadata for preferred authenticator and device label

## Create or initialize the smart wallet

A smart wallet contract usually stores signer configuration and calls into a verifier path from `__check_auth`.

```ts
import { SmartAccountKit } from "smart-account-kit";

const sak = new SmartAccountKit({
  rpcUrl: process.env.RPC_URL!,
  networkPassphrase: process.env.NETWORK_PASSPHRASE!,
  accountWasmHash: process.env.ACCOUNT_WASM_HASH!,
  webauthnVerifierAddress: process.env.VERIFIER!,
});

const wallet = await sak.createWallet("Example App", "gold@example.com");
```

Typical deployment concerns:

- verifier contract address must match the target network
- the account contract hash must be the expected wallet implementation
- the deploy path may need sponsorship for first-time users
- credential metadata must line up with the verifier format the wallet expects

## Sign with a passkey

After registration, the app requests a signature for the auth challenge or transaction-related payload.

```ts
const auth = await pk.sign({
  credentialId: credential.id,
  challenge: challengeBytes,
});

console.log(auth.signature);
```

The app then packages that result for contract-account authorization.

## Submit through the smart wallet

A smart wallet flow usually simulates, attaches auth entries, then submits directly or through a relayer.

```ts
const result = await sak.signAndSubmit(transaction, {
  credentialId: credential.id,
});

console.log(result.hash);
```

If a relay/paymaster path is enabled, the user does not need XLM in the wallet to cover fees.

## Relayed submission with Launchtube

Launchtube is the fee relay path commonly used to smooth onboarding. The passkey user authorizes the action, while the relay infrastructure pays fees and submits.

```ts
const sak = new SmartAccountKit({
  rpcUrl: process.env.RPC_URL!,
  networkPassphrase: process.env.NETWORK_PASSPHRASE!,
  relayerUrl: process.env.LAUNCHTUBE_URL!,
  accountWasmHash: process.env.ACCOUNT_WASM_HASH!,
  webauthnVerifierAddress: process.env.VERIFIER!,
});
```

Use relay mode when:

- the user is new and has no XLM yet
- the app wants gasless onboarding
- the signer should only approve intent, not handle fee funding
- you want wallet UX closer to Web2 app expectations

## Verification model inside the wallet

A passkey-aware wallet contract usually checks:

- the caller is presenting auth for the expected contract account
- the challenge matches the auth entry being approved
- the WebAuthn payload structure is valid
- the signer maps to a registered credential
- P-256 signature verification succeeds
- local wallet policy allows the action

Common policy layers on top of passkeys:

- daily or per-call spending limits
- function allowlists
- time-based restrictions
- recovery signers or admin rotation
- multiple signers on a single wallet

## Architectural notes

| Topic | Practical note |
|-------|----------------|
| Classic account vs smart wallet | Passkeys fit smart wallets, not classic account direct signing |
| Device loss | Recovery must exist outside the lost passkey, or funds can become unreachable |
| Credential rotation | Design signer add/remove flows before launch |
| Browser dependence | Registration and signing rely on WebAuthn-capable environments |
| Multi-device usage | Each authenticator is a distinct credential unless synced by platform tooling |

## Edge cases

| Situation | What happens | Handling |
|-----------|--------------|----------|
| User changes device | Old credential may not exist on the new device | Add account recovery or multi-passkey enrollment |
| Browser creates resident credential with different UX | User selection flow differs by platform | Test on target browsers and simplify prompts |
| Wallet deployed but signer metadata missing | `__check_auth` cannot match the signer | Persist credential ID and verifier-compatible public key data correctly |
| Auth challenge reused | Replay risk | Bind challenge to tx/auth entry and reject stale payloads |
| Wrong relying party ID | Registration or signing fails in browser | Keep RP ID aligned with the app origin |
| Relayer unavailable | Gasless submission fails | Fallback to direct submit or queue for retry |
| Hardware key only | Biometric UX disappears | Treat hardware tokens as valid WebAuthn signers, but message UX accordingly |

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `NotAllowedError` during registration | User cancelled, browser policy blocked, or insecure origin | Use HTTPS, valid RP ID, and prompt user again |
| Verification fails on-chain | Wrong challenge encoding or verifier mismatch | Normalize challenge format and match wallet/verifier expectations |
| Wallet cannot authorize | `__check_auth` policy rejects action | Inspect signer scope, limits, and target operation |
| Transaction signs locally but submit fails | Auth entries built for wrong network or contract | Rebuild against the correct RPC, passphrase, and wallet address |
| Passkey works in browser but not in contract | WebAuthn payload not transformed into verifier format | Use the SDK's canonical encoding path |
| User has no funds for first submit | No sponsorship configured | Use Launchtube or another relayer/paymaster flow |
| Lost only passkey | No valid signer remains | Recovery design is mandatory, not optional |

## SDKs

| SDK / Tool | Role |
|------------|------|
| Passkey Kit | Passkey registration and signing in TypeScript |
| Smart Account Kit | Smart wallet deployment and transaction handling |
| Launchtube | Relay/paymaster service for sponsored submission |

Verified sources:

- `https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets`
- `https://developers.stellar.org/docs/build/apps/guestbook/overview`
- `https://github.com/kalepail/passkey-kit`
- `https://github.com/stellar/launchtube`

## See also

- `/smart-accounts/SKILL.md`
- `/accounts/SKILL.md`

*raw.githubusercontent.com/ggoldani/stellarskills/main/passkeys — MIT License*

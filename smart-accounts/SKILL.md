---
name: stellarskills-smart-accounts
description: Smart Accounts on Stellar — contract-based wallets, passkey support, programmable authorization, policies, and gasless transactions.
---

# STELLARSKILLS — Smart Accounts

> Contract-based wallets (C...) with passkey auth, programmable policies, session keys, and gasless transactions.

---

## When to use

- Building a wallet that uses passkeys/biometrics instead of seed phrases
- Implementing spending limits, time-locks, or multisig on a single contract account
- Onboarding users without requiring them to hold XLM (fee sponsorship)
- Adding session keys for dApp interactions (limited scope, no repeated signing)
- Social recovery or backup signer flows
- Detecting C... vs G... addresses in a dApp frontend

---

## Quick reference

| Operation | Key detail |
|-----------|------------|
| Smart account address | Starts with `C...` (contract-based), not `G...` (Ed25519) |
| Initialize SDK | `new SmartAccountKit({ rpcUrl, networkPassphrase, accountWasmHash, webauthnVerifierAddress })` |
| Create wallet | `kit.createWallet(appName, userName)` — prompts passkey, deploys contract |
| Connect wallet | `kit.connectWallet()` — restores session or prompts passkey selection |
| Add signer | `kit.signers.addPasskey(contextRuleId, appName, userName)` |
| Add policy | On-chain: add context rule with policy contract address |
| Gasless tx | Set `relayerUrl` in config — SDK posts `{ func, auth }` to relayer |
| Sign & submit | `kit.signAndSubmit(transaction)` — simulates, signs, submits |
| Detect C... address | `address.startsWith('C')` — Wallets Kit returns C... for smart accounts |
| SEP-45 auth | Extended SEP-10 for contract accounts — uses auth entries instead of tx signing |

---

## Smart Account Kit setup

```bash
npm install smart-account-kit
```

```typescript
import { SmartAccountKit, IndexedDBStorage } from 'smart-account-kit';

const kit = new SmartAccountKit({
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  accountWasmHash: 'ACCOUNT_WASM_HASH',       // OZ account contract WASM
  webauthnVerifierAddress: 'CWEBAUTHN_VERIFIER', // verifier contract
  storage: new IndexedDBStorage(),
  relayerUrl: 'https://relayer.example.com',   // optional: gasless
});
```

Config fields:

| Field | Required | Purpose |
|-------|----------|---------|
| `rpcUrl` | Yes | Stellar RPC endpoint |
| `networkPassphrase` | Yes | Network identification |
| `accountWasmHash` | Yes | OZ account contract WASM hash |
| `webauthnVerifierAddress` | Yes | WebAuthn signature verifier contract |
| `storage` | No | Credential persistence (IndexedDB default) |
| `relayerUrl` | No | Fee sponsor relayer for gasless tx |

---

## Create a smart wallet (passkey)

Creates a new contract account tied to a freshly generated passkey. Prompts the user for biometric/PIN authentication.

```typescript
const { contractId, credentialId } = await kit.createWallet(
  'My App',
  'user@example.com',
  {
    autoSubmit: true,   // deploy immediately
    autoFund: true,     // Friendbot (testnet only)
  }
);
console.log(`Wallet deployed: ${contractId}`); // C...
```

The contract address is deterministic — derived from deployer + salt. Same passkey always maps to the same C... address.

---

## Create a key-based wallet

For cases without passkey support, use Ed25519 keys as signers.

```typescript
// After deploying, add an Ed25519 signer to a context rule
const { transaction } = await kit.signers.addEd25519(contextRuleId, {
  publicKey: 'GABCD...',
  weight: 1,
});
```

Verify the exact API for your SDK version — key-based signer management may vary.

---

## Connect to an existing wallet

Restores from local storage (silent) or prompts passkey selection.

```typescript
// Silent restore from session
await kit.connectWallet();

// Prompt user to select passkey
await kit.connectWallet({ prompt: true });

// Connect to specific contract
await kit.connectWallet({
  contractId: 'CABC...',
  credentialId: 'credential-id-from-storage',
});
```

---

## Sign and submit transactions

```typescript
const result = await kit.signAndSubmit(transaction);
// Simulates → signs with passkey → submits to RPC
```

For gasless: when `relayerUrl` is configured, `signAndSubmit` posts the auth payload to the relayer instead of submitting directly. The relayer pays fees and submits on-chain.

---

## Policy configuration

Policies are external contracts attached to context rules. They enforce constraints as read-only prechecks before execution.

### Context rules

Context rules define what operations are allowed, who can perform them, and which policies enforce constraints.

| Component | Role |
|-----------|------|
| Context (What) | Scope: specific function call, any call to a contract, deploy, or any contract |
| Signers (Who) | Ed25519 keys, passkeys (secp256r1), G-accounts, C-accounts |
| Policies (How) | Spending limits, multisig thresholds, time-locks, recurrence rules |

### Adding a spending limit

```typescript
// Add a context rule with a spending limit policy
// Policy contract address from OZ accounts package
const policyAddress = 'CPOLICY_SPENDING_LIMIT';

// Add via smart account kit (pattern — verify exact API)
await kit.contextRules.add({
  scope: { type: 'function_call', contract: 'CTOKEN...', function: 'transfer' },
  signers: [{ type: 'ed25519', publicKey: 'G...' }],
  policies: [{ address: policyAddress, args: { limit: 500 } }],
  expirationLedger: currentLedger + 10000,
});
```

### Time-lock example

A time-lock policy prevents execution until a minimum time has passed since the rule was created.

```typescript
await kit.contextRules.add({
  scope: { type: 'any_contract' },
  signers: [{ type: 'ed25519', publicKey: 'G...' }],
  policies: [{ address: 'CPOLICY_TIMELOCK', args: { delay: 86400 } }], // 24h
  expirationLedger: currentLedger + 50000,
});
```

### Multisig (2-of-3) via policy

```typescript
await kit.contextRules.add({
  scope: { type: 'any' },
  signers: [
    { type: 'ed25519', publicKey: 'GKEY1...' },
    { type: 'ed25519', publicKey: 'GKEY2...' },
    { type: 'ed25519', publicKey: 'GKEY3...' },
  ],
  policies: [{ address: 'CPOLICY_MULTISIG', args: { threshold: 2 } }],
});
```

---

## Fee sponsorship (gasless)

Configure a relayer to pay transaction fees on behalf of the smart account user.

```typescript
const kit = new SmartAccountKit({
  // ... other config
  relayerUrl: 'https://your-relayer.example.com',
});

// Transactions submitted via signAndSubmit will be gasless
// The SDK posts { func, auth } to the relayer
// Relayer signs as fee payer and submits
```

Requirements: the relayer must have XLM balance and be configured to accept auth payloads from your app.

---

## Wallets Kit integration

The Stellar Wallets Kit returns `C...` addresses for smart account wallets and `G...` for traditional wallets.

```typescript
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
const kit = new StellarWalletsKit({
  network: WalletNetwork.PUBLIC, selectedWalletId: 'freighter',
  modules: allowAllModules(),
});
const { address } = await kit.getAddress();
```

Smart accounts (C...) use auth entry signing, traditional (G...) use transaction signing:
```typescript
if (address.startsWith('C')) {
  const { signedAuthEntry } = await kit.signAuthEntry(authEntryXdr, { address });
} else {
  const { signedTxXdr } = await kit.signTransaction(txXdr, { address });
}
```

Key API methods:

| Method | Returns |
|--------|---------|
| `kit.getAddress()` | `{ address }` — C... or G... |
| `kit.signTransaction(xdr, opts)` | `{ signedTxXdr }` |
| `kit.signAuthEntry(xdr, opts)` | `{ signedAuthEntry }` |
| `kit.setWallet(walletId)` | Switch active wallet |
| `kit.disconnect()` | Clear session |

---

## SEP-45 — Web Auth for Contract Accounts

SEP-45 extends SEP-10 authentication to contract accounts. The challenge transaction uses the C... address, and auth entries are signed instead of the full transaction.

Flow:
1. Anchor creates a SEP-10 challenge with C... as the client account
2. Wallet signs auth entries (not the full transaction)
3. Anchor verifies signatures against the smart account's authorization rules
4. Returns a JWT for API access

---

## C... vs G... address detection

```typescript
function isSmartAccount(address: string): boolean {
  return address.startsWith('C');
}

function accountType(address: string): 'smart' | 'traditional' {
  return address.startsWith('C') ? 'smart' : 'traditional';
}
```

Smart accounts (C...) use `require_auth()` via the contract's `__check_auth` function. Traditional accounts (G...) use the Soroban built-in Ed25519 verification.

---

## Authorization flow

When a smart account receives a transaction:

1. **Rule collection** — gather all non-expired context rules matching the call context
2. **Rule evaluation** — authenticate signers and validate policies (newest first)
3. **Policy enforcement** — if signers pass and policy prechecks succeed, state changes trigger
4. **Result** — grant or deny authorization

Multiple rules can match — the first rule that fully satisfies grants access.

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Passkey not available (no biometric hardware) | `createWallet` throws — fall back to Ed25519 key-based auth |
| Relayer is down | `signAndSubmit` falls back to direct RPC submission (if no relayer) or fails |
| Context rule expired | Authorization denied — user must create a new rule |
| Same passkey on different devices | Each device gets a separate credential — add both as signers |
| Contract not yet deployed (pending) | `connectWallet` returns pending state — call `kit.deploy(credentialId)` |
| Send XLM to unfunded smart account | Works — smart accounts don't need pre-funding like G... accounts |
| Multiple policies on one rule | All policies must pass (AND logic) for the rule to authorize |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Passkey prompt cancelled | User dismissed biometric dialog | Retry or fall back to key-based auth |
| `op_no_destination` | Recipient account doesn't exist | Smart accounts self-deploy — check if contract WASM is valid |
| Auth entry verification failed | Signer not registered or policy rejected | Check context rules and signer weights |
| Relayer returns 401 | Relayer API key invalid or expired | Update relayer credentials |
| `insufficient_fee` | Account can't pay fees (no XLM) | Enable fee sponsorship via relayer |
| Contract not found at C... | WASM hash mismatch or not deployed | Verify `accountWasmHash` matches network |
| WebAuthn not supported | Browser lacks Secure Context (not HTTPS) | Serve over HTTPS or localhost |

---

## See also

- `/accounts/SKILL.md` — G... keypair accounts, multisig, sponsorship, minimum balance
- `/security/SKILL.md` — `require_auth()` for contract accounts (C...)
- [Smart Account Kit (GitHub)](https://github.com/kalepail/smart-account-kit) — SDK reference and examples

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/smart-accounts — MIT License*

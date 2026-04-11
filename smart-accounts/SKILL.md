---
name: stellarskills-smart-accounts
description: Smart Accounts on Stellar (Protocol 26) — contract-based wallets, passkey support, programmable authorization, and the Smart Account Kit.
---

# STELLARSKILLS — Smart Accounts

> Smart Accounts on Stellar (Protocol 26) — contract-based wallets with passkey support, programmable authorization policies, and gasless transactions.

---

## What are Smart Accounts?

Smart Accounts (introduced in **Protocol 26** via CAP-51) are **contract-based wallets** that replace the traditional G... keypair model with programmable contract accounts (C... addresses).

Key capabilities:
- **Passkey / biometric authentication** — no seed phrases needed
- **Programmable policies** — spending limits, multisig rules, time-locks
- **Session keys** — approve a dApp for limited time/scope without repeated signing
- **Gasless transactions** — fees sponsored via OpenZeppelin Relayer
- **Recovery** — social recovery, backup signers

---

## Smart Account Kit

The official **Smart Account Kit** from OpenZeppelin provides a complete framework for building Smart Account wallets on Stellar.

```bash
npm install @smart-account-kit/core @smart-account-kit/storage-indexeddb
```

### Key Components
- **SmartAccountKit**: Core SDK for Smart Account operations
- **IndexedDBStorage**: Browser-based storage for wallet state and session data
- **Policy support**: Built-in policies for multisig, spending limits, time-locks
- **OpenZeppelin Relayer integration**: Gasless transaction sponsorship

---

## Smart Accounts in the Wallets Kit

The Stellar Wallets Kit supports Smart Accounts via the **useStellarWallet** hook:

```javascript
import { useStellarWallet } from '@creit.tech/stellar-wallets-kit';

const { address, isConnected, connect, disconnect } = useStellarWallet();
// address returns C... for Smart Accounts, G... for traditional
```

---

## SEP-45 — Web Auth for Contract Accounts

SEP-45 extends SEP-10 to work with contract-based accounts (C...), enabling Smart Account wallets to authenticate with anchors and other services.

- The challenge transaction uses the contract's address instead of a G... public key
- Auth entries are signed instead of the full transaction
- See `/seps/SKILL.md` for SEP-10 details

---

## Official documentation

- Smart Accounts: https://developers.stellar.org/docs/build/smart-contracts/smart-accounts  
- OpenZeppelin Smart Accounts: https://docs.openzeppelin.com/stellar-contracts/contracts/account-abstraction  
- Stellar Wallets Kit: https://stellar.github.io/stellar-wallets-kit/  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/smart-accounts — MIT License*

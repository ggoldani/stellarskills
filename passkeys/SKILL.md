---
name: stellarskills-passkeys
description: Learn how to integrate Passkeys and smart wallets on Stellar using passkey-kit for dApp development. Replace traditional seed phrases with WebAuthn (Face ID / Touch ID) powered by secp256r1 keys.
---

# STELLARSKILLS — Passkeys

> Learn how to integrate Passkeys and smart wallets on Stellar using passkey-kit for dApp development. Replace traditional seed phrases with WebAuthn (Face ID / Touch ID) powered by `secp256r1` keys.

---

## 1. Passkeys on Stellar

Stellar supports **Passkeys** (WebAuthn) using `secp256r1` (P-256) keys, allowing developers to create "Smart Wallets" that users can unlock using biometric authentication like Face ID or Touch ID, instead of managing traditional 24-word seed phrases.

This creates a seamless Web2-like experience while remaining entirely non-custodial and secure.

---

## 2. Developer Tooling

The primary SDK to work with passkeys on Stellar is **[Passkey Kit](https://github.com/kalepail/passkey-kit)**.

Passkey Kit provides:
- A TypeScript SDK for creating and managing Stellar smart wallets.
- Client-side and server-side components to handle authentication.

---

## 3. Project Scaffolding

SDF provides a ready-to-use boilerplate for SvelteKit + Passkeys, which drastically reduces setup time.

**Template Repository:** [soroban-template-sveltekit-passkeys](https://github.com/ElliotFriend/soroban-template-sveltekit-passkeys)

To start a new project using this template:
```bash
git clone https://github.com/ElliotFriend/soroban-template-sveltekit-passkeys my-dapp
cd my-dapp
pnpm install
```

The template includes:
- Out-of-the-box passkey logic and helpers.
- Pre-configured `.env` structures.
- Launchtube integration for simplified transaction submission.
- A foundational `hello_world` contract and bindings.

---

## 4. Key Concepts

- **Smart Wallets:** Instead of standard ED25519 keypairs, users get a smart contract wallet.
- **secp256r1 Keys:** The cryptographic curve used by Apple, Google, and Microsoft for Passkeys.
- **Launchtube:** Similar to an EVM Paymaster, Launchtube abstracts away the complexity of submitting Soroban operations to the network and paying gas fees on behalf of users.
- **Server/Client split:** Passkey integration usually requires a backend server to generate challenges and verify signatures securely before interacting with the Stellar network.

---

## 5. Official documentation

- **Passkeys Dapp Tutorial:** https://developers.stellar.org/docs/build/apps/guestbook/overview
- **Passkey Kit GitHub:** https://github.com/kalepail/passkey-kit
- **SvelteKit Template:** https://github.com/ElliotFriend/soroban-template-sveltekit-passkeys
- **Launchtube:** https://launchtube.xyz/

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/passkeys — MIT License*
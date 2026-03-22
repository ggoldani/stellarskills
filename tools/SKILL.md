---
name: stellarskills-tools
description: The essential tools, SDKs, wallets, and explorers for building on Stellar.
---

# STELLARSKILLS — Tools & SDKs

> The essential tools, SDKs, wallets, and explorers for building on Stellar.

---

## SDKs (Software Development Kits)

SDF officially maintains or heavily supports these SDKs for interacting with **Horizon** (legacy REST) and **Stellar RPC** (JSON-RPC for Soroban).

| Language | Package | Purpose |
|----------|---------|---------|
| **JavaScript / TS** | `@stellar/stellar-sdk` | Everything. Wallets, backend, frontend. |
| **Rust** | `soroban-sdk` | Writing Soroban smart contracts. |
| **Python** | `stellar-sdk` | Backend automation, data science. |
| **Go** | `github.com/stellar/go` | High-performance backend services. |
| **Java** | `java-stellar-sdk` | Enterprise backends, Android. |
| **Flutter / Dart** | `stellar_flutter_sdk` | Mobile app development. |
| **iOS / Swift** | `stellar-ios-mac-sdk` | iOS app development. |

### JS SDK Pro Tip
The JS SDK is split conceptually but bundled together:
- `Keypair`, `TransactionBuilder`, `Operation` (Core XDR building)
- `Horizon.Server` (Classic protocol REST API)
- `SorobanRpc.Server` (Stellar / Soroban JSON-RPC client in JS)

Check the current release: https://github.com/stellar/js-stellar-sdk/releases  

---

## Developer Tools

### 1. Stellar CLI
The Swiss Army knife for Soroban and Stellar development. Written in Rust.
```bash
cargo install --locked stellar-cli --features opt

# Manage identities
stellar keys generate alice

# Fund on testnet
stellar keys fund alice

# Build and optimize contracts
stellar contract build
stellar contract optimize --wasm target/.../my_contract.wasm

# Deploy and invoke contracts
stellar contract deploy --wasm ... --source alice --network testnet
stellar contract invoke --id C... --source alice --network testnet -- func_name --arg value
```

### 2. Stellar Lab
A GUI for exploring the network, building transactions manually, and signing them. Excellent for debugging XDR.
**URL**: `https://lab.stellar.org`

### 3. Friendbot
The testnet faucet. Funds an account with 10,000 testnet XLM.
```bash
curl "https://friendbot.stellar.org?addr=G..."
```

---

## Explorers

To view ledgers, accounts, transactions, and assets on-chain.

| Explorer | URL | Best For |
|----------|-----|----------|
| **Stellar Expert** | `https://stellar.expert` | The gold standard. Asset stats, AMM pools, contract invocations, SEP discovery. |
| **Steexp** | `https://steexp.com` | Simple, fast ledger exploration. |

---

## Wallets (for Developers)

To test your dApp, you need a wallet that supports Soroban and WalletConnect.

| Wallet | Platform | Notes |
|--------|----------|-------|
| **Freighter** | Browser Extension | The MetaMask of Stellar. Built by SDF. Essential for testing web dApps. Supports testnet, futurenet, mainnet. |
| **Lobstr** | Mobile / Web | The most popular consumer wallet. Supports classic assets, DEX, and WalletConnect. |
| **Vibrant** | Mobile | USDC-centric consumer wallet. Good for testing SEP-24 fiat rails. |

---

## RPC & Horizon Providers

You shouldn't use the SDF public endpoints for heavy production traffic. Use an RPC URL from **[Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers)**.

Examples (non-exhaustive): **Validation Cloud**, **Blockdaemon**, **Tatum**, **QuickNode**.

---

## Official documentation

- Stellar docs: https://developers.stellar.org/docs  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  
- Horizon (deprecated): https://developers.stellar.org/docs/data/apis/horizon  
- JS SDK releases: https://github.com/stellar/js-stellar-sdk/releases  

---

## Open Source Reference Projects

When you don't know how to implement something, look here:

- **Polaris** (`stellar/django-polaris`): Reference implementation for Anchors (SEPs).
- **Soroban Example dApp** (`stellar/soroban-example-dapp`): End-to-end React + Soroban contract example.
- **Freighter API** (`stellar/freighter`): How the browser extension works.

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/tools — MIT License*

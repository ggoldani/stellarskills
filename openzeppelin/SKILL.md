---
name: stellarskills-openzeppelin
description: OpenZeppelin's audited smart contracts, Contract Wizard, and developer toolings for Stellar's Soroban (Rust) environment.
---

# STELLARSKILLS — OpenZeppelin

> OpenZeppelin's audited smart contracts, Contract Wizard, and developer toolings for Stellar's Soroban (Rust) environment.

**Maintenance note:** Module names, wizard options, and repo layout change over time. Always confirm capabilities against [OpenZeppelin Stellar contracts docs](https://docs.openzeppelin.com/stellar-contracts), the [Contract Wizard](https://wizard.openzeppelin.com/stellar), and the [stellar-contracts](https://github.com/OpenZeppelin/stellar-contracts) repository before generating production code.

---

## 1. What is OpenZeppelin on Stellar?

OpenZeppelin brings its industry-standard library of audited smart contracts (traditionally for EVM/Solidity) natively to Stellar using Rust.

You can now build payments, stablecoins, DeFi, and RWA (Real World Asset) tokenization applications on Soroban using secure, audited building blocks.

**Core Links:**
- **Library**: `https://github.com/OpenZeppelin/stellar-contracts`
- **Contract Wizard**: `https://wizard.openzeppelin.com/stellar`
- **Docs**: `https://docs.openzeppelin.com/stellar-contracts`

---

## 2. Audited Smart Contract Modules

Instead of writing tokens or governance from scratch in Rust, you should use the audited macros provided by OpenZeppelin.

### Token Standards
- **Fungible Token**: Standard token with extensions for Burnable, Capped, Allowlist, and Blocklist.
- **Non-Fungible Token (NFT)**: With Burnable, Enumerable, Consecutive (batch minting), and Royalties extensions.
- **Stablecoin Token**: Specialized for fiat-backed assets (Burnable, Capped, Allowlist, Blocklist).
- **RWA Token (ERC-3643)**: Advanced regulatory features (Identity Management, Compliance Framework, Transfer Controls, Freezing Mechanisms, Recovery System, Pausable, RBAC).
- **Token Vault (SEP-56)**: Yield-bearing vaults that hold underlying assets while issuing hyperfungible vault shares.

### Smart Accounts (Account Abstraction)
Contract-based wallets built for flexible and programmable authorization. Separates signers, context rules (what they can do), and policies (how it's enforced - like multisig or spending limits).

### Utilities
- Pausable and Upgradeable
- Role-based Access Control (RBAC) and Ownable
- Merkle Distributor
- Fixed Point Math (WAD)
- Time Lock

---

## 3. The OpenZeppelin Contract Wizard

If you are an AI agent generating a contract for a user, or a developer starting a project, use the **Contract Wizard** to generate the initial Rust code.

The Wizard allows you to interactively configure a token (e.g., adding `Burnable` and `Pausable` extensions to a Fungible Token) and exports:
- A single Rust file.
- A full Rust development package.
- A Scaffold Stellar Package (full-stack template).

URL: `https://wizard.openzeppelin.com/stellar`

---

## 4. OpenZeppelin Developer Tools

In addition to contracts, OpenZeppelin provides infrastructure tools specifically for the Stellar ecosystem:

| Tool | Purpose | Link |
|------|---------|------|
| **Relayer** | Infrastructure for robustly relaying transactions. | `github.com/OpenZeppelin/openzeppelin-relayer` |
| **Monitor** | Monitor blockchain events and transactions. | `github.com/OpenZeppelin/openzeppelin-monitor` |
| **UI Builder**| Open source tool to auto-generate UI forms for contracts. | `builder.openzeppelin.com` |
| **Role Manager**| Access control UI. Visualize roles and execute admin actions. | `github.com/OpenZeppelin/role-manager` |
| **Security Detector SDK**| Static analysis scanner to catch common Soroban pitfalls before mainnet deployment. | `github.com/OpenZeppelin/soroban-security-detectors-sdk` |
| **MCP Server** | Generate secure Stellar smart contracts via Model Context Protocol templates. | `mcp.openzeppelin.com` |

---

## Official Stellar context

- Stellar developer tools hub: https://developers.stellar.org/docs/tools  
- Soroban overview: https://developers.stellar.org/docs/build/smart-contracts/overview  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin — MIT License*

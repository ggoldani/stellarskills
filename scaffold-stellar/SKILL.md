---
name: stellarskills-scaffold-stellar
description: Scaffold Stellar — full-stack dApp scaffolding tool for rapid Stellar development with pre-configured Soroban contracts, frontend, and deployment.
---

# STELLARSKILLS — Scaffold Stellar

> Scaffold Stellar — full-stack dApp scaffolding tool for rapid Stellar development.

---

## What is Scaffold Stellar?

Scaffold Stellar is the official scaffolding tool for quickly bootstrapping full-stack Stellar dApps. It generates a complete project with:

- Pre-configured Soroban smart contracts (Rust)
- React/Next.js frontend with Wallets Kit integration
- Deployment scripts (testnet + mainnet)
- Testing setup

---

## Quick Start

```bash
# Generate a new project
npx create-scaffold-stellar my-dapp
cd my-dapp

# Install dependencies
npm install

# Start development
npm run dev
```

---

## Integration with OpenZeppelin Wizard

Scaffold Stellar works with the **OpenZeppelin Contract Wizard** to generate audited contract code:

1. Configure your token in the [Wizard](https://wizard.openzeppelin.com/stellar)
2. Export as a Scaffold Stellar Package
3. Integrate into your Scaffold Stellar project

---

## Official documentation

- Scaffold Stellar: https://developers.stellar.org/docs/tools/scaffold-stellar  
- OpenZeppelin Wizard: https://wizard.openzeppelin.com/stellar  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/scaffold-stellar — MIT License*

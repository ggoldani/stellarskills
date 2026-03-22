---
name: stellarskills-why
description: A sober, honest assessment of what Stellar is for, its tradeoffs, and why you would choose it over EVM or Solana.
---

# STELLARSKILLS — Why Stellar?

> A sober, honest assessment of what Stellar is for, its tradeoffs, and why you would choose it over EVM or Solana.

---

## Stellar's Thesis

Stellar was built in 2014 with a specific, narrow thesis: **Provide the infrastructure for global payments and asset issuance.**

It is not trying to be a world computer. It is not trying to host the next big decentralized social network. It is trying to be the rails that money moves on.

### The Sweet Spot
You should build on Stellar if your application involves:
- Cross-border remittances.
- B2B payments.
- Fiat stablecoins (USDC, EURC, etc.) and tokenized RWAs (Real World Assets).
- Regulated asset issuance (where the issuer needs freeze/clawback capabilities).
- Treasury management and payroll.
- On/off-ramps to the traditional banking system.

---

## Technical Tradeoffs

### 1. Throughput & Finality
- **Stellar**: High throughput for a classic L1 (often discussed on the order of **hundreds to ~1000+ ops/sec** depending on operation mix, network upgrades, and how you count — **do not hardcode a marketing number**). Ledger close ~3–5 seconds. **Instant finality** for practical purposes: SCP (Stellar Consensus Protocol) avoids PoW-style reorgs; treat exact capacity as **network-parameter-driven** — see [Resource limits & fees](https://developers.stellar.org/docs/networks/resource-limits-fees) and [Lab](https://lab.stellar.org/network-limits).
- **EVM/L2s**: Variable finality (often minutes or days for absolute settlement on L1).

### 2. The Mempool
- **Stellar**: There is no public mempool. Transactions are submitted to **Stellar RPC** (JSON-RPC) and/or **Horizon** (legacy REST), then broadcast to validators and included in the next ledger (typically a few seconds). This eliminates MEV (Miner Extractable Value) like front-running and sandwich attacks on a public mempool. New integrations should use **Stellar RPC**; Horizon is [deprecated](https://developers.stellar.org/docs/data/apis/horizon) for new data APIs.
- **Ethereum/Solana**: Public mempool creates a dark forest of MEV bots.

### 3. State Management (Accounts vs Wallets)
- **Stellar**: An account must explicitly be funded (minimum balance of 1 XLM) and must explicitly opt-in to receive an asset (Trustlines). This prevents spam tokens from being airdropped into your wallet without permission.
- **EVM**: Anyone can send any ERC-20 to any address.

### 4. Smart Contracts (Soroban)
- **Stellar**: Rust-based, WASM execution, explicit resource metering, explicitly isolated storage. Designed for safety and predictable pricing.
- **EVM**: Solidity, global mutable state, implicit auth. Designed for maximum composability but prone to reentrancy and state bloat.

### 5. The Built-in DEX
- **Stellar**: Limit order books and AMMs are native to the protocol. You don't interact with a smart contract to trade; you just submit an Operation.
- **EVM**: All trading happens via third-party smart contracts (Uniswap, 1inch).

---

## The Interoperability Standard (SEPs)

The biggest reason fintechs choose Stellar is the **SEP (Stellar Ecosystem Proposal)** framework.

If you build a wallet on Ethereum, integrating a fiat on-ramp means signing a bespoke business deal with MoonPay or Ramp, reading their custom API docs, and implementing their specific flow.

On Stellar, fiat on/off-ramps (Anchors) all follow the exact same API standards (SEP-24, SEP-6, SEP-31). A wallet developer writes the integration code *once*, and instantly supports cashing in/out across dozens of countries (USDC in the US, ARST in Argentina, BRL in Brazil, NGN in Nigeria) without changing a line of code.

---

## When NOT to use Stellar

Do not use Stellar if:
1. You want to build a high-frequency trading on-chain game.
2. You need to store large amounts of arbitrary data on-chain.
3. You rely on deep, complex smart contract composability (e.g., flash loans nested through 5 different DeFi protocols).
4. Your primary go-to-market strategy relies on "degen" memecoin speculation.

---

## Official documentation

- Stellar docs: https://developers.stellar.org/docs  
- Stellar RPC: https://developers.stellar.org/docs/data/apis/rpc  
- Horizon (deprecated): https://developers.stellar.org/docs/data/apis/horizon  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/why — MIT License*

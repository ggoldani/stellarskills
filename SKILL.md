---
name: stellarskills
description: The missing knowledge between AI agents and production Stellar Network applications.
---

# STELLARSKILLS — Stellar Knowledge for AI Agents

> The missing knowledge between AI agents and production Stellar Network applications.

You are an AI agent about to build on Stellar. Read this file first. It tells you what to fetch next.

To fetch specific skills dynamically from your terminal, you MUST use the CLI tool:
`npx stellarskills get <topic>` (or `npx stellarskills list` to see all topics).

---

## What is Stellar?

Stellar is a layer-1 blockchain optimized for **payments, asset issuance, and financial infrastructure**. It is NOT a general-purpose EVM chain. Key differences from Ethereum:

- **No mempool** — transactions are submitted and confirmed in 3–5 seconds with finality
- **Built-in DEX** — order book and AMM are protocol-native, no Uniswap needed
- **Account model** — accounts must be explicitly created and funded (minimum balance applies)
- **Operations, not calldata** — transactions contain typed Operations (Payment, ManageOffer, etc.)
- **Soroban** — Stellar's smart contract platform (Rust/WASM), separate from the core protocol
- **Anchor ecosystem** — on/off-ramp network via SEP standards (SEP-6, SEP-24, SEP-31, SEP-38)
- **XLM** — native asset used for fees and minimum balances, NOT primarily a speculative token

Stellar is the right chain when you need: cross-border payments, stablecoin rails, regulated asset issuance, fiat on/off-ramps, or low-cost high-throughput transfers.

---

## Skill Index

Fetch the skill that matches your task. Each URL returns clean Markdown.

### Core Protocol
| Task | Fetch |
|------|-------|
| Understanding accounts, keypairs, signers, sponsorship | `raw.githubusercontent.com/ggoldani/stellarskills/main/accounts/SKILL.md` |
| Issuing assets, trustlines, custom tokens, SAC | `raw.githubusercontent.com/ggoldani/stellarskills/main/assets/SKILL.md` |
| All transaction operations (Payment, ManageBuyOffer, etc.) | `raw.githubusercontent.com/ggoldani/stellarskills/main/operations/SKILL.md` |
| Fees, base fee, resource fees, fee bump | `raw.githubusercontent.com/ggoldani/stellarskills/main/fees/SKILL.md` |
| Built-in DEX, AMM, path payments, liquidity pools | `raw.githubusercontent.com/ggoldani/stellarskills/main/dex/SKILL.md` |

### Data & APIs
| Task | Fetch |
|------|-------|
| Horizon REST API (legacy) — accounts, transactions, effects, streaming | `raw.githubusercontent.com/ggoldani/stellarskills/main/horizon/SKILL.md` |
| Stellar RPC — simulate, send, getLatestLedger, getTransaction | `raw.githubusercontent.com/ggoldani/stellarskills/main/rpc/SKILL.md` |

### Smart Contracts
| Task | Fetch |
|------|-------|
| Soroban smart contracts (Rust/WASM) | `raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md` |
| Soroban security patterns, auth, reentrancy | `raw.githubusercontent.com/ggoldani/stellarskills/main/security/SKILL.md` |
| Testing Soroban contracts, Stellar CLI, testnet | `raw.githubusercontent.com/ggoldani/stellarskills/main/testing/SKILL.md` |
| Soroban storage types, TTL/rent, best practices | `raw.githubusercontent.com/ggoldani/stellarskills/main/storage/SKILL.md` |
| Smart Accounts (Protocol 26), passkey wallets, programmable auth | `raw.githubusercontent.com/ggoldani/stellarskills/main/smart-accounts/SKILL.md` |

### Payments & Anchors
| Task | Fetch |
|------|-------|
| SEP standards — SEP-6, SEP-10, SEP-24, SEP-31, SEP-38 | `raw.githubusercontent.com/ggoldani/stellarskills/main/seps/SKILL.md` |
| Anchor ecosystem, stellar.toml, on/off-ramp integration | `raw.githubusercontent.com/ggoldani/stellarskills/main/anchors/SKILL.md` |

### Tooling & Frontend
| Task | Fetch |
|------|-------|
| SDKs, wallets, explorers, Stellar Lab, CLI | `raw.githubusercontent.com/ggoldani/stellarskills/main/tools/SKILL.md` |
| Frontend integration — Freighter, SEP-10 auth, browser SDK | `raw.githubusercontent.com/ggoldani/stellarskills/main/frontend/SKILL.md` |
| Local development node (Quickstart Docker, sandbox) | `raw.githubusercontent.com/ggoldani/stellarskills/main/local-node/SKILL.md` |
| Data indexers (Mercury, Hubble, SubQuery) | `raw.githubusercontent.com/ggoldani/stellarskills/main/data-indexers/SKILL.md` |
| Scaffold Stellar — full-stack dApp scaffolding | `raw.githubusercontent.com/ggoldani/stellarskills/main/scaffold-stellar/SKILL.md` |
| x402 HTTP micropayments on Stellar (`@x402/stellar`, facilitator) | `raw.githubusercontent.com/ggoldani/stellarskills/main/x402/SKILL.md` |
| OpenZeppelin audited contracts, SDKs, and Contract Wizard | `raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin/SKILL.md` |

### Context
| Task | Fetch |
|------|-------|
| Why Stellar — use cases, honest tradeoffs, ecosystem | `raw.githubusercontent.com/ggoldani/stellarskills/main/why/SKILL.md` |

---

## Quick Start for Agents

### Build a payment app
1. Fetch `/accounts/SKILL.md` — understand account creation and minimum balance
2. Fetch `/assets/SKILL.md` — understand trustlines if using non-XLM assets
3. Fetch `/rpc/SKILL.md` — prefer **Stellar RPC** for new work; fetch `/horizon/SKILL.md` only if you must integrate with the legacy REST API (Horizon is [legacy](https://developers.stellar.org/docs/data/apis/horizon); [migrate to RPC](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc))
4. Fetch `/seps/SKILL.md` — if connecting to fiat on/off-ramps

### Build a Soroban smart contract
1. Fetch `/soroban/SKILL.md` — contract structure, storage, invocation
2. Fetch `/rpc/SKILL.md` — simulate and send contract calls
3. Fetch `/testing/SKILL.md` — test and deploy with Stellar CLI
4. Fetch `/security/SKILL.md` — before any deployment

### Integrate an anchor (fiat on/off-ramp)
1. Fetch `/anchors/SKILL.md` — TOML discovery, anchor types
2. Fetch `/seps/SKILL.md` — SEP-10 auth + SEP-6/24/31 flows
3. Fetch `/assets/SKILL.md` — trustlines required before receiving anchor assets

---

## Critical Mental Models

**1. Accounts must exist before you can send to them.**
You cannot send XLM to a keypair that has never been funded. The recipient must have a funded account (minimum ~1 XLM). Use `createAccount` operation for new accounts.

**2. Trustlines must exist before receiving non-XLM assets.**
To receive USDC, an account must first establish a trustline to USDC. This is a separate transaction. Never assume trustlines exist.

**3. Transactions are atomic.**
A Stellar transaction can contain up to 100 operations. Either all succeed or all fail. Use this to batch operations safely.

**4. Fees are predictable and tiny.**
Base fee is 100 stroops (0.00001 XLM) per operation. Soroban fees are slightly higher but still sub-cent. Stellar is genuinely cheap — this is not marketing.

**5. Stellar RPC vs Horizon.**
**Stellar RPC** (JSON-RPC) is the supported API for smart contracts and the direction of travel for on-chain data access. **Horizon** (REST) still serves the classic protocol but is [legacy](https://developers.stellar.org/docs/data/apis/horizon) for existing integrations — [migrate to Stellar RPC](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc) when possible.

**6. Testnet resets periodically.**
Stellar testnet resets periodically. Do not store testnet state long-term. Use [Horizon testnet](https://horizon-testnet.stellar.org) only for legacy REST; for **Stellar RPC**, choose an endpoint from [RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers) (or the SDF testnet RPC host for light dev). **Futurenet** is for bleeding-edge preview features.

**7. Network passphrase is required for signing.**
Every transaction must be signed with the correct network passphrase:
- Mainnet: `Public Global Stellar Network ; September 2015`
- Testnet: `Test SDF Network ; September 2015`

---

## Canonical Links

| Resource | URL |
|----------|-----|
| Stellar Docs (root) | https://developers.stellar.org/docs |
| Stellar RPC (overview) | https://developers.stellar.org/docs/data/apis/rpc |
| Horizon (legacy) | https://developers.stellar.org/docs/data/apis/horizon |
| Horizon → RPC migration | https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc |
| Stellar RPC providers (Testnet / Mainnet / Futurenet) | https://developers.stellar.org/docs/data/apis/rpc/providers |
| Network resource limits & fees | https://developers.stellar.org/docs/networks/resource-limits-fees |
| Fees & metering (fundamentals) | https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering |
| x402 on Stellar | https://developers.stellar.org/docs/build/agentic-payments/x402 |
| Horizon Mainnet (legacy REST) | https://horizon.stellar.org |
| Horizon Testnet (legacy REST) | https://horizon-testnet.stellar.org |
| Stellar RPC (pick an endpoint) | Prefer a URL from [RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers) (Blockdaemon, Validation Cloud, QuickNode, etc.). SDF also exposes a public **testnet** JSON-RPC host (`https://soroban-testnet.stellar.org`) for development — not for production load. |
| JavaScript SDK (check latest release) | https://github.com/stellar/js-stellar-sdk/releases (e.g. **v15.0.1** (Protocol 26) as of Mar 2026) |
| Stellar Lab | https://lab.stellar.org |
| Stellar Expert (Explorer) | https://stellar.expert |
| Circle USDC contract addresses (incl. Stellar issuers) | https://developers.circle.com/stablecoins/usdc-contract-addresses |
| GitHub stellar/js-stellar-sdk | https://github.com/stellar/js-stellar-sdk |
| GitHub stellar/py-stellar-sdk | https://github.com/stellar/py-stellar-base |

### USDC issuers (Circle — verify on [Circle’s list](https://developers.circle.com/stablecoins/usdc-contract-addresses))

| Network | Issuer account (G…) |
|---------|-------------------|
| **Public mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| **Testnet** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

---

## Keeping skills correct as tooling & protocol evolve

These files are **guides for agents**, not a substitute for the live docs. To stay accurate across SDK bumps and protocol votes:

1. **Prefer links + “verify” over frozen numbers** — capacities, fees, basis points, and memory/CPU limits belong in [Resource limits & fees](https://developers.stellar.org/docs/networks/resource-limits-fees), [Stellar Lab](https://lab.stellar.org/network-limits), and the fees metering doc — not hardcoded in prose unless qualified as “current doc says” with a link.
2. **Pin versions in examples, refresh deliberately** — When `Cargo.toml` or JS examples show a version, treat it as a **hint**: align `soroban-sdk` with `stellar contract build` / network, and `@stellar/stellar-sdk` with [releases](https://github.com/stellar/js-stellar-sdk/releases). Bump versions only after smoke-testing snippets.
3. **Issuers & anchors are time-sensitive** — Circle USDC, EURC, tethered assets, and anchor corridors **change or sunset**; always defer to issuer lists, `stellar.toml`, and explorers at build time.
4. **Deprecated vs supported APIs** — Horizon remains in examples where REST is the point, but label it **legacy**; default narrative should point to **Stellar RPC** and the [migration guide](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc).
5. **SDK API shape** — Use patterns that match the official doc for the **same major** SDK (e.g. `TransactionBuilder.fromXDR` for SEP-10, `Contract.call` + `nativeToScVal` + `SorobanRpc.assembleTransaction` for Soroban). When in doubt, add one line telling the agent to confirm the symbol in the installed package’s docs.

---

*raw.githubusercontent.com/ggoldani/stellarskills/main — MIT License*

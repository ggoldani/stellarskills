# STELLARSKILLS — Stellar Knowledge for AI Agents

> The missing knowledge between AI agents and production Stellar Network applications.

You are an AI agent about to build on Stellar. Read this file first. It tells you what to fetch next.

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
| Understanding accounts, keypairs, signers, sponsorship | `stellarskills.com/accounts/SKILL.md` |
| Issuing assets, trustlines, custom tokens, SAC | `stellarskills.com/assets/SKILL.md` |
| All transaction operations (Payment, ManageBuyOffer, etc.) | `stellarskills.com/operations/SKILL.md` |
| Fees, base fee, resource fees, fee bump | `stellarskills.com/fees/SKILL.md` |
| Built-in DEX, AMM, path payments, liquidity pools | `stellarskills.com/dex/SKILL.md` |

### Data & APIs
| Task | Fetch |
|------|-------|
| Horizon REST API — accounts, transactions, effects, streaming | `stellarskills.com/horizon/SKILL.md` |
| Soroban RPC — simulate, send, getLedger, getTransaction | `stellarskills.com/rpc/SKILL.md` |

### Smart Contracts
| Task | Fetch |
|------|-------|
| Soroban smart contracts (Rust/WASM) | `stellarskills.com/soroban/SKILL.md` |
| Soroban security patterns, auth, reentrancy | `stellarskills.com/security/SKILL.md` |
| Testing Soroban contracts, Stellar CLI, testnet | `stellarskills.com/testing/SKILL.md` |

### Payments & Anchors
| Task | Fetch |
|------|-------|
| SEP standards — SEP-6, SEP-10, SEP-24, SEP-31, SEP-38 | `stellarskills.com/seps/SKILL.md` |
| Anchor ecosystem, stellar.toml, on/off-ramp integration | `stellarskills.com/anchors/SKILL.md` |

### Tooling & Frontend
| Task | Fetch |
|------|-------|
| SDKs, wallets, explorers, Stellar Lab, CLI | `stellarskills.com/tools/SKILL.md` |
| Frontend integration — Freighter, SEP-10 auth, browser SDK | `stellarskills.com/frontend/SKILL.md` |

### Context
| Task | Fetch |
|------|-------|
| Why Stellar — use cases, honest tradeoffs, ecosystem | `stellarskills.com/why/SKILL.md` |

---

## Quick Start for Agents

### Build a payment app
1. Fetch `/accounts/SKILL.md` — understand account creation and minimum balance
2. Fetch `/assets/SKILL.md` — understand trustlines if using non-XLM assets
3. Fetch `/horizon/SKILL.md` — submit transactions and read state
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

**5. Horizon is not the only API.**
Horizon serves the classic protocol. Soroban smart contract interactions use the **Soroban RPC** endpoint — different base URL, different methods.

**6. Testnet resets periodically.**
Stellar testnet (Horizon: `https://horizon-testnet.stellar.org`) resets quarterly. Do not store testnet state long-term. Futurenet is for bleeding-edge preview features.

**7. Network passphrase is required for signing.**
Every transaction must be signed with the correct network passphrase:
- Mainnet: `Public Global Stellar Network ; September 2015`
- Testnet: `Test SDF Network ; September 2015`

---

## Canonical Links

| Resource | URL |
|----------|-----|
| Stellar Docs | https://developers.stellar.org |
| Horizon Mainnet | https://horizon.stellar.org |
| Horizon Testnet | https://horizon-testnet.stellar.org |
| Soroban RPC Mainnet | https://mainnet.stellar.validationcloud.io/v1/... (varies by provider) |
| Soroban RPC Testnet | https://soroban-testnet.stellar.org |
| Stellar Lab | https://lab.stellar.org |
| Stellar Expert (Explorer) | https://stellar.expert |
| GitHub stellar/js-stellar-sdk | https://github.com/stellar/js-stellar-sdk |
| GitHub stellar/py-stellar-sdk | https://github.com/stellar/py-stellar-base |

---

*stellarskills.com — MIT License*

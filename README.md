# STELLARSKILLS 🚀

> High-signal, noise-free Stellar Network knowledge engineered specifically for AI agents. Fetch any skill URL and instantly equip your agent to build production-ready applications on Stellar.

**StellarSkills Repository** • MIT License

---

## 🤖 The Problem

AI agents (like Claude, ChatGPT, Cursor, or Copilot) often hallucinate when asked to build on Stellar. They mix up classic Stellar protocol with EVM concepts, invent non-existent RPC methods, or struggle with the nuances of Soroban smart contracts.

Traditional documentation is built for humans: it has sidebars, infinite scrolling, navigation menus, and conversational fluff. When an agent reads it via a web scraper, it gets confused by the noise.

## 💡 The Solution

**Stellarskills** provides pure, unadulterated Markdown.

Every skill is a single `.md` file. No HTML, no sidebars, no fluff. Just the facts, the code, the architectural mental models, and the common errors.

---

## ⚡ Usage

Give any AI agent a skill URL in your prompt. The agent will fetch the raw Markdown, ingest the context, and instantly know how to build.

**Prompt example:**
```text
Read https://raw.githubusercontent.com/ggoldani/stellarskills/main/SKILL.md to understand the ecosystem, then read https://raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md and write a smart contract that acts as a decentralized autonomous organization.
```

**cURL it yourself:**
```bash
curl -s https://raw.githubusercontent.com/ggoldani/stellarskills/main/SKILL.md
curl -s https://raw.githubusercontent.com/ggoldani/stellarskills/main/accounts/SKILL.md
curl -s https://raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md
```

**Use the CLI:**
The `stellarskills` CLI lets you quickly find, read, or grab the URL for any skill directly from your terminal.

```bash
# List all available skills
npx stellarskills list

# Print the raw markdown content of a skill
npx stellarskills get soroban

# Pipe it straight into a prompt file
npx stellarskills get soroban > prompt.txt

# Get just the raw GitHub URL
npx stellarskills url accounts

# Combine multiple skills into a single prompt context
npx stellarskills combine accounts soroban security > prompt.txt

# Find which domain contains a specific concept
npx stellarskills search "trustline"

# Copy raw markdown to your system clipboard (ready to paste into ChatGPT/Claude)
npx stellarskills copy soroban security

# Instantly embed knowledge into your IDE agent (.cursorrules, .clinerules, .windsurfrules)
npx stellarskills rules cursor accounts
npx stellarskills rules cline dex assets

# Output a full Markdown index so an AI agent can self-discover what to fetch next
npx stellarskills index

# Diagnose your environment (Stellar CLI, Rust, wasm32 target, Node) to prevent agent hallucinations
npx stellarskills doctor

# Generate the ultimate System Prompt for ChatGPT/Claude containing expert rules + knowledge
npx stellarskills system soroban dex --instruction "Write an AMM pool contract" > prompt.txt
```

Works seamlessly in Cursor, Copilot, Cline, Devin, or any agentic framework that can resolve HTTP URLs.

---

## 🔌 Agent Marketplace Plugins

Stellarskills is natively structured to be installed as a dynamic skill in various AI agent ecosystems.

**For Claude Code:**
Teach your Claude Code agent to use the Stellarskills CLI automatically by installing our repository plugin:
```bash
claude plugin install https://github.com/ggoldani/stellarskills
```

**For OpenClaw / ClawHub:**
Every skill directory in this repository is a valid, independently installable AgentSkill. You can install the entire knowledge base into your OpenClaw agent by running:
```bash
clawhub install stellarskills
```
*(Or install granular skills: `clawhub install stellarskills-soroban`)*

---

## 📚 The Skill Index

| Skill Domain | URL | Description |
|--------------|-----|-------------|
| **Root Index** | [`/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/SKILL.md) | The missing knowledge between AI agents and production Stellar Network applications. |
| **Ingest SDK** | [`/ingest-sdk/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/ingest-sdk/SKILL.md) | Building network data ingestion pipelines on Stellar using go-stellar-sdk. |
| **ZK Proofs** | [`/zk-proofs/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/zk-proofs/SKILL.md) | Zero-Knowledge proofs on Stellar, including BN254 host functions, Poseidon hashing, and Privacy Pools. |
| **Accounts** | [`/accounts/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/accounts/SKILL.md) | Keypairs, account creation, signers, multisig, minimum balance, sponsorship, muxed accounts. |
| **Anchors** | [`/anchors/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/anchors/SKILL.md) | Fiat on/off-ramps on Stellar. Integration flows, stellar.toml, and the anchor ecosystem. |
| **Assets** | [`/assets/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/assets/SKILL.md) | Custom asset issuance, trustlines, asset types, Stellar Asset Contract (SAC), USDC and stablecoins. |
| **DEX & AMM** | [`/dex/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/dex/SKILL.md) | Stellar's built-in order book, Automated Market Makers (AMM), Liquidity Pools, and Path Payments. |
| **Fees** | [`/fees/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/fees/SKILL.md) | Stellar transaction fees, base fee, surge pricing, resource fees (Soroban), and fee bumps. |
| **Frontend** | [`/frontend/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/frontend/SKILL.md) | Connecting web apps to Stellar. Stellar Wallets Kit, Freighter API, signing Soroban transactions, and secure SEP-10 Web3 Auth. |
| **Horizon API** | [`/horizon/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/horizon/SKILL.md) | Legacy REST API — prefer Stellar RPC for new integrations. For smart contracts use Stellar RPC — see /rpc/SKILL.md. |
| **OpenZeppelin** | [`/openzeppelin/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin/SKILL.md) | OpenZeppelin's audited smart contracts, Contract Wizard, and developer toolings for Stellar's Soroban (Rust) environment. |
| **Operations** | [`/operations/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/operations/SKILL.md) | Reference for all Stellar transaction operations. Payments, account management, offers, trustlines. |
| **Stellar RPC** | [`/rpc/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/rpc/SKILL.md) | JSON-RPC for Soroban smart contracts (formerly “Soroban RPC”). Simulation, invocation, ledger state, events. |
| **Security** | [`/security/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/security/SKILL.md) | Critical security patterns, common vulnerabilities, and best practices for writing Soroban smart contracts in Rust. |
| **SEPs** | [`/seps/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/seps/SKILL.md) | SEP-1 (stellar.toml), SEP-6, SEP-10 (auth), SEP-12 (KYC), SEP-24, SEP-31, SEP-38 — the interoperability standards that power Stellar's payment rails. |
| **Soroban** | [`/soroban/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md) | Stellar's smart contract platform. Rust/WASM contracts, constructors, storage types, auth, invocation, resource limits. |
| **MPP** | [`/mpp/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/mpp/SKILL.md) | Machine Payments Protocol on Stellar. HTTP 402 charge and session intents for AI agents using Soroban token transfers. |
| **Passkeys** | [`/passkeys/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/passkeys/SKILL.md) | Passkeys (WebAuthn) and smart wallets on Stellar using secp256r1 keys, passkey-kit, and Launchtube relay. |
| **Storage** | [`/storage/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/storage/SKILL.md) | How to manage state in Soroban. Understanding Persistent, Temporary, and Instance storage, TTL/Rent, and migrating from Solidity mappings. |
| **State Archival** | [`/state-archival/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/state-archival/SKILL.md) | Soroban state archival and TTL management. Storage expiration, restoration, and operational patterns for contract state. |
| **Testing** | [`/testing/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/testing/SKILL.md) | How to test Soroban smart contracts using Rust's built-in testing framework and the Stellar CLI. |
| **Tools** | [`/tools/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/tools/SKILL.md) | The essential tools, SDKs, wallets, and explorers for building on Stellar. |
| **Why Stellar?** | [`/why/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/why/SKILL.md) | A sober, honest assessment of what Stellar is for, its tradeoffs, and why you would choose it over EVM or Solana. |
| **x402** | [`/x402/SKILL.md`](https://raw.githubusercontent.com/ggoldani/stellarskills/main/x402/SKILL.md) | HTTP 402 micropayments on Stellar via `@x402/stellar`, auth entries, facilitator (Built on Stellar). Not the same as EVM/Base x402. |

---

## 🤝 Contributing

We want this to be the single source of truth for AI agents building on Stellar. Is an agent consistently failing at a specific task? Did a Stellar RPC endpoint or doc URL change? Open a PR!

### Automated Publishing
This repository uses GitHub Actions to automatically publish updates to NPM.
When a pull request modifying `package.json` (bumping the version) and `SKILL.md` files is merged into the `main` branch, the `Publish to NPM` workflow will seamlessly deploy the latest version of the CLI.

**Note for Maintainers:** Ensure your repository secrets contain `NPM_TOKEN` (an automation token from your npmjs.com account) for the CI/CD pipeline to function.

### The Golden Rules of a Skill File:
1. **No fluff.** Agents don't need marketing copy.
2. **Dense & Factual.** Prioritize code snippets, architectural rules, and exact endpoint structures.
3. **Current & Runnable.** Ensure JavaScript and Rust snippets compile against the latest SDK versions (`@stellar/stellar-sdk` and `soroban-sdk`).
4. **Verified by Official Docs.** Every new feature, endpoint, or SDK method added to a skill must be explicitly documented in official sources (e.g., `developers.stellar.org`, `soroban-sdk` docs, or official SDF repositories). Do not add unreleased alpha features or unverified announcements to avoid agent hallucinations.
5. **Isolate Context.** Each skill lives in its own folder (e.g., `/dex/SKILL.md`). Assume the agent only reads that specific file.
6. **Highlight Errors.** Always include a "Common Errors" table mapping error codes (`tx_bad_seq`, `op_underfunded`) to their fixes. Agents use these to self-heal when transactions fail.

---

## 📄 License

MIT © [StellarSkills](https://github.com/ggoldani/stellarskills)

# STELLARSKILLS 🚀

> High-signal, noise-free Stellar Network knowledge engineered specifically for AI agents. Fetch any skill URL and instantly equip your agent to build production-ready applications on Stellar.

**stellarskills.vercel.app** • MIT License

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
Read https://stellarskills.vercel.app/SKILL.md to understand the ecosystem, then read https://stellarskills.vercel.app/soroban/SKILL.md and write a smart contract that acts as a decentralized autonomous organization.
```

**cURL it yourself:**
```bash
curl -s https://stellarskills.vercel.app/SKILL.md
curl -s https://stellarskills.vercel.app/accounts/SKILL.md
curl -s https://stellarskills.vercel.app/soroban/SKILL.md
```

Works seamlessly in Cursor, Copilot, Cline, Devin, or any agentic framework that can resolve HTTP URLs.

---

## 📚 The Skill Index

| Skill Domain | URL | Description |
|--------------|-----|-------------|
| **Root Index** | `stellarskills.vercel.app/SKILL.md` | Start here. The mental models and full index. |
| **Accounts** | `stellarskills.vercel.app/accounts/SKILL.md` | Keypairs, minimum balances, multisig, sponsorship. |
| **Assets** | `stellarskills.vercel.app/assets/SKILL.md` | Custom tokens, trustlines, SAC, USDC. |
| **Soroban** | `stellarskills.vercel.app/soroban/SKILL.md` | Smart contracts (Rust/WASM), storage, auth. |
| **SEPs** | `stellarskills.vercel.app/seps/SKILL.md` | Interoperability standards (SEP-10, 24, 31, etc.). |
| **Horizon API** | `stellarskills.vercel.app/horizon/SKILL.md` | REST API for the classic protocol. |
| **Soroban RPC** | `stellarskills.vercel.app/rpc/SKILL.md` | JSON-RPC for smart contract simulation/invocation. |
| **Fees** | `stellarskills.vercel.app/fees/SKILL.md` | Base fees, resource limits, and fee bumps. |
| **DEX & AMM** | `stellarskills.vercel.app/dex/SKILL.md` | Built-in order books and liquidity pools. |
| **Operations** | `stellarskills.vercel.app/operations/SKILL.md` | Reference for all transaction operations. |
| **Anchors** | `stellarskills.vercel.app/anchors/SKILL.md` | Fiat on/off-ramps and integration flows. |
| **Tools** | `stellarskills.vercel.app/tools/SKILL.md` | SDKs, CLI, wallets, and explorers. |
| **Security** | `stellarskills.vercel.app/security/SKILL.md` | Soroban security patterns and reentrancy. |
| **Testing** | `stellarskills.vercel.app/testing/SKILL.md` | Rust unit testing and testnet deployment. |
| **Frontend** | `stellarskills.vercel.app/frontend/SKILL.md` | Connecting Freighter and WalletConnect. |
| **OpenZeppelin** | `stellarskills.vercel.app/openzeppelin/SKILL.md` | Audited contracts, SDKs, and Contract Wizard. |
| **Why Stellar?** | `stellarskills.vercel.app/why/SKILL.md` | Architectural tradeoffs vs EVM/Solana. |

---

## 🤝 Contributing

We want this to be the single source of truth for AI agents building on Stellar. Is an agent consistently failing at a specific task? Did a Soroban RPC endpoint change? Open a PR!

### The Golden Rules of a Skill File:
1. **No fluff.** Agents don't need marketing copy.
2. **Dense & Factual.** Prioritize code snippets, architectural rules, and exact endpoint structures.
3. **Current & Runnable.** Ensure JavaScript and Rust snippets compile against the latest SDK versions (`@stellar/stellar-sdk` and `soroban-sdk`).
4. **Isolate Context.** Each skill lives in its own folder (e.g., `/dex/SKILL.md`). Assume the agent only reads that specific file.
5. **Highlight Errors.** Always include a "Common Errors" table mapping error codes (`tx_bad_seq`, `op_underfunded`) to their fixes. Agents use these to self-heal when transactions fail.

---

## 📄 License

MIT © [stellarskills.vercel.app](https://stellarskills.vercel.app)
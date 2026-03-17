# STELLARSKILLS 🚀

> High-signal, noise-free Stellar Network knowledge engineered specifically for AI agents. Fetch any skill URL and instantly equip your agent to build production-ready applications on Stellar.

**stellarskills.com** • MIT License

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
Read https://stellarskills.com/SKILL.md to understand the ecosystem, then read https://stellarskills.com/soroban/SKILL.md and write a smart contract that acts as a decentralized autonomous organization.
```

**cURL it yourself:**
```bash
curl -s https://stellarskills.com/SKILL.md
curl -s https://stellarskills.com/accounts/SKILL.md
curl -s https://stellarskills.com/soroban/SKILL.md
```

Works seamlessly in Cursor, Copilot, Cline, Devin, or any agentic framework that can resolve HTTP URLs.

---

## 📚 The Skill Index

| Skill Domain | URL | Description |
|--------------|-----|-------------|
| **Root Index** | `stellarskills.com/SKILL.md` | Start here. The mental models and full index. |
| **Accounts** | `stellarskills.com/accounts/SKILL.md` | Keypairs, minimum balances, multisig, sponsorship. |
| **Assets** | `stellarskills.com/assets/SKILL.md` | Custom tokens, trustlines, SAC, USDC. |
| **Soroban** | `stellarskills.com/soroban/SKILL.md` | Smart contracts (Rust/WASM), storage, auth. |
| **SEPs** | `stellarskills.com/seps/SKILL.md` | Interoperability standards (SEP-10, 24, 31, etc.). |
| **Horizon API** | `stellarskills.com/horizon/SKILL.md` | REST API for the classic protocol. |
| **Soroban RPC** | `stellarskills.com/rpc/SKILL.md` | JSON-RPC for smart contract simulation/invocation. |
| **Fees** | `stellarskills.com/fees/SKILL.md` | Base fees, resource limits, and fee bumps. |
| **DEX & AMM** | `stellarskills.com/dex/SKILL.md` | Built-in order books and liquidity pools. |
| **Operations** | `stellarskills.com/operations/SKILL.md` | Reference for all transaction operations. |
| **Anchors** | `stellarskills.com/anchors/SKILL.md` | Fiat on/off-ramps and integration flows. |
| **Tools** | `stellarskills.com/tools/SKILL.md` | SDKs, CLI, wallets, and explorers. |
| **Security** | `stellarskills.com/security/SKILL.md` | Soroban security patterns and reentrancy. |
| **Testing** | `stellarskills.com/testing/SKILL.md` | Rust unit testing and testnet deployment. |
| **Frontend** | `stellarskills.com/frontend/SKILL.md` | Connecting Freighter and WalletConnect. |
| **Why Stellar?** | `stellarskills.com/why/SKILL.md` | Architectural tradeoffs vs EVM/Solana. |

---

## 🏗 Architecture & Deployment

This repository is designed to be deployed on Vercel as a brutally simple static site. Each `SKILL.md` file is served directly to the requester.

The `vercel.json` ensures that every request receives `text/plain` with open CORS, allowing seamless ingestion by browser-based AI interfaces.

### vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
      ]
    }
  ]
}
```

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

MIT © [stellarskills.com](https://stellarskills.com)

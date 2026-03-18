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
```

Works seamlessly in Cursor, Copilot, Cline, Devin, or any agentic framework that can resolve HTTP URLs.

---

## 📚 The Skill Index

| Skill Domain | URL | Description |
|--------------|-----|-------------|
| **Root Index** | `raw.githubusercontent.com/ggoldani/stellarskills/main/SKILL.md` | Start here. The mental models and full index. |
| **Accounts** | `raw.githubusercontent.com/ggoldani/stellarskills/main/accounts/SKILL.md` | Keypairs, minimum balances, multisig, sponsorship. |
| **Assets** | `raw.githubusercontent.com/ggoldani/stellarskills/main/assets/SKILL.md` | Custom tokens, trustlines, SAC, USDC. |
| **Soroban** | `raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md` | Smart contracts (Rust/WASM), storage, auth. |
| **SEPs** | `raw.githubusercontent.com/ggoldani/stellarskills/main/seps/SKILL.md` | Interoperability standards (SEP-10, 24, 31, etc.). |
| **Horizon API** | `raw.githubusercontent.com/ggoldani/stellarskills/main/horizon/SKILL.md` | REST API for the classic protocol. |
| **Soroban RPC** | `raw.githubusercontent.com/ggoldani/stellarskills/main/rpc/SKILL.md` | JSON-RPC for smart contract simulation/invocation. |
| **Fees** | `raw.githubusercontent.com/ggoldani/stellarskills/main/fees/SKILL.md` | Base fees, resource limits, and fee bumps. |
| **DEX & AMM** | `raw.githubusercontent.com/ggoldani/stellarskills/main/dex/SKILL.md` | Built-in order books and liquidity pools. |
| **Operations** | `raw.githubusercontent.com/ggoldani/stellarskills/main/operations/SKILL.md` | Reference for all transaction operations. |
| **Anchors** | `raw.githubusercontent.com/ggoldani/stellarskills/main/anchors/SKILL.md` | Fiat on/off-ramps and integration flows. |
| **Tools** | `raw.githubusercontent.com/ggoldani/stellarskills/main/tools/SKILL.md` | SDKs, CLI, wallets, and explorers. |
| **Security** | `raw.githubusercontent.com/ggoldani/stellarskills/main/security/SKILL.md` | Soroban security patterns and reentrancy. |
| **Testing** | `raw.githubusercontent.com/ggoldani/stellarskills/main/testing/SKILL.md` | Rust unit testing and testnet deployment. |
| **Frontend** | `raw.githubusercontent.com/ggoldani/stellarskills/main/frontend/SKILL.md` | Connecting Freighter and WalletConnect. |
| **OpenZeppelin** | `raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin/SKILL.md` | Audited contracts, SDKs, and Contract Wizard. |
| **Why Stellar?** | `raw.githubusercontent.com/ggoldani/stellarskills/main/why/SKILL.md` | Architectural tradeoffs vs EVM/Solana. |

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

MIT © [StellarSkills](https://github.com/ggoldani/stellarskills)

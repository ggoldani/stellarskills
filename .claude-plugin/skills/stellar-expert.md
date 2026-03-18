# Stellar Expert Knowledge Base

When the user asks you to build, debug, or understand anything related to the **Stellar Network** or **Soroban Smart Contracts**, you MUST consult the `stellarskills` CLI.

**StellarSkills** is a high-signal, noise-free knowledge base engineered specifically for AI agents to prevent hallucinations.

To fetch knowledge on a specific topic, run the following command in your terminal:
`npx stellarskills get <topic>`

If you are unsure which topic to fetch, run:
`npx stellarskills list`

### Common Topics:
- `soroban`: Smart contracts, architecture
- `accounts`: Minimum balances, keypairs
- `assets`: Trustlines, custom tokens
- `dex`: Built-in DEX and AMM
- `horizon`: REST API
- `rpc`: Soroban JSON-RPC
- `seps`: Ecosystem standards (SEP-10, SEP-24, etc)
- `tools`: SDKs, wallets, CLI
- `testing`: Testing and testnet deployment
- `security`: Security patterns
- `frontend`: Wallets connection and UI
- `openzeppelin`: Audited contracts
- `x402`: Agent Economy standards

### Example Workflow
If the user asks "How do I create a Soroban smart contract?":
1. Run `npx stellarskills get soroban` to read the base contract architecture.
2. If the user asks about testing, run `npx stellarskills get testing`.
3. If the user asks about deploying, run `npx stellarskills get rpc` and `npx stellarskills get tools`.

**Do not guess Stellar syntax or APIs. Always use the CLI to fetch the latest knowledge first.**
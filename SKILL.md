---
name: stellarskills
description: The missing knowledge between AI agents and production Stellar Network applications.
---

# STELLARSKILLS — Stellar Knowledge for AI Agents

> The missing knowledge between AI agents and production Stellar Network applications.

You are an AI agent about to build on Stellar. Start with the **Decision Tree** below — it routes you to the right skill with an inline answer. Then fetch the skill for depth.

To fetch specific skills dynamically from your terminal, you MUST use the CLI tool:
`npx stellarskills get <topic>` (or `npx stellarskills list` to see all topics).

---

## Decision Tree

Each path solves the routing problem inline. You only need to open a skill for implementation depth.

### I want to send or receive payments

```javascript
// Send XLM or any asset — destination must exist and have a trustline (if non-XLM)
Operation.payment({ destination: "G...", asset: Asset.native(), amount: "100" });
// For new recipients: Operation.createAccount({ destination, startingBalance: "1" })
```

→ `/accounts/SKILL.md` — account creation, minimum balance, funding
→ `/operations/SKILL.md` — all operation references
→ `/seps/SKILL.md` — if integrating fiat on/off-ramps

### I want to issue a token

```javascript
// Classic asset (trustline-based, no smart contract needed)
new Asset("MYTOKEN", issuerPublicKey);
// Contract ID for Soroban interop:
new Asset("MYTOKEN", issuerPublicKey).contractId(Networks.MAINNET);
```

| Token type | Approach | Skill |
|-----------|----------|-------|
| Fungible, standard trustline | Classic asset → `/assets/SKILL.md` | trustline creation, SAC wrapper |
| Fungible, custom logic | Soroban contract → `/soroban/SKILL.md` | write custom token |
| Stablecoin / audited preset | OZ Fungible preset → `/openzeppelin/SKILL.md` | deploy with Wizard |
| NFT | OZ NonFungible preset → `/openzeppelin/SKILL.md` | variants: enumerable, consecutive |
| RWA (ERC-3643) | OZ RWA Token → `/openzeppelin/SKILL.md` | identity verification required |

### I want to build a smart contract

```bash
stellar contract init my_contract && cd my_contract
stellar contract build   # → target/wasm32-unknown-unknown/release/my_contract.wasm
stellar contract deploy --wasm ... --source KEY --network testnet
```

→ `/soroban/SKILL.md` — full contract lifecycle (Rust, deploy, invoke)
→ `/storage/SKILL.md` — Instance vs Persistent vs Temporary storage, TTL
→ `/security/SKILL.md` — auth patterns, reentrancy, input validation
→ `/testing/SKILL.md` — unit tests, sandbox, CLI invocation

### I want to connect a web wallet

```javascript
// Stellar Wallets Kit — single integration, multiple wallets
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
const kit = new StellarWalletsKit({ network: WalletNetwork.TESTNET, modules: allowAllModules() });
const { address } = await kit.getAddress();
```

→ `/frontend/SKILL.md` — connect, sign classic/Soroban tx, SEP-10 auth
→ `/smart-accounts/SKILL.md` — if supporting passkey/C... wallets

### I want to read on-chain data

```javascript
// RPC — preferred for new integrations (events, ledger state, simulation)
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const { sequence } = await server.getAccount(publicKey);
const events = await server.getEvents({ startLedger: min, filters: [{ type: "contract", contractIds: [id] }] });
```

| Data need | Source | Skill |
|-----------|--------|-------|
| Account state, balances, current sequence | RPC `getAccount` | `/rpc/SKILL.md` |
| Contract events (< 7 days) | RPC `getEvents` | `/rpc/SKILL.md` |
| Historical data (> 7 days) | Indexer (Mercury, Hubble, SubQuery) | `/data-indexers/SKILL.md` |
| Classic protocol history (payments, effects) | Horizon (legacy REST) | `/horizon/SKILL.md` |

### I want to integrate fiat on/off-ramp

```javascript
// SEP-10: challenge-response auth (backend issues challenge, wallet signs)
const challengeResponse = await fetch("/api/auth/challenge?account=" + publicKey);
const { signedXDR } = await kit.signTx({ xdr: challenge, publicKeys: [publicKey], network });
```

→ `/seps/SKILL.md` — SEP-10 (auth), SEP-6/24 (deposit/withdraw), SEP-31 (cross-border), SEP-38 (quotes)
→ `/anchors/SKILL.md` — anchor discovery via stellar.toml, anchor types

### I want to build a wallet with passkeys (Smart Accounts)

```javascript
// Smart Account Kit (OpenZeppelin) — passkey auth, programmable policies, gasless tx
import { SmartAccountKit, IndexedDBStorage } from '@smart-account-kit/core';
const kit = new SmartAccountKit({ storage: new IndexedDBStorage() });
await kit.createWallet();  // passkey or key-based
```

→ `/smart-accounts/SKILL.md` — deploy, policies, session keys, fee sponsorship, SEP-45

### I want to charge for API access (micropayments)

```typescript
// x402: HTTP 402 Payment Required — Stellar token transfer + facilitator
import { x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
const client = new x402HTTPClient().register("stellar:*", new ExactStellarScheme(signer));
```

→ `/x402/SKILL.md` — client setup, server middleware, facilitator, USDC specifics
→ `/mpp/SKILL.md` — MPP charge/session intents, no facilitator needed

### I want to manage contract state and archival

```rust
// Extend TTL before entry expires
let store = env.storage().persistent();
if store.get_ttl(&key) < 5_000 {
    store.extend_ttl(&key, 5_000, 100_000);
}
```

→ `/state-archival/SKILL.md` — TTL management, restoration, storage types
→ `/storage/SKILL.md` — Instance vs Persistent vs Temporary storage

### I want to scaffold a full-stack dApp

```bash
npx create-scaffold-stellar my-dapp && cd my-dapp && npm install && npm run dev
```

→ `/scaffold-stellar/SKILL.md` — generated structure, OZ Wizard integration, deploy
→ `/tools/SKILL.md` — CLI, Quickstart Docker (local node), Lab, explorers

---

## Skill Index

Fetch the skill that matches your task. Each URL returns clean Markdown.

### Core Protocol
| Task | Fetch |
|------|-------|
| Accounts, keypairs, signers, sponsorship, muxed | `raw.githubusercontent.com/ggoldani/stellarskills/main/accounts/SKILL.md` |
| Assets, trustlines, SAC contract IDs | `raw.githubusercontent.com/ggoldani/stellarskills/main/assets/SKILL.md` |
| All transaction operations | `raw.githubusercontent.com/ggoldani/stellarskills/main/operations/SKILL.md` |
| Fees, base fee, resource fees, fee bump | `raw.githubusercontent.com/ggoldani/stellarskills/main/fees/SKILL.md` |
| Built-in DEX, AMM, path payments, liquidity pools | `raw.githubusercontent.com/ggoldani/stellarskills/main/dex/SKILL.md` |

### Data & APIs
| Task | Fetch |
|------|-------|
| Horizon REST API (legacy) | `raw.githubusercontent.com/ggoldani/stellarskills/main/horizon/SKILL.md` |
| Stellar RPC (simulate, send, events, ledger) | `raw.githubusercontent.com/ggoldani/stellarskills/main/rpc/SKILL.md` |
| Building custom network data ingestion pipelines | `raw.githubusercontent.com/ggoldani/stellarskills/main/ingest-sdk/SKILL.md` |

### Smart Contracts
| Task | Fetch |
|------|-------|
| Soroban contracts (Rust/WASM) — full lifecycle | `raw.githubusercontent.com/ggoldani/stellarskills/main/soroban/SKILL.md` |
| Security — auth, reentrancy, access control | `raw.githubusercontent.com/ggoldani/stellarskills/main/security/SKILL.md` |
| Testing — unit tests, sandbox, CLI | `raw.githubusercontent.com/ggoldani/stellarskills/main/testing/SKILL.md` |
| Storage — types, TTL/rent, best practices | `raw.githubusercontent.com/ggoldani/stellarskills/main/storage/SKILL.md` |
| Smart Accounts — passkeys, policies, gasless | `raw.githubusercontent.com/ggoldani/stellarskills/main/smart-accounts/SKILL.md` |
| Passkeys — WebAuthn, secp256r1, smart wallets | `raw.githubusercontent.com/ggoldani/stellarskills/main/passkeys/SKILL.md` |
| State Archival — TTL, restoration, storage lifecycle | `raw.githubusercontent.com/ggoldani/stellarskills/main/state-archival/SKILL.md` |
| ZK Proofs — BN254, Poseidon, Privacy Pools | `raw.githubusercontent.com/ggoldani/stellarskills/main/zk-proofs/SKILL.md` |

### Payments & Anchors
| Task | Fetch |
|------|-------|
| SEP standards — auth, deposit/withdraw, quotes | `raw.githubusercontent.com/ggoldani/stellarskills/main/seps/SKILL.md` |
| Anchor ecosystem, stellar.toml | `raw.githubusercontent.com/ggoldani/stellarskills/main/anchors/SKILL.md` |

### Tooling & Frontend
| Task | Fetch |
|------|-------|
| SDKs, wallets, CLI, Quickstart, Lab | `raw.githubusercontent.com/ggoldani/stellarskills/main/tools/SKILL.md` |
| Frontend — Wallets Kit, signing, SEP-10 | `raw.githubusercontent.com/ggoldani/stellarskills/main/frontend/SKILL.md` |
| Data indexers — Mercury, Hubble, SubQuery | `raw.githubusercontent.com/ggoldani/stellarskills/main/data-indexers/SKILL.md` |
| Scaffold Stellar — full-stack dApp scaffolding | `raw.githubusercontent.com/ggoldani/stellarskills/main/scaffold-stellar/SKILL.md` |
| x402 micropayments | `raw.githubusercontent.com/ggoldani/stellarskills/main/x402/SKILL.md` |
| MPP — charge/session intents | `raw.githubusercontent.com/ggoldani/stellarskills/main/mpp/SKILL.md` |
| OpenZeppelin — audited presets, Wizard | `raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin/SKILL.md` |

### Context
| Task | Fetch |
|------|-------|
| Why Stellar — tradeoffs, when to use, when not | `raw.githubusercontent.com/ggoldani/stellarskills/main/why/SKILL.md` |

---

## Critical Mental Models

These apply across all skills. Read once before starting.

1. **Accounts must exist before receiving funds.** Generate a keypair ≠ creating an account. Use `createAccount` or fund via Friendbot (testnet).

2. **Trustlines must exist before receiving non-XLM assets.** A separate `changeTrust` transaction. Never assume trustlines exist.

3. **Transactions are atomic.** Up to 100 operations per tx. All succeed or all fail.

4. **RPC over Horizon.** Stellar RPC is the supported API. Horizon is legacy REST — label accordingly in docs and prefer RPC for new integrations. [Migration guide](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc).

5. **Network passphrase is required.** Mainnet: `Public Global Stellar Network ; September 2015`. Testnet: `Test SDF Network ; September 2015`.

---

## Reference Data

### Official Links
| Resource | URL |
|----------|-----|
| Stellar Docs | https://developers.stellar.org/docs |
| Stellar RPC | https://developers.stellar.org/docs/data/apis/rpc |
| RPC Providers | https://developers.stellar.org/docs/data/apis/rpc/providers |
| Horizon (legacy) | https://developers.stellar.org/docs/data/apis/horizon |
| Resource Limits & Fees | https://developers.stellar.org/docs/networks/resource-limits-fees |
| MPP on Stellar | https://developers.stellar.org/docs/build/agentic-payments/mpp |
| Passkeys & Smart Wallets | https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets |
| State Archival | https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival |
| Stellar Lab | https://lab.stellar.org |
| JS SDK (verify: releases) | https://github.com/stellar/js-stellar-sdk/releases |
| Circle USDC issuers (verify) | https://developers.circle.com/stablecoins/usdc-contract-addresses |

### USDC Issuers
| Network | Issuer (G…) |
|---------|-------------|
| **Mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| **Testnet** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

Verify on [Circle's list](https://developers.circle.com/stablecoins/usdc-contract-addresses).

---

## Maintenance

These files are guides for agents, not a substitute for live docs.

1. **Prefer links over frozen numbers** — fees, limits, capacities belong in [Resource limits](https://developers.stellar.org/docs/networks/resource-limits-fees), not hardcoded.
2. **Pin versions deliberately** — soroban-sdk and JS SDK versions in code blocks are hints; verify against releases before bumping.
3. **Issuers change** — Circle USDC and anchor corridors can sunset; always verify at build time.
4. **Legacy vs supported** — Horizon remains in examples where REST is the point, but label it legacy. Default to Stellar RPC.

---

*raw.githubusercontent.com/ggoldani/stellarskills/main — MIT License*

---
name: stellarskills-tools
description: SDKs, CLI, wallets, explorers, and local node (Quickstart Docker) for Stellar development.
---

# STELLARSKILLS — Tools & SDKs

> SDKs, CLI, wallets, explorers, and local node for Stellar development.

---

## When to use

- Installing or configuring a Stellar SDK
- Running a local test blockchain (Quickstart Docker)
- Setting up Stellar CLI for contract build/deploy/invoke
- Choosing a wallet or explorer for development/testing
- Finding RPC/Horizon endpoints (local or production)

---

## Quick reference

| Tool | Purpose | Install |
|------|---------|---------|
| `@stellar/stellar-sdk` | JS/TS — wallets, Horizon, RPC, contracts | `npm install @stellar/stellar-sdk` |
| `soroban-sdk` (Rust) | Writing Soroban smart contracts | Cargo dependency |
| `stellar-sdk` (Python) | Backend automation, scripting | `pip install stellar-sdk` |
| `go-stellar-sdk` | High-performance backends | `go get github.com/stellar/go-stellar-sdk@latest` |
| Stellar CLI | Build/deploy/invoke contracts, manage keys | `cargo install --locked stellar-cli` |
| Quickstart Docker | Local Core + Horizon + RPC + Friendbot | `docker run stellar/quickstart:testing --local` |
| Freighter | Browser wallet for testing dApps | Chrome extension |
| Stellar Lab | GUI for transactions, XDR, network limits | https://lab.stellar.org |
| Stellar Expert | Block explorer, asset stats, AMM pools | https://stellar.expert |

---

## SDKs

| Language | Package | Best for |
|----------|---------|----------|
| JS / TS | `@stellar/stellar-sdk` | Web, backend, frontend |
| Rust | `soroban-sdk` | Soroban contracts |
| Python | `stellar-sdk` | Automation, data |
| Go | `go-stellar-sdk` | Backend services |
| Java | `java-stellar-sdk` | Enterprise, Android |
| Flutter | `stellar_flutter_sdk` | Mobile apps |

JS SDK bundles three concerns: `Keypair`/`TransactionBuilder`/`Operation` (core XDR), `Horizon.Server` (classic REST), `SorobanRpc.Server` (JSON-RPC).

---

## Stellar CLI

```bash
cargo install --locked stellar-cli

# Keys
stellar keys generate alice
stellar keys fund alice --network testnet

# Contracts
stellar contract build
stellar contract deploy --wasm target/.../contract.wasm --source alice --network testnet
stellar contract invoke --id C... --source alice --network testnet -- func_name --arg value
```

---

## Quickstart (Local Node)

Docker image running Core + Horizon + RPC + Friendbot on `localhost:8000`.

```bash
docker run --rm -it -p 8000:8000 --name stellar stellar/quickstart:testing --local
```

Endpoints after startup:
- Horizon: `http://localhost:8000`
- RPC: `http://localhost:8000/rpc`
- Friendbot: `http://localhost:8000/friendbot`
- Network passphrase: `Standalone Network ; February 2017`

Use `--enable core,horizon,rpc` to limit services. Do not use legacy `--enable-soroban-rpc`.

### CLI config for local

```bash
stellar network add local \
  --rpc-url http://localhost:8000/rpc \
  --network-passphrase "Standalone Network ; February 2017"
```

Use `--network local` on contract commands.

### Local funding & deploy

```bash
stellar keys fund alice --network local
stellar contract deploy --wasm target/.../contract.wasm --source alice --network local --alias my_contract
```

---

## Testnet Faucet (Friendbot)

```bash
curl "https://friendbot.stellar.org?addr=G..."
```

Funds account with 10,000 testnet XLM.

---

## Wallets

| Wallet | Platform | Notes |
|--------|----------|-------|
| Freighter | Browser | SDF-built, essential for web dApp testing |
| xBull | Browser | Popular alternative with Soroban |
| Albedo | Browser | Multisig support |
| Rabet | Browser + Mobile | Classic + Soroban |
| Hana | Mobile | Mobile-first Soroban |
| Lobstr | Mobile / Web | Consumer wallet, SEP support |

Wallets Kit integration: see `/frontend/SKILL.md`.

---

## Explorers

| Explorer | URL | Best for |
|----------|-----|----------|
| Stellar Expert | https://stellar.expert | Asset stats, AMM pools, contract calls, SEP discovery |
| Stellar Lab | https://lab.stellar.org | Manual tx building, XDR inspection, network limits |

---

## RPC & Horizon Providers

SDF public endpoints are not for production traffic. Use hosted providers:

**Validation Cloud, Blockdaemon, QuickNode, NowNodes, Gateway, Ankr, Infstones.**

Full list: https://developers.stellar.org/docs/data/apis/rpc/providers

---

## Scaffold Stellar

Reference for bootstrapping Soroban projects with frontend + contracts: https://github.com/stellar/scaffold-stellar

---

## Edge cases

| Situation | Detail |
|-----------|--------|
| Local RPC path | Use `/rpc`, not `/soroban/rpc` |
| `--enable` flags | Use `rpc`, not legacy `--enable-soroban-rpc` |
| Standalone passphrase | `Standalone Network ; February 2017` (local only) |
| Quickstart `--local` | Always implies Horizon starts alongside RPC for Friendbot |
| Fee surge on testnet | Use `getFeeStats` or fee bump transaction |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `tx_insufficient_fee` | Fee too low during surge pricing | Use `getFeeStats` or fee bump |
| `tx_bad_seq` | Wrong or reused sequence number | Re-fetch account before building tx |
| `op_no_destination` | Recipient not funded on-chain | `createAccount` or Friendbot first |
| `op_low_reserve` | Below minimum balance | Fund more XLM or remove subentries |
| CLI can't find network | Missing `stellar network add` | Run `stellar network add local ...` first |
| RPC 404 on `/soroban/rpc` | Legacy path | Use `/rpc` instead |

---

## See also

- `/frontend/SKILL.md` — Wallets Kit, Freighter integration, frontend RPC setup
- `/contracts/SKILL.md` — `stellar contract build`, deploy, test patterns
- Quickstart docs: https://github.com/stellar/quickstart/blob/master/README.md

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/tools — MIT License*

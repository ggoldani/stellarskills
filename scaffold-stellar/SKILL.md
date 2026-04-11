---
name: stellarskills-scaffold-stellar
description: Full-stack dApp scaffolding — project generation, directory structure, contract integration, deployment, and OZ Wizard workflow.
---

# STELLARSKILLS — Scaffold Stellar

> Bootstrapping full-stack Stellar dApps with pre-configured contracts, frontend, and deployment.

---

## When to use

- Starting a new Stellar dApp from scratch
- Need a reference project structure for Soroban + frontend
- Want pre-configured Wallets Kit, deployment scripts, and test setup

---

## Quick reference

| Command | What it does |
|---------|-------------|
| `npx create-scaffold-stellar my-dapp` | Generate full-stack project |
| `cd my-dapp && npm install` | Install dependencies |
| `npm run dev` | Start dev server (frontend + contract) |
| `npm run deploy:testnet` | Deploy contracts to testnet |
| `npm run deploy:mainnet` | Deploy contracts to mainnet |
| `npm run test` | Run contract tests |

---

## Generated project structure

```
my-dapp/
├── contracts/           # Soroban smart contracts (Rust)
│   └── my-contract/     # Cargo.toml, src/lib.rs
├── frontend/            # Next.js + Wallets Kit
│   ├── src/app/         # App router pages
│   ├── src/components/  # WalletsKit.tsx
│   └── src/lib/         # Contract bindings (contracts.ts)
├── shared/types.ts      # Shared types and utils
├── package.json
└── stellar-engine.json  # Network & deployment config
```

Key files:
- `stellar-engine.json` — network config, contract addresses, wallet settings
- `frontend/src/lib/contracts.ts` — auto-generated contract bindings
- `contracts/*/src/lib.rs` — Soroban contract source

---

## Quick start

```bash
npx create-scaffold-stellar my-token-dapp
cd my-token-dapp
npm install
npm run dev
```

Open `http://localhost:3000` — dev server with hot reload for both frontend and contracts.

---

## Contract integration with OZ Wizard

Use the OpenZeppelin Contract Wizard to generate audited contract code, then integrate:

1. Configure token parameters at [wizard.openzeppelin.com/stellar](https://wizard.openzeppelin.com/stellar)
2. Select features (mintable, burnable, pausable, etc.)
3. Download as Soroban contract
4. Replace `contracts/my-contract/src/lib.rs` with the downloaded file

```bash
# After replacing lib.rs, rebuild and test
cd contracts/my-contract
cargo build --target wasm32-unknown-unknown
cargo test
```

---

## Deploy flow

### Testnet

```bash
# Fund account via friendbot
curl "https://friendbot.stellar.org?addr=$(stellar keys address my-key)"

# Deploy contract
npm run deploy:testnet
```

### Mainnet

```bash
# Ensure funded account with sufficient XLM
npm run deploy:mainnet
```

`stellar-engine.json` stores deployed contract addresses per network. Frontend reads these automatically.

---

## Adding a second contract

```bash
# Create new contract directory
cd contracts
mkdir my-second-contract && cd my-second-contract
cargo init --name my-second-contract

# Write contract in src/lib.rs, then:
cargo build --target wasm32-unknown-unknown

# Register in stellar-engine.json
```

Add bindings to frontend:
```bash
cd ../..
npx stellar-contract-bindings generate \
  --contract-dir contracts/my-second-contract \
  --output frontend/src/lib/my-second-contract.ts
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| `create-scaffold-stellar` hangs | npm registry slow or network issue; retry with `--registry` flag |
| Contract compile error after OZ Wizard import | Check `Cargo.toml` has matching `soroban-sdk` dependency |
| Wallet connect fails on dev | Ensure `stellar-engine.json` has correct `networkPassphrase` |
| Deploy fails with `insufficient_fee` | Fund source account with more XLM |
| Hot reload not picking up contract changes | Restart dev server; WASM needs recompilation |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `npm run dev` fails | Missing dependencies or wrong Node version | `npm install`; requires Node 18+ |
| `cargo build` target error | WASM target not installed | `rustup target add wasm32-unknown-unknown` |
| Contract not found on deploy | Contract ID missing from config | Run deploy or update `stellar-engine.json` |
| Wallets Kit modal doesn't open | Missing `@creit.tech/stellar-wallets-kit` dep | `npm install @creit.tech/stellar-wallets-kit` |
| `tx_bad_seq` during deploy | Sequence number collision | Wait for previous tx to confirm, then retry |

---

## See also

- `/contracts/SKILL.md` — writing and deploying Soroban contracts manually
- `/tokens/SKILL.md` — token creation (FAT-1, SAC, custom)
- Scaffold Stellar docs: [developers.stellar.org/docs/tools/scaffold-stellar](https://developers.stellar.org/docs/tools/scaffold-stellar)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/scaffold-stellar — MIT License*

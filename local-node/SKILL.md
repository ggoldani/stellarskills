---
name: stellarskills-local-node
description: How to run a local Stellar blockchain with Quickstart Docker — Stellar Core, Horizon, Stellar RPC, Friendbot.
---

# STELLARSKILLS — Local Node & Quickstart Docker

> How to run a local Stellar blockchain, **Stellar RPC**, Horizon, and Friendbot. The Stellar equivalent of Hardhat Node or Anvil.

---

## 1. The Local Node Environment

In the EVM world, you run `npx hardhat node` to get a local, isolated blockchain on `localhost:8545`.

In Stellar, you run the **Stellar Quickstart Docker image**. It spins up everything you need in a single container (see [stellar/quickstart](https://github.com/stellar/quickstart)):
1. **Stellar Core** (consensus)
2. **Horizon** (REST for classic protocol)
3. **Stellar RPC** (`stellar-rpc` — JSON-RPC for Soroban; historically called Soroban RPC)
4. **Friendbot** (faucet for test XLM)

**Official Quickstart docs** (flags, ports, RPC path): https://github.com/stellar/quickstart/blob/master/README.md

---

## 2. Starting the Node

Ensure Docker is installed, then run the image. It exposes services on port **8000**.

Default Quickstart enables **core, horizon, rpc** (and related services). For a **local** network:

```bash
docker run --rm -it \
  -p 8000:8000 \
  --name stellar \
  stellar/quickstart:testing \
  --local
```

To enable only specific services, use `--enable` with a comma-separated list (see Quickstart README). Example — RPC-focused (Horizon is still started in local mode when `rpc` is requested so Friendbot remains available):

```bash
docker run --rm -it -p 8000:8000 --name stellar stellar/quickstart:testing --local --enable core,horizon,rpc
```

> Do **not** use legacy flags such as `--enable-soroban-rpc`; current images use **`rpc`** in `--enable`.

### The Output Endpoints

Once the container is ready, typical URLs are:

- **Horizon API:** `http://localhost:8000`
- **Stellar RPC (JSON-RPC):** `http://localhost:8000/rpc` (not `/soroban/rpc`)
- **Friendbot (faucet):** `http://localhost:8000/friendbot`
- **Network passphrase:** `Standalone Network ; February 2017`

---

## 3. Configuring the CLI

Point `stellar` CLI at the local RPC URL:

```bash
stellar network add local \
  --rpc-url http://localhost:8000/rpc \
  --network-passphrase "Standalone Network ; February 2017"
```

Use `--network local` on contract commands.

---

## 4. Generating & Funding Accounts

```bash
stellar keys generate alice
stellar keys fund alice --network local
```

---

## 5. Deploying a Contract Locally

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source alice \
  --network local \
  --alias my_contract
```

```bash
stellar contract invoke \
  --id my_contract \
  --source alice \
  --network local \
  -- \
  initialize \
  --admin alice
```

---

## 6. Frontend Integration with the Local Node

```javascript
import { SorobanRpc, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const LOCAL_NETWORK_PASSPHRASE = "Standalone Network ; February 2017";

const rpcServer = new SorobanRpc.Server("http://localhost:8000/rpc");

const tx = new TransactionBuilder(account, {
  fee: "100000",
  networkPassphrase: LOCAL_NETWORK_PASSPHRASE,
})
// ... add operations, simulate, assemble, sign, send via rpcServer
```

---

## Official documentation

- Quickstart (Docker, `--enable`, RPC path): https://github.com/stellar/quickstart/blob/master/README.md  
- Run RPC in production (admin guide): https://developers.stellar.org/docs/data/rpc/admin-guide  
- Stellar RPC overview: https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers (hosted endpoints): https://developers.stellar.org/docs/data/apis/rpc/providers  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/local-node — MIT License*

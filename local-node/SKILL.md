---
name: stellarskills-local-node
description: Running a local node, Soroban RPC, testing environment
---

# STELLARSKILLS — Local Node & Quickstart Docker

> How to run a local Stellar blockchain, RPC, and Friendbot. The Stellar equivalent of Hardhat Node or Anvil.

---

## 1. The Local Node Environment

In the EVM world, you run `npx hardhat node` to get a local, isolated blockchain on `localhost:8545`.

In Stellar, you run the **Stellar Quickstart Docker Image**. This spins up everything you need in a single container:
1. **Stellar Core** (The consensus layer)
2. **Horizon** (The REST API for classic assets)
3. **Soroban RPC** (The JSON-RPC API for smart contracts)
4. **Friendbot** (An API that automatically funds newly created test accounts with 10,000 XLM)

---

## 2. Starting the Node

Ensure Docker is installed, then run the image. It exposes everything on port **8000**.

```bash
docker run --rm -it \
  -p 8000:8000 \
  --name stellar \
  stellar/quickstart:testing \
  --local \
  --enable-soroban-rpc
```

### The Output Endpoints
Once the container says "Joined network", you have access to:
- **Horizon API:** `http://localhost:8000`
- **Soroban RPC:** `http://localhost:8000/soroban/rpc`
- **Friendbot (Faucet):** `http://localhost:8000/friendbot`
- **Network Passphrase:** `Standalone Network ; February 2017`

---

## 3. Configuring the CLI

To interact with your newly running local node, you must configure the `stellar-cli`.

```bash
stellar network add local \
  --rpc-url http://localhost:8000/soroban/rpc \
  --network-passphrase "Standalone Network ; February 2017"
```

Now, every time you run a CLI command, you can append `--network local` to target your Docker container instead of the public testnet.

---

## 4. Generating & Funding Accounts

Create a new local keypair (this generates a secret key stored securely by the CLI):

```bash
stellar keys generate alice
```

Fund the account so you have enough XLM to pay for contract deployments and fees. Instead of using a public testnet faucet, the CLI will automatically hit your local Docker Friendbot.

```bash
stellar keys fund alice --network local
```

---

## 5. Deploying a Contract Locally

With the node running and an account funded, you can deploy your WASM file to `localhost`:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source alice \
  --network local \
  --alias my_contract
```

Invoke the contract exactly the same way:

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

To connect a Next.js or React frontend to your local smart contract for end-to-end testing, update your SDK configuration to point to localhost:8000 instead of testnet.

```javascript
import { SorobanRpc, Networks } from "@stellar/stellar-sdk";

// Define the local network
const LOCAL_NETWORK_PASSPHRASE = "Standalone Network ; February 2017";

// Connect to the Docker RPC
const rpcServer = new SorobanRpc.Server("http://localhost:8000/soroban/rpc");

// Use these configs when building transactions
const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: LOCAL_NETWORK_PASSPHRASE
})
...
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/local-node — MIT License*

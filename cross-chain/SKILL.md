---
name: stellarskills-cross-chain
description: Cross-chain integration on Stellar. Circle CCTP (Cross-Chain Transfer Protocol) for native USDC and Axelar for GMP (General Message Passing) and ITS (Interchain Token Service).
---

# STELLARSKILLS — Cross-Chain

> Cross-chain integration on Stellar. Circle CCTP (Cross-Chain Transfer Protocol) for native USDC and Axelar for GMP (General Message Passing) and ITS (Interchain Token Service).

---

## When to use

- Bridging native USDC between Stellar and other chains via Circle CCTP
- Sending messages from a Soroban smart contract to an EVM contract via Axelar GMP
- Receiving cross-chain messages from other networks in a Soroban contract
- Deploying multichain tokens via Axelar Interchain Token Service (ITS)

---

## Quick reference

| Protocol | Purpose | Key Concept |
|----------|---------|-------------|
| **CCTP** | Native USDC transfers | Burn on source, mint on destination |
| **Axelar GMP** | General Message Passing | Smart contract to smart contract communication |
| **Axelar ITS** | Interchain Token Service | Multichain tokens with unified supply and fungibility |

---

## Circle CCTP (Cross-Chain Transfer Protocol)

Circle's Cross-Chain Transfer Protocol (CCTP) supports native USDC transfers between Stellar and other CCTP-enabled chains. This avoids the need for wrapped assets or third-party bridges, relying directly on Circle's smart contracts to burn USDC on the source chain and mint it on the destination chain.

CCTP on Stellar is fully documented and maintained by Circle. For contract addresses, supported chains, SDKs, code samples, and the attestation API, refer to the official documentation.

### Relevant Links
- [CCTP on Stellar — Circle developer docs](https://developers.circle.com/cctp/references/stellar)

---

## Axelar Network

Axelar Network is an interoperability network that securely connects all blockchain ecosystems, applications, assets, and users. It allows Stellar smart contracts to interact with other chains via two main features.

### 1. General Message Passing (GMP)

General Message Passing (GMP) is a cross-chain communication protocol that allows smart contracts on different blockchains to communicate with each other. With GMP, Stellar contracts can:

- Send messages to contracts on other chains like Ethereum, Avalanche, Base, Polygon, etc.
- Receive and process messages from contracts on other chains.
- Execute cross-chain operations securely and efficiently.

[Dive into Stellar GMP documentation](https://docs.axelar.dev/dev/general-message-passing/stellar-gmp/intro/)

### 2. Interchain Token Service (ITS)

The Interchain Token Service (ITS) enables tokens to scale across multiple chains by supporting both existing and newly minted tokens, preserving native-like fungibility and functionality on connected EVM chains. It automates deployment and maintenance to help teams easily manage supply on an open, scalable, and secure network.

For the Stellar ecosystem, ITS offers:
- Creation of new tokens that can exist on multiple blockchains.
- Connecting existing Stellar tokens to other blockchain ecosystems.
- Secure transfers of tokens between Stellar and other chains.

[Learn how to use Axelar's ITS with Stellar](https://docs.axelar.dev/dev/send-tokens/stellar/intro/)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/cross-chain — MIT License*

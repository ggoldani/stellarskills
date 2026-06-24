---
name: stellarskills-cross-chain
description: Cross-chain tools on Stellar including Circle CCTP and Axelar (GMP and ITS).
---

# STELLARSKILLS — Cross-Chain

> Cross-chain tools on Stellar including Circle CCTP and Axelar (GMP and ITS).

---

## When to use

- Bridging tokens between Stellar and EVM chains
- Transferring USDC using Circle CCTP without wrapped assets
- Implementing cross-chain logic using Axelar General Message Passing (GMP)
- Using Axelar Interchain Token Service (ITS)

---

## Circle CCTP (Cross-Chain Transfer Protocol)

Circle's CCTP supports native USDC transfers between Stellar and other CCTP-enabled chains.
This means no wrapped assets and no third-party bridges are required.

CCTP on Stellar is documented and maintained by Circle. You can find contract addresses, supported chains, SDKs, code samples, and the attestation API in the [Circle developer docs](https://developers.circle.com/developer/docs/cctp-getting-started).

---

## Axelar

Axelar Network is an interoperability network that connects different blockchain ecosystems, applications, assets, and users.

### General Message Passing (GMP)

General Message Passing (GMP) allows smart contracts on different blockchains to communicate with each other. With GMP, Stellar contracts can:
- Send messages to contracts on other chains like Ethereum, Avalanche, Base, Polygon, etc.
- Receive and process messages from contracts on other chains.
- Execute cross-chain operations securely and efficiently.

### Interchain Token Service (ITS)

The Interchain Token Service (ITS) enables tokens to scale across multiple chains by supporting both existing and newly minted tokens. For the Stellar ecosystem, ITS offers:
- Creation of new tokens that can exist on multiple blockchains.
- Connecting existing Stellar tokens to other blockchain ecosystems.
- Secure transfers of tokens between Stellar and other chains.

---

## See also

- Official Stellar Documentation on Cross-Chain: https://developers.stellar.org/docs/tools/infra-tools/cross-chain
- Circle CCTP Documentation: https://developers.circle.com/developer/docs/cctp-getting-started
- `/assets/SKILL.md` — Stellar assets and USDC

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/cross-chain — MIT License*

---
name: Oracles on Stellar
description: How to integrate and use Data Oracles on Stellar and Soroban.
---

> How to integrate and use Data Oracles on Stellar and Soroban.

## Overview

Oracles are services that connect blockchain systems to external, off-chain data sources, enabling smart contracts to interact with real-world information. They act as intermediaries, fetching and verifying data such as market prices, weather conditions, or event outcomes, and then delivering it to the blockchain in a secure and reliable manner.

Stellar provides access to several Oracle networks, primarily used for retrieving off-chain pricing data to use inside Soroban smart contracts.

## Reflector Network

The Reflector oracle protocol is a combination of specialized smart contracts and peer-to-peer consensus of data provider nodes maintained by trusted Stellar ecosystem organizations. Feeds include on-chain and off-chain asset prices, CEX & DEX exchange rates, foreign exchange rates, etc.

Compatible with the SEP-40 ecosystem standard interface.

## Band Protocol

Band is a cross-chain data oracle aggregating and connecting real-world data and APIs to smart contracts.

## DIA Oracles

DIA is a cross-chain, trustless oracle network that delivers verifiable price feeds. dApps on Stellar can consume these feeds from DIA's deployed contracts.

---
*raw.githubusercontent.com/ggoldani/stellarskills/main/oracles — MIT License*

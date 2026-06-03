---
name: Privacy on Stellar
description: How to implement privacy-preserving applications on Stellar using ZK proofs, Confidential Tokens, and Privacy Pools.
---

> How to implement privacy-preserving applications on Stellar using ZK proofs, Confidential Tokens, and Privacy Pools.

## Overview

Stellar is a public blockchain, but it supports compliance-ready privacy tools via Protocol 25/26 cryptographic host functions. These tools protect sensitive financial information while supporting regulatory compliance.

## ZK Cryptographic Primitives

Stellar smart contracts include native host functions that underpin ZK-based privacy, making them efficient and affordable:

- **BLS12-381** (`CAP-0059`): Pairing-friendly elliptic curve for zk-SNARKs.
- **BN254** (`CAP-0074`): The pairing-friendly elliptic curve used by most ZK applications. Adds `bn254_g1_add`, `bn254_g1_mul`, and `bn254_multi_pairing_check` host functions.
- **Poseidon / Poseidon2** (`CAP-0075`): Hash functions optimized for ZK circuits, used for commitments, Merkle trees, and nullifiers.

## Onchain ZK Verifiers

Smart contracts that accept a compact ZK proof and confirm validity without re-running computation.

- **RISC Zero (Groth16) Verifier**: Verifies proofs created with RISC Zero's zkVM (Rust) or Circom.
- **UltraHonk Verifier**: Verifier for circuits built with Aztec's Noir language and Barretenberg backend.

## Privacy Pools

Smart contract-based systems for private transfers between users. Deposits and withdrawals are visible, but internal transfers are private. Support Association Set Providers (ASPs) for compliance (allow/deny lists).

## Confidential Tokens

Keeps token balances and transaction amounts private while addresses remain public. In development by the Confidential Token Association.

---
*raw.githubusercontent.com/ggoldani/stellarskills/main/privacy — MIT License*

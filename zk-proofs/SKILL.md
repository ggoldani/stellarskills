---
name: stellarskills-zk-proofs
description: Zero-Knowledge proofs on Stellar, including BN254 host functions, Poseidon hashing, and Privacy Pools.
---

# STELLARSKILLS — ZK Proofs on Stellar

> Zero-Knowledge proofs, BN254 cryptographic host functions, Poseidon hashing, and building privacy-preserving applications on Stellar.

---

## When to use

- Building privacy pools, confidential tokens, or anonymous credentials on Stellar
- Verifying zk-SNARKs (e.g. Groth16, Noir) on-chain
- Efficient hashing inside arithmetic circuits using Poseidon

---

## ZK Cryptographic Primitives

Stellar's Protocol 22, 25 ("X-Ray"), and 26 ("Yardstick") releases introduced native host functions into Stellar smart contracts that underpin ZK-based privacy:

### BN254 (CAP-0074)

BN254 is a pairing-friendly elliptic curve widely used in zero-knowledge proof systems. The host functions mirror Ethereum's EIP-196/197 precompiles, enabling existing circuits to be ported to Stellar.

Host functions:
- `bn254_g1_add` — Adds two points in the G1 group.
- `bn254_g1_mul` — Multiplies a G1 point by an integer.
- `bn254_multi_pairing_check` — Verifies a pairing equation, typically the final step of verifying a zk-SNARK.

### Poseidon (CAP-0075)

Poseidon is a cryptographic hash function optimized for ZK circuits, significantly faster and cheaper to prove inside a circuit than SHA-256. It is commonly used for commitments, Merkle trees, and nullifiers.

Host functions:
- `poseidon` — Computes the Poseidon hash of the input field elements.
- `poseidon2` — Computes the Poseidon2 hash.

---

## Privacy on Stellar

Stellar is public, but configurable privacy tools are being built:

### Privacy Pools

Smart contract-based systems allowing users to transact privately.
- **Stellar Private Payments**: A proof-of-concept by Nethermind using Circom circuits, Groth16 proofs, and Stellar smart contracts. Includes ASP (Association Set Providers) membership contracts via Merkle trees.

### Confidential Tokens

Tokens where balances and amounts are private, but sender/receiver addresses are public. The Confidential Token Association is developing an open standard for Stellar.

### Onchain ZK Verifiers

Smart contracts that accept and verify a compact ZK proof without re-running the computation.
- **RISC Zero (Groth16) Verifier**: Built by Nethermind to verify proofs from RISC Zero's zkVM or Circom.
- **UltraHonk Verifier**: Verifies circuits built with Aztec's Noir language and Barretenberg backend.

---

## Tooling & SDKs

While the host functions provide the cryptographic operations for *verification*, developers must generate the actual proofs off-chain using higher-level systems:

- **Noir**: Aztec's zk-SNARK language (circuits).
- **RISC Zero**: zkVM allowing circuits written in Rust.
- **Circom**: Language for arithmetic circuits.

---

## Edge cases

| Situation | Detail |
|-----------|--------|
| Hashing in circuits | Use Poseidon host functions to ensure consistency between off-chain circuits and on-chain verification. |
| Production use | Stellar Private Payments is a research prototype. Do not use in production with real assets. |

---

## See also

- `/security/SKILL.md` — Smart contract security
- `/soroban/SKILL.md` — Writing smart contracts

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/zk-proofs — MIT License*

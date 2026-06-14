---
name: zk-proofs
description: Zero-knowledge cryptography and privacy patterns on Stellar/Soroban. Covers Groth16 verification, BLS12-381 (available), BN254 + Poseidon host functions (status-sensitive), Noir / RISC Zero integration, privacy pools, confidential tokens, Merkle tree commitments, and protocol-readiness guidance. Use when building privacy-preserving applications or ZK-verifier contracts on Stellar.
user-invocable: true
argument-hint: "[zk task]"
---

# Zero-Knowledge Proofs & Privacy

Privacy patterns and ZK verification on Stellar/Soroban. Capability is protocol- and SDK-version dependent — verify CAP status, target network version, and `soroban-sdk` support before relying on a primitive.

## When to use this skill
- Implementing a Groth16 (or other SNARK) verifier as a Soroban contract
- Using BLS12-381 host functions
- Planning for BN254 / Poseidon support in production flows
- Integrating Noir or RISC Zero proofs
- Building privacy pools, confidential tokens, or Merkle-tree-backed commitments

## Status-sensitive — always verify
1. CAP status in `stellar/stellar-protocol` (`Final` / `Implemented` vs draft)
2. Target network protocol/software version
3. `soroban-sdk` support for the host functions you need
4. Availability of production examples matching your proving system

## Related skills
- Soroban contract patterns, tests, and security → `../soroban/SKILL.md`
- Confidential-token integration with classic assets → `../assets/SKILL.md`
- Off-chain proof verification UI → `../dapp/SKILL.md`
- Privacy-specific application patterns → `../privacy/SKILL.md`
- CAPs and ecosystem references → `../standards/SKILL.md`

---

## Source-of-truth checks
Before implementation, verify:
- CAP-0059 for BLS12-381 support
- CAP-0074 for BN254 host functions
- CAP-0075 for Poseidon/Poseidon2 host functions
- Stellar protocol/software version for the target network
- SDK release support for the exact host-function names and signatures

## Cryptographic primitives

### BLS12-381
Available for Soroban cryptographic workflows and zk-SNARK systems where supported by the target SDK/network.

### BN254 (CAP-0074)
BN254 is a pairing-friendly elliptic curve used by many ZK systems. Stellar exposes native host functions that mirror the EVM-style pairing workflow.

Host functions:
- `bn254_g1_add` — Adds two points in the G1 group.
- `bn254_g1_mul` — Multiplies a G1 point by an integer.
- `bn254_multi_pairing_check` — Verifies a pairing equation; typically the final step in zk-SNARK verification.

### Poseidon / Poseidon2 (CAP-0075)
Poseidon is optimized for ZK circuits and is commonly used for commitments, Merkle trees, and nullifiers.

Host functions:
- `poseidon_permutation` — Poseidon permutation over field elements.
- `poseidon2_permutation` — Poseidon2 permutation over field elements.

## Privacy on Stellar

### Privacy Pools
Smart contract-based systems that let users transact privately.
- **Stellar Private Payments**: Proof-of-concept by Nethermind using Circom circuits, Groth16 proofs, and Stellar smart contracts. Includes ASP membership and non-membership contracts based on Merkle trees.

### Confidential Tokens
Tokens where balances and amounts are private, but sender/receiver addresses are public. The Confidential Token Association is developing an open standard for Stellar.

### Onchain ZK verifiers
Smart contracts that accept and verify compact ZK proofs without re-running the original computation.
- **RISC Zero (Groth16) Verifier**: Verifies proofs from RISC Zero's zkVM or Circom.
- **UltraHonk Verifier**: Verifies circuits built with Aztec's Noir language and Barretenberg backend.

## Tooling & SDKs

Generate proofs off-chain, then verify on-chain:
- **Noir**: ZK language for arithmetic circuits.
- **RISC Zero**: zkVM for Rust programs.
- **Circom**: Circuit language for Groth16-style flows.

## Edge cases

| Situation | Detail |
|-----------|--------|
| Hashing in circuits | Use Poseidon host functions to keep off-chain circuits and on-chain verification aligned. |
| Production use | Stellar Private Payments is a research prototype. Do not use in production with real assets. |

## See also
- [Privacy on Stellar docs](https://developers.stellar.org/docs/build/apps/privacy)
- [CAP-0074](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0074.md)
- [CAP-0075](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0075.md)
- `/soroban/SKILL.md` — Writing and testing Soroban contracts
- `/security/SKILL.md` — Smart contract security

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/zk-proofs — MIT License*

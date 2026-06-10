---
name: ZK Proofs
description: Zero-Knowledge proofs on Stellar. BN254 and Poseidon host functions, onchain verifiers, and Protocol 25 primitives.
---

> Zero-Knowledge proofs on Stellar. BN254 and Poseidon host functions, onchain verifiers, and Protocol 25 primitives.

Stellar's Protocol 25 (X-Ray) introduced native host functions for zero-knowledge-friendly primitives (BN254 and Poseidon/Poseidon2). This equips developers with the execution-environment infrastructure needed to build compliance-forward, privacy-preserving applications using zero-knowledge cryptography natively on Soroban smart contracts.

These primitives are foundational building blocks and do not provide end-to-end private payments without additional higher-level protocol or application logic.

---

## BN254

BN254 is a pairing-friendly elliptic curve defined over a 254-bit prime field, commonly used in zero-knowledge proof systems because it supports efficient bilinear pairings. These pairings enable succinct proof constructions where complex statements can be verified quickly on-chain or in constrained environments.

While BN254 host functions provide the cryptographic operations needed for proof verification, developers must still generate proofs using higher-level systems (such as circuits written in Noir or Risc0 methods) and deploy verifier smart contracts on Stellar to implement complete zero-knowledge workflows.

### BN254 Host Functions

- `g1_add`: Adds two elliptic-curve points in the G1 group, producing a new point. Commonly used to combine proof or verification values.
- `g1_mul`: Multiplies a G1 elliptic-curve point by an integer, returning a new point. This operation is a core building block in many proof verification calculations.
- `pairing_check`: Verifies a pairing equation over lists of G1 and G2 points. This is typically the final step when checking the validity of a BN254 pairing-based proof.

---

## Poseidon

Poseidon is a cryptographic hash function specifically designed for zero-knowledge proof systems, where efficiency inside arithmetic circuits is critical. Unlike traditional hashes such as SHA-256, Poseidon is optimized to minimize the number of constraints required in zero-knowledge circuits by operating natively over finite fields used by zk-SNARKs. This makes it significantly faster and cheaper to prove and verify statements involving hashing. It is widely used for commitments, Merkle trees, and nullifiers in zero-knowledge applications.

Poseidon host functions support hashing within ZK-friendly environments, but developers must still incorporate them into higher-level proof systems and pair them with Stellar verifier contracts to build end-to-end zero-knowledge application flows.

### Poseidon Host Functions

- `poseidon`: Computes the Poseidon hash of the input field elements.
- `poseidon2`: Computes the Poseidon hash of the input field elements.

*Note: Poseidon is currently being branched out as a separate Rust SDK for use in smart contracts.*

---

## Resources & Documentation

- [Protocol 25 (X-Ray) Announcement](https://stellar.org/blog/developers/announcing-stellar-x-ray-protocol-25)
- [CAP-74 Proposal (BN254)](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0074.md)
- [CAP-75 Proposal (Poseidon)](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0075.md)
- [P25 Preview Examples](https://github.com/jayz22/soroban-examples/tree/p25-preview/p25-preview)
- [Noir Ultrahonk Soroban Verifier Contract](https://github.com/indextree/ultrahonk_soroban_contract)
- [Noir Documentation](https://noir-lang.org/docs/)
- [RISC Zero Documentation](https://dev.risczero.com/)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/zk/SKILL.md — MIT License*
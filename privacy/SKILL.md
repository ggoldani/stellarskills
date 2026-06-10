---
name: Privacy
description: Privacy solutions on Stellar. Privacy Pools, Stellar Private Payments, Confidential Tokens, and Onchain ZK Verifiers.
---

> Privacy solutions on Stellar. Privacy Pools, Stellar Private Payments, Confidential Tokens, and Onchain ZK Verifiers.

Stellar is a public blockchain where every transaction is recorded on-chain and visible to anyone. To support use cases like payroll, institutional settlement, and everyday payments which require transaction privacy, the Stellar community provides configurable, compliance-ready privacy tools. From low-level cryptographic host functions to managed private payment systems, these solutions help developers protect sensitive financial information while supporting regulatory compliance and enterprise requirements.

---

## Privacy Pools

Privacy Pools are smart contract-based systems that let users pay each other or interact with other protocols while optionally keeping their balances, transaction amounts, and addresses private on the public blockchain. Deposits and withdrawals into the pool are visible on-chain, but transactions between parties within the pool do not need to be.

Privacy Pools include built-in features that allow operators to implement compliance policies and processes. Association Set Providers (ASPs) can manage allow/deny lists that ensure known bad actors cannot interact within the pool, while legitimate users, merchants, and exchanges are free to transact safely without revealing unnecessary transaction history or personal information on-chain to prove integrity. Some systems also include view keys that allow authorized parties to investigate suspicious transactions or respond to law enforcement requests.

### Stellar Private Payments (Prototype)
Nethermind's ZK team has built a proof-of-concept Privacy Pools implementation for Stellar using Circom circuits, Groth16 proofs, and Stellar smart contracts. **(Warning: Research prototype, not audited. Do not use in production with real assets).**

- **Pool contract:** Manages deposits, transfers, and withdrawals.
- **Groth16 verifier:** On-chain ZK proof verification.
- **ASP membership contract:** Merkle tree of approved addresses.
- **ASP non-membership contract:** Sparse Merkle tree for exclusion proofs.
- Proofs are generated client-side in the browser via WebAssembly (user secrets never leave the device).

---

## Confidential Tokens

Confidential Tokens let users keep token balances and transaction amounts private while keeping the sender and receiver's addresses publicly visible on-chain. Confidential tokens are designed for contexts where the parties to a transaction are known, but the amounts should not be.

The Confidential Token Association (SDF, Nethermind, OpenZeppelin, and Zama) is developing an open standard for encryption-based on-chain confidentiality compatible with existing token interfaces.

---

## Onchain ZK Verifiers

An on-chain verifier is a smart contract that accepts a compact zero-knowledge proof and confirms its validity without re-running the original computation. These verifiers build on the cryptographic host functions introduced in Stellar's Protocol 25/26 releases, making them efficient and affordable to run.

- **RISC Zero (Groth16) Verifier:** The Stellar Private Payments prototype includes a deployable verifier contract. The contract verifies Groth16-based proofs created with RISC Zero's zkVM coprocessor (allowing developers to write programs in Rust, rather than domain-specific zero-knowledge languages) or ZK-specific languages like Circom.
- **UltraHonk Verifier:** A verifier for circuits built with Aztec's Noir language and Barretenberg backend.

---

## ZK Cryptographic Primitives
Stellar's Protocol 22, 25 ("X-Ray"), and 26 ("Yardstick") introduced native host functions into Stellar smart contracts that underpin all ZK-based privacy on Stellar:
- **BLS12-381 (CAP-0059):** Pairing-friendly elliptic curve with 128-bit security and efficient signature aggregation, enabling zk-SNARKs.
- **BN254 (CAP-0074):** Pairing-friendly elliptic curve used by most ZK applications. Adds `bn254_g1_add`, `bn254_g1_mul`, and `bn254_multi_pairing_check` host functions.
- **Poseidon / Poseidon2 (CAP-0075):** Hash functions designed for ZK circuits. Highly efficient inside proofs. Available as host functions.

See `raw.githubusercontent.com/ggoldani/stellarskills/main/zk/SKILL.md` for in-depth details on BN254 and Poseidon.

---

## Resources & Documentation
- [Privacy Pools Whitepaper](https://privacypools.com/whitepaper.pdf)
- [Stellar Private Payments Repo](https://github.com/NethermindEth/stellar-private-payments)
- [Stellar Private Payments Docs](https://nethermindeth.github.io/stellar-private-payments/)
- [Confidential Token Association](https://www.confidentialtoken.org/)
- [RISC Zero Verifier Repo](https://github.com/NethermindEth/stellar-risc0-verifier)
- [UltraHonk Verifier Contract](https://github.com/indextree/ultrahonk_soroban_contract)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/privacy/SKILL.md — MIT License*
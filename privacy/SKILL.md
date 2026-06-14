---
name: privacy
description: Privacy solutions on Stellar. Privacy Pools, Stellar Private Payments, Confidential Tokens, and on-chain ZK verifiers.
user-invocable: true
argument-hint: "[privacy task]"
---

# Privacy on Stellar

> Privacy solutions on Stellar: Privacy Pools, Stellar Private Payments, Confidential Tokens, and on-chain ZK verifiers.

## When to use this skill
- Designing privacy-preserving payment or settlement flows on Stellar
- Evaluating the Stellar Private Payments prototype
- Explaining compliance-friendly privacy patterns to builders
- Deciding whether a privacy requirement belongs in a protocol-level flow or in a ZK verifier

## Privacy pools

Privacy pools let users transact privately inside a smart-contract pool.

- **Stellar Private Payments**: Proof-of-concept by Nethermind using Circom circuits, Groth16 proofs, and Stellar smart contracts.
- Includes ASP membership and non-membership contracts based on Merkle trees.
- Proofs are generated client-side in the browser via WebAssembly.
- Research prototype only — do not use in production with real assets.

## Confidential tokens

Confidential tokens keep token balances and transaction amounts private while addresses remain public.

- Intended for use cases where the parties are known but amounts should remain hidden.
- The Confidential Token Association is developing an open standard for Stellar.

## On-chain ZK verifiers

Use a verifier contract when you need to check a compact ZK proof without re-running the computation.

- **RISC Zero (Groth16) Verifier**: Verifies proofs created with RISC Zero's zkVM or Circom.
- **UltraHonk Verifier**: Verifies circuits built with Aztec's Noir language and Barretenberg backend.

## See also
- [Privacy on Stellar docs](https://developers.stellar.org/docs/build/apps/privacy)
- [Stellar Private Payments repo](https://github.com/NethermindEth/stellar-private-payments)
- [Stellar Private Payments docs](https://nethermindeth.github.io/stellar-private-payments/)
- [Confidential Token Association](https://www.confidentialtoken.org/)
- [CAP-0074](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0074.md)
- [CAP-0075](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0075.md)

---

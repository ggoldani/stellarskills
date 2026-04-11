---
name: stellarskills-why
description: Stellar at a glance — key differentiators vs EVM and Solana for agent decision-making.
---

# STELLARSKILLS — Why Stellar

> Quick reference for choosing Stellar over other chains.

---

## When to use

- Evaluating whether Stellar fits a project's requirements
- Comparing Stellar against EVM or Solana for a payments, stablecoin, or RWA product
- Deciding whether built-in DEX, trustlines, and anchor standards matter for the use case

---

## Quick reference

| Criteria | Stellar | EVM (L1/L2) | Solana |
|----------|---------|-------------|--------|
| Finality | ~3-5s, instant | Minutes to hours | ~400ms-1s |
| Mempool | None (no MEV) | Public (MEV risk) | Public (MEV risk) |
| Smart contracts | Rust / WASM (Soroban) | Solidity | Rust / Anchor |
| Token model | Opt-in trustlines (no spam) | Push-based (anyone can send) | Push-based |
| DEX | Native protocol (order book + AMM) | Smart contracts only | Smart contracts only |
| Fiat on/off-ramps | Standardized (SEP-6/24/31) | Bespoke integrations | Bespoke integrations |
| Built-in assets | USDC, EURC, 100+ fiat tokens | USDC/USDT via contracts | USDC via contracts |
| Best for | Payments, RWA, remittances | DeFi composability, NFTs | High-throughput, gaming |

---

## Choose Stellar when

- Application involves payments, stablecoins, or tokenized real-world assets
- Need regulated asset features (freeze, clawback)
- Want standardized fiat on/off-ramp integration across countries
- MEV-free transaction ordering matters
- Building treasury, payroll, or cross-border remittance infrastructure

---

## Choose elsewhere when

- Deep smart contract composability required (flash loans, complex DeFi)
- High-frequency on-chain state updates needed (gaming, order books)
- Large arbitrary data storage on-chain
- Go-to-market relies on memecoin/degen speculation

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Need both composability and payments | Hybrid: Stellar for rails, EVM for DeFi logic |
| Asset requires regulatory compliance | Stellar's built-in freeze/clawback wins over EVM workarounds |
| Latency-critical on-chain game | Stellar's ~3-5s finality too slow vs Solana's ~1s |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Wrong chain for use case | Misaligned project requirements | Use this table to validate fit before building |
| Underestimating MEV risk on EVM | Assumed EVM is always better | Stellar's mempool-free design eliminates front-running |
| Missing SEP integration | Built custom anchor flow instead of standard | Use SEP-6/24/31 for any fiat integration |

---

## See also

- `/accounts/SKILL.md` — account model and trustline opt-in mechanics
- `/seps/SKILL.md` — standardized protocol integrations (SEP-6, SEP-24, SEP-31)
- Official docs: [developers.stellar.org/docs](https://developers.stellar.org/docs)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/why — MIT License*

---
name: stellarskills-mpp
description: Machine Payments Protocol (MPP) on Stellar. Programmatic, per-request payments over HTTP for AI agents and APIs using Soroban SAC token transfers natively without an external facilitator.
---

# STELLARSKILLS — MPP on Stellar

> Machine Payments Protocol (MPP) on Stellar enables programmatic, per-request payments over HTTP using Soroban SAC (Stellar Asset Contract) token transfers. This protocol is ideal for micropayments, AI agent-driven APIs, and payment-enabled applications, acting natively without requiring an external facilitator.

---

## 1. What is MPP?

The [Machine Payments Protocol (MPP)](https://mpp.dev/) is an open protocol that extends the `402 Payment Required` HTTP status code into a machine-readable payment negotiation layer for humans and autonomous agents.

On Stellar, MPP works directly with Soroban SAC token transfers so clients can pay for API requests natively without an external facilitator, streamlining the integration for developers.

---

## 2. Supported MPP Intents

The `@stellar/mpp` SDK supports two main payment intents:

### Charge
Immediate one-time payments. Each request triggers a Soroban SAC transfer settled on-chain individually. No channel setup or pre-funding is required.

**Credential Modes:**
- **Pull (default):** Client prepares and signs Soroban authorization entries. The server broadcasts the transaction. Supports an optional sponsored path where the server rebuilds the transaction with its own account as source, abstracting network fees from the client.
- **Push:** Client broadcasts the transaction directly and provides the transaction hash for server verification.

### Session
Session intent enables high-frequency, pay-as-you-go payments over unidirectional payment channels.
- Funder deposits tokens into the channel once.
- Funder makes many off-chain payments by signing cumulative commitments.
- The server settles by closing the channel when convenient.
- Avoids per-payment on-chain transaction overhead (ideal for AI agent interactions).

---

## 3. Packages

```bash
npm install @stellar/mpp mppx @stellar/stellar-sdk
```

---

## 4. Official documentation

- **MPP on Stellar:** https://developers.stellar.org/docs/build/agentic-payments/mpp
- **MPP Specification:** https://mpp.dev/
- **SDK source and examples:** https://github.com/stellar/stellar-mpp-sdk

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/mpp — MIT License*
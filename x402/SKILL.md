---
name: stellarskills-x402
description: HTTP 402 micropayments on Stellar via x402 — Soroban token transfers, auth entries, facilitator. Not the same as EVM/Base x402.
---

# STELLARSKILLS — x402 on Stellar

> Pay-per-request APIs using HTTP **402 Payment Required** on Stellar. The Stellar flow uses **Soroban / SEP-41-style token transfers**, **authorization entry signing** (see SEP-43), and often a **facilitator** — it is **not** identical to x402 on Base/EVM.

---

## Official documentation (always verify current APIs)

- **x402 on Stellar:** https://developers.stellar.org/docs/build/agentic-payments/x402  
- **Built on Stellar facilitator:** https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar  
- **Stellar x402 repository:** https://github.com/stellar/x402-stellar  
- **Protocol spec:** https://x402.org  
- **npm (Stellar implementation):** https://www.npmjs.com/package/@x402/stellar  

---

## 1. How Stellar x402 differs from EVM

Per the [`@x402/stellar`](https://www.npmjs.com/package/@x402/stellar) package and Stellar docs:

- **Ledger-based expiration** (not only wall-clock timestamps) for payment payloads.
- **Auth entry signing** — the client typically signs **authorization entries**; a **facilitator** verifies and may **rebuild and submit** the on-chain transaction (contrast with “sign full legacy payment tx”-only mental models).
- **Default asset** is often **USDC** as a Soroban token (**7 decimals** on Stellar in the default helpers — confirm in your integration).
- **Mainnet** requires a **configured RPC URL** from a provider listed under **[Stellar RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers)**. Testnet can use a provider URL or the SDF public testnet host — see `@x402/stellar` and the official x402 docs.

---

## 2. Packages

```bash
npm install @x402/stellar @x402/core
```

Optional HTTP client wrapper: `@x402/fetch` (see x402 monorepo / package docs).

Do **not** use obsolete package names such as `stellar-x402` for the current Stellar-native stack.

---

## 3. High-level flow

1. Client calls a protected HTTP resource.
2. Server responds with **402** and **payment requirements** (machine-readable).
3. Client uses **`@x402/stellar`** (with a signer, e.g. `createEd25519Signer`) to satisfy requirements — including signing **auth entries** as required by the Stellar scheme.
4. Client retries with the **`X-PAYMENT`** (or protocol-specified) header.
5. **Facilitator** (e.g. production setups described under **Built on Stellar**) validates and settles on-chain; server returns the resource.

For exact TypeScript patterns (`x402Client`, `ExactStellarScheme`, server/facilitator registration), follow **the current Stellar docs and the `@x402/stellar` README** — they evolve quickly.

---

## 4. Minimal client pattern (illustrative)

```typescript
import { x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";

const signer = createEd25519Signer(process.env.STELLAR_SECRET_KEY!, "stellar:testnet");
const client = new x402HTTPClient().register("stellar:*", new ExactStellarScheme(signer));
// Use client + @x402/fetch or your HTTP layer per official examples.
```

Use **`stellar:pubnet`** / **`stellar:testnet`** (CAIP-2 style identifiers) and pass a **custom RPC URL** on mainnet as required.

**Server middleware:** For Express apps, use `@x402/express` with `paymentMiddlewareFromConfig` for automatic 402 negotiation.

---

## 5. USDC on Stellar (Circle issuers)

Always verify on [Circle USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses):

| Network | Issuer (classic `G…` account) |
|---------|------------------------------|
| **Public mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| **Testnet** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

x402 on Stellar often uses the **token contract** / SEP-41 interface — use package helpers such as `getUsdcAddress(network)` from `@x402/stellar` where available.

---

## 6. Facilitator & production (Built on Stellar)

For production, use the **Built on Stellar** facilitator flow documented here (includes integration with the **OpenZeppelin Relayer** for relaying transactions):

https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar  

Also see the launch post: https://stellar.org/blog/foundation-news/x402-on-stellar  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/x402 — MIT License*

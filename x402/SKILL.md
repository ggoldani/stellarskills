---
name: stellarskills-x402
description: HTTP 402 micropayments on Stellar via x402 — Soroban token transfers, auth entries, facilitator. Not the same as EVM/Base x402.
---

# STELLARSKILLS — x402 on Stellar

> Pay-per-request APIs using HTTP **402 Payment Required** on Stellar. Uses Soroban token transfers, authorization entry signing, and a facilitator — **not** identical to EVM/Base x402.

---

## When to use

- Building or consuming pay-per-request APIs on Stellar
- Integrating micropayments into HTTP services (USDC, Soroban tokens)
- Setting up a facilitator for automatic payment settlement
- Implementing x402 server middleware (Express, custom HTTP)

---

## Quick reference

| Component | Package / Purpose |
|-----------|-------------------|
| `@x402/stellar` | Core Stellar x402 logic (signer, scheme, USDC helpers) |
| `@x402/core` | Shared x402 protocol types and utilities |
| `@x402/fetch` | HTTP client wrapper with auto-payment retry |
| `@x402/express` | Express middleware for automatic 402 negotiation |
| `createEd25519Signer` | Creates signer from secret key + CAIP-2 network ID |
| `ExactStellarScheme` | Client payment scheme registration |
| `paymentMiddlewareFromConfig` | Server-side Express 402 middleware factory |

---

## Client setup

```bash
npm install @x402/stellar @x402/core @x402/fetch
```

```typescript
import { x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";

const signer = createEd25519Signer(
  process.env.STELLAR_SECRET_KEY!, "stellar:testnet"
);
const client = new x402HTTPClient()
  .register("stellar:*", new ExactStellarScheme(signer));

const res = await client.get("https://api.example.com/premium");
// Client auto-negotiates 402 → signs auth entries → retries with payment
```

For mainnet, use `"stellar:pubnet"` and provide a custom RPC URL (see Edge cases).

---

## Server middleware (Express)

```bash
npm install @x402/express @x402/stellar
```

```typescript
import { paymentMiddlewareFromConfig } from "@x402/express";

app.use(paymentMiddlewareFromConfig({
  scheme: "exact",        // or "pay-to-mint"
  asset: "USDC",
  amount: "100",          // stroops (7 decimals)
  destination: "G...",    // your receiving public key
}));
```

Protected routes return **402 + payment requirements** when no valid `X-PAYMENT` header is present. After the client satisfies payment, the middleware validates and passes the request through.

---

## Facilitator concept

The **facilitator** validates off-chain payment proofs and submits on-chain settlement transactions. In production, the Built on Stellar facilitator integrates with OpenZeppelin Relayer for transaction relay.

Flow: client signs auth entries → facilitator receives proof → facilitator builds and submits Soroban tx → server delivers resource.

### Key distinction from EVM x402

| Aspect | Stellar x402 | EVM/Base x402 |
|--------|-------------|---------------|
| Payment settlement | Soroban smart contract invocation | On-chain EVM tx (paymaster/sponsor) |
| Expiration | Ledger-based + wall-clock | Wall-clock timestamps only |
| Client signing | Auth entry signing (SEP-43 style) | Full payment transaction or ERC-4337 userOp |
| Default asset | USDC (Soroban token, 7 decimals) | USDC (ERC-20, 6 decimals) |

---

## USDC issuers

Always verify at [Circle USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses):

| Network | Issuer account |
|---------|---------------|
| Mainnet | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| Testnet | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

x402 uses the Soroban token contract (SEP-41 interface). Use `getUsdcAddress(network)` from `@x402/stellar` where available.

---

## Edge cases

| Situation | Detail |
|-----------|--------|
| Mainnet RPC required | Must configure RPC URL from a [listed provider](https://developers.stellar.org/docs/data/apis/rpc/providers); no public default |
| USDC decimals | 7 on Stellar (not 6 like EVM USDC) — amount in stroops |
| Ledger-based expiry | Payment payloads expire by ledger, not just wall-clock — may expire before timeout if network is slow |
| Auth entry vs full tx | Client signs auth entries, not the full settlement tx — facilitator assembles and submits |
| Token contract vs classic | x402 uses Soroban token contract (C...), not classic trustline asset — trustline setup not needed |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing RPC URL on mainnet | No default RPC provider configured | Pass RPC URL to scheme/facilitator config |
| Invalid `X-PAYMENT` header | Payment payload expired or malformed signature | Client must re-sign with fresh auth entries |
| Wrong network ID | Used `"stellar:testnet"` on mainnet or vice versa | Match CAIP-2 ID to target network |
| USDC amount mismatch | Treated EVM 6-decimal amount as Stellar 7-decimal | Use stroops (7 decimals); 1 USDC = 10_000_000 |

---

## See also

- Official docs: [x402 on Stellar](https://developers.stellar.org/docs/build/agentic-payments/x402)
- [x402 protocol spec](https://x402.org)
- Built on Stellar facilitator: [developers.stellar.org](https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/x402 — MIT License*

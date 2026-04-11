---
name: stellarskills-mpp
description: Machine Payments Protocol on Stellar — HTTP 402 payment negotiation for agents using Soroban token transfers, one-shot charges, and session channels.
---

Machine Payments Protocol on Stellar for agent-to-agent payment negotiation over HTTP.

## When to use

- Charging AI agents or automated clients for API access with HTTP 402
- Returning machine-readable payment requirements instead of human checkout flows
- Accepting one-time token payments for a single request
- Running high-frequency paid sessions where many small payments would be inefficient on-chain
- Building direct Soroban token payment flows without an external facilitator
- Choosing between client-broadcast and server-broadcast settlement paths

## Quick reference

| Operation | Detail |
|-----------|--------|
| Install SDKs | `npm install @stellar/mpp mppx @stellar/stellar-sdk` |
| Core idea | Extends HTTP 402 into machine-readable payment negotiation for AI agents |
| Settlement rail | Soroban SAC token transfers on Stellar |
| Facilitator | None required on Stellar |
| Intent: Charge | One-time payment for one response or resource |
| Intent: Session | Deposit once, stream many off-chain signed payments, settle later |
| Charge mode: Pull | Server builds and broadcasts settlement, can sponsor fees |
| Charge mode: Push | Client builds and broadcasts transaction |
| Session funding | Funder deposits upfront into a channel |
| Session payments | Off-chain signed commitments update spend state |
| Session settlement | Server submits final settlement on-chain |
| CLI | `mppx` for local testing and inspection |
| Main docs | `https://developers.stellar.org/docs/build/agentic-payments/mpp` |

## What MPP is

MPP extends HTTP `402 Payment Required` into a negotiation format machines can read and act on. A protected resource does not just say payment is required. It also returns structured payment requirements, enough for an agent to decide whether to pay, how to pay, and how to retry the request.

On Stellar, MPP uses Soroban SAC token transfers. The protocol is designed so the client and server can coordinate payment directly. There is no external facilitator in the critical path.

The result is agent-native paid HTTP. A client requests a resource, receives payment terms, fulfills the selected payment method, and retries with proof or settlement context.

## Core model

### Request and retry

The normal flow is:

1. Client requests a protected endpoint.
2. Server responds with `402` and one or more payment options.
3. Client selects an option and settles according to the credential mode.
4. Client retries the HTTP request with the required payment artifact.
5. Server verifies payment state and returns the resource.

### Intents

MPP on Stellar exposes two payment intents.

| Intent | Use case | Settlement style |
|--------|----------|------------------|
| Charge | One request, one payment | Immediate on-chain token transfer |
| Session | Many requests or streaming usage | Upfront deposit, then off-chain commitments |

## Charge intent

Charge is the simple path. A client pays once for one response, one download, one inference call, or one API invocation.

### Pull credentials

In pull mode, the server prepares the settlement path and broadcasts the transaction after receiving the client's authorization or payment credential. This is useful when the server wants tighter control over transaction shape, sequencing, or fee sponsorship.

Use pull when:

- the server wants to submit the transaction itself
- the server may sponsor resource fees
- the client should sign intent but not manage transaction broadcast
- the service wants a consistent settlement pipeline

### Push credentials

In push mode, the client builds and broadcasts the transaction, then presents the result back to the server. This keeps transaction submission with the payer.

Use push when:

- the client already has a Stellar transaction stack
- fee payment should stay with the client
- the server wants simpler verification and less submission logic
- wallets or agent runtimes already know how to send Soroban transactions

## Session intent

Session is for repeated, high-frequency charges where sending one on-chain transaction per event would be wasteful.

The funder deposits once into a session. During the session, the client and server exchange off-chain signed commitments representing updated payment state. The server later settles on-chain against the funded amount.

Use session when:

- charging per token, per second, per chunk, or per streamed event
- many small payments happen in a short window
- latency matters more than immediate on-chain finality per event
- one funding transaction plus one settlement transaction is better than many transfers

## Install

```bash
npm install @stellar/mpp mppx @stellar/stellar-sdk
```

Packages:

| Package | Purpose |
|---------|---------|
| `@stellar/mpp` | MPP protocol types, client and server helpers |
| `mppx` | CLI for testing and local inspection |
| `@stellar/stellar-sdk` | Stellar RPC, transaction assembly, signing, and submission |

## Server pattern: Charge endpoint

A charge-enabled endpoint returns `402` with machine-readable payment requirements when no valid payment is attached.

```ts
import express from "express";
import { createChargeHandler } from "@stellar/mpp";

const app = express();
const charge = createChargeHandler({
  amount: "1000000",
  asset: process.env.SAC_ADDRESS!,
  destination: process.env.RECEIVER!,
});

app.get("/premium", async (req, res) => {
  const ok = await charge.verify(req);
  if (!ok) return charge.respond402(res);
  res.json({ data: "paid result" });
});
```

What the server is responsible for:

- define amount, asset, recipient, and selected credential modes
- emit a valid `402` response with payment instructions
- verify the returned payment artifact or settlement state
- return the protected resource only after successful verification

## Client pattern: handle 402 and pay

The client requests the endpoint, parses the server's MPP response, pays using a supported option, then retries.

```ts
import { fetchWithMpp } from "@stellar/mpp";

const res = await fetchWithMpp("https://api.example.com/premium", {
  accountKeypair: payer,
  rpcUrl: process.env.RPC_URL!,
});

if (!res.ok) throw new Error(`HTTP ${res.status}`);
console.log(await res.json());
```

Client responsibilities:

- detect `402 Payment Required`
- inspect available intents and credential modes
- choose charge or session based on the workload
- sign or submit the needed transaction artifacts
- retry the original request with the returned proof

## Charge flow details

### Pull flow

```ts
const payment = await client.prepareCharge({
  mode: "pull",
  url: endpoint,
});

const retry = await client.submitCredential(endpoint, payment);
console.log(retry.status);
```

Pull tradeoffs:

- better for sponsored submissions
- server controls broadcast timing
- verification is simpler because the server knows the tx shape
- requires extra server-side settlement logic

### Push flow

```ts
const payment = await client.prepareCharge({ mode: "push", url: endpoint });
await client.broadcast(payment.transaction);
const retry = await client.retryWithReceipt(endpoint, payment);
console.log(retry.status);
```

Push tradeoffs:

- simpler server broadcasting model
- client pays fees and manages submission outcome
- better fit for agents with wallet control already in place
- verification depends on confirmed on-chain result or accepted proof model

## Session flow details

### Fund once, commit many times

A session starts with on-chain funding. After that, the client can send updated signed commitments off-chain as usage accumulates.

```ts
const session = await client.openSession({
  asset: process.env.SAC_ADDRESS!,
  deposit: "5000000",
  receiver: process.env.RECEIVER!,
});

await session.commit("25000");
await session.commit("48000");
await session.commit("99000");
```

### Settle later

The server settles the latest valid commitment on-chain.

```ts
const result = await server.settleSession({
  sessionId,
  latestCommitment,
  rpcUrl: process.env.RPC_URL!,
});

console.log(result.hash);
```

## Verification model

For charge, verification usually checks that:

- the intended asset matches the quoted requirement
- the paid amount is sufficient
- the receiver is correct
- network and contract addresses are correct
- the transaction or credential is fresh and not replayed

For session, verification usually checks that:

- the commitment is signed by the authorized funder
- monotonic payment state is preserved
- the amount does not exceed remaining funded balance
- channel/session identifiers match
- the same commitment is not replayed as a newer one

## Edge cases

| Situation | What happens | Handling |
|-----------|--------------|----------|
| Server exposes both charge and session | Client may choose the wrong intent for the workload | Prefer session for repeated micro-usage, charge for one-shot access |
| Pull with sponsorship | Server pays fees or resources | Restrict sponsorship scope and validate amount before broadcast |
| Client broadcasts push tx but retries too early | Server may not see finalized state yet | Retry after confirmation or use the proof model expected by the server |
| Session commitment arrives out of order | Older state can underpay or confuse settlement | Track monotonic nonce or sequence and keep only the latest valid commitment |
| Asset contract mismatch | Payment settles in wrong SAC token | Validate exact contract address, not token symbol alone |
| Session deposit exhausted | Further commitments exceed funded balance | Reject and require refill or new session |
| Network mismatch | Testnet artifacts sent to pubnet server, or reverse | Bind every payment object to network and RPC context |

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `402` loop never resolves | Client ignores or misreads MPP response | Parse the payment requirements and retry with the required artifact |
| Verification fails after push payment | Wrong transaction hash, stale state, or wrong network | Submit on the quoted network and retry only after valid settlement evidence |
| Server rejects pull credential | Signature or authorization scope does not match quote | Rebuild credential from the exact server quote |
| Session settlement rejected | Commitment is stale or exceeds deposit | Submit the latest valid signed state within funded capacity |
| Payment accepted for wrong token | Symbol used instead of SAC address | Quote and verify exact contract IDs |
| Client overuses charge for streaming | Too many on-chain txs, high latency | Switch to session intent |
| Sponsored path drains server funds | Sponsorship offered too broadly | Gate sponsorship by policy, amount ceiling, and authenticated client profile |

## SDKs

| SDK / Tool | Role |
|------------|------|
| `@stellar/mpp` | Main JavaScript SDK for MPP flows |
| `mppx` | CLI for testing, examples, and debugging |
| `@stellar/stellar-sdk` | Transaction build, sign, simulate, and submit |

Verified sources:

- `https://developers.stellar.org/docs/build/agentic-payments/mpp`
- `https://mpp.dev/`
- `https://github.com/stellar/stellar-mpp-sdk`
- npm packages: `@stellar/mpp`, `mppx`

## See also

- `/x402/SKILL.md`

*raw.githubusercontent.com/ggoldani/stellarskills/main/mpp — MIT License*

---
name: stellarskills-anchors
description: Fiat on/off-ramps on Stellar. Integration flows, stellar.toml, and the anchor ecosystem.
---

# STELLARSKILLS — Anchors

> Fiat on/off-ramps on Stellar. Integration flows, stellar.toml, and the anchor ecosystem.

---

## What is an Anchor?

An **Anchor** is a regulated financial entity (like a bank, fintech, or payment processor) that bridges the Stellar network with the traditional financial system.

Anchors do two things:
1. **Hold fiat deposits** (e.g., USD in a bank account).
2. **Issue fiat-backed tokens** on Stellar (e.g., USDC, ARST, BRL).

When you deposit $100 via an anchor, they mint 100 fiat-tokens to your Stellar account. When you withdraw, you send 100 fiat-tokens to the anchor, they burn them, and wire $100 to your bank account.

---

## Anchor Integration Standards (SEPs)

If you are building a wallet or application and want to let users cash in/out, you use SEPs (Stellar Ecosystem Proposals).

See `/seps/SKILL.md` for full technical details.

| Standard | What it does |
|----------|--------------|
| **SEP-1** | `stellar.toml` — Find the anchor's API endpoints and assets |
| **SEP-10**| Authentication — Prove you own a Stellar keypair using a signed challenge |
| **SEP-24**| Hosted Deposit/Withdrawal — Anchor provides a web UI (iframe) for KYC and banking details |
| **SEP-6** | Programmatic Deposit/Withdrawal — Pure API flow (no anchor UI) |
| **SEP-12**| KYC API — Submit user identity data to the anchor programmatically |
| **SEP-31**| Cross-border Payments — Direct anchor-to-anchor remittance API |
| **SEP-38**| Quotes — Get exchange rates before initiating a transfer |

---

## The Typical SEP-24 Flow (Wallets)

Most wallets implement SEP-24 to let users buy/sell assets.

1. **Discovery:** Wallet reads `stellar.toml` of `example.com` to find the `TRANSFER_SERVER_SEP0024` endpoint.
2. **Auth:** Wallet authenticates via SEP-10 and gets a JWT.
3. **Initiate:** Wallet calls `/transactions/deposit/interactive`.
4. **UI:** Wallet opens the returned URL in a browser/webview. The user fills out their bank details and KYC on the anchor's site.
5. **Poll:** Wallet polls `/transaction?id=...` using the JWT.
6. **Complete:** Anchor receives fiat and sends Stellar tokens to the user's account (Deposit). Or, user sends tokens and anchor wires fiat (Withdrawal).

---

## Finding Anchors

You can find available anchors and the assets they issue via the Stellar ecosystem directories:

- **Stellar Expert:** `https://stellar.expert/explorer/public/asset` (Filter by verified issuers)
- **Stellar Anchor Directory:** The SDF maintains lists of active anchors for different corridors (e.g., US, Europe, Latin America, Africa).

---

## Building an Anchor

If you are a financial institution wanting to become an anchor, you don't need to build the SEP endpoints from scratch.

### The Polaris Project
Polaris is an open-source Django (Python) app maintained by the Stellar Development Foundation. It implements SEP-1, 6, 10, 12, 24, 31, and 38 out of the box.

You only write the "glue" code connecting Polaris to your bank's API and your KYC provider.

```bash
pip install django-polaris
```

GitHub: `https://github.com/stellar/django-polaris`

### Go / Java / Node
There are also reference implementations and SDKs available in Go, Java, and Node.js for building custom anchor services.

---

## Trustlines & Anchors

**Crucial:** A user cannot receive an anchor's token unless they have established a trustline for it.

If a user does a SEP-24 deposit for `BRL` issued by `example.com`, the wallet must ensure the user has a `BRL` trustline to the issuer's public key *before* the anchor tries to send the funds, or the anchor's payment will fail (`op_no_trust`).

Many anchors solve this by sponsoring the user's trustline creation fee or requiring the user to do it in the wallet UI before completing the flow.

---

## Anchor Memos

When a user *withdraws* tokens (sending them back to the anchor to get fiat), they must send the tokens to the anchor's distribution account.

Because anchors use a single receiving account for thousands of users, **the transaction MUST include a specific Memo** (usually a Memo ID or Memo Hash) provided by the anchor's API. This memo tells the anchor which user's bank account should receive the fiat.

**Forgetting the memo results in lost funds.**

```javascript
// Example withdrawal payment to an anchor
const tx = new TransactionBuilder(account, { fee: BASE_FEE })
  .addOperation(Operation.payment({
    destination: anchorAccountId,
    asset: anchorAsset,
    amount: "100",
  }))
  .addMemo(Memo.text(withdrawalResponse.memo)) // CRITICAL
  .build();
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/anchors — MIT License*

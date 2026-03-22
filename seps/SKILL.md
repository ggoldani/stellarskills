---
name: stellarskills-seps
description: SEP-1 (stellar.toml), SEP-6, SEP-10 (auth), SEP-12 (KYC), SEP-24, SEP-31, SEP-38 — the interoperability standards that power Stellar's payment rails.
---

# STELLARSKILLS — SEPs (Stellar Ecosystem Proposals)

> SEP-1 (stellar.toml), SEP-6, SEP-10 (auth), SEP-12 (KYC), SEP-24, SEP-31, SEP-38 — the interoperability standards that power Stellar's payment rails.

---

## What Are SEPs?

SEPs (Stellar Ecosystem Proposals) are interoperability standards, similar to EIPs on Ethereum. They define how wallets, anchors, exchanges, and applications communicate. If you're building payments, on/off-ramps, or any financial product on Stellar, you will interact with SEPs.

The most important for builders:
- **SEP-1** — `stellar.toml` discovery file (everyone needs this)
- **SEP-10** — Authentication (needed by SEP-6, SEP-24, SEP-31, SEP-38)
- **SEP-6** — Programmatic deposit/withdrawal API
- **SEP-24** — Hosted deposit/withdrawal (interactive, iframe/popup)
- **SEP-12** — KYC data exchange
- **SEP-31** — Cross-border payment API (sender to receiver via anchor)
- **SEP-38** — Quote API (get exchange rates before transacting)

### Circle USDC issuers (for `asset_issuer` / `stellar:USDC:…` strings)

Verify on https://developers.circle.com/stablecoins/usdc-contract-addresses :

| Network | Issuer |
|---------|--------|
| **Mainnet** | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| **Testnet** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

```javascript
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // mainnet; use testnet issuer on testnet
```

**Stellar docs (SEPs overview):** https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals  

---

## SEP-1 — stellar.toml

Every Stellar service MUST have a `stellar.toml` file served at:
```
https://yourdomain.com/.well-known/stellar.toml
```

This is how wallets, clients, and other services discover your endpoints, assets, and accounts.

### Minimal stellar.toml for an anchor
```toml
VERSION="2.0.0"
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
ACCOUNTS=["GISSUER_ADDRESS", "GDISTRIBUTOR_ADDRESS"]
SIGNING_KEY="GSIGNING_KEY"  # used for SEP-10 challenges

[DOCUMENTATION]
ORG_NAME="Your Company"
ORG_URL="https://yourdomain.com"

[[PRINCIPALS]]
name="Jane Doe"
email="jane@yourdomain.com"

[[CURRENCIES]]
code="USDBRL"
issuer="GISSUER_ADDRESS"
display_decimals=2
name="USD-BRL Stablecoin"
desc="Dollar-pegged token redeemable for BRL via anchor"
is_asset_anchored=true
anchor_asset_type="fiat"
anchor_asset="BRL"
redemption_instructions="https://yourdomain.com/redeem"

[TRANSFER_SERVER]
TRANSFER_SERVER="https://api.yourdomain.com"               # SEP-6

[TRANSFER_SERVER_SEP0024]
TRANSFER_SERVER_SEP0024="https://api.yourdomain.com"       # SEP-24

[DIRECT_PAYMENT_SERVER]
DIRECT_PAYMENT_SERVER="https://api.yourdomain.com"         # SEP-31

[ANCHOR_QUOTE_SERVER]
ANCHOR_QUOTE_SERVER="https://api.yourdomain.com"           # SEP-38

[WEB_AUTH_ENDPOINT]
WEB_AUTH_ENDPOINT="https://api.yourdomain.com/auth"        # SEP-10
```

### CORS Headers Required
Your `stellar.toml` endpoint must return:
```
Access-Control-Allow-Origin: *
```

---

## SEP-10 — Stellar Web Authentication

SEP-10 is a challenge-response authentication mechanism. It proves that a client controls a Stellar keypair WITHOUT submitting a real transaction to the network.

Used as the auth layer for SEP-6, SEP-24, SEP-31, SEP-38.

### Flow

```
1. Client → GET /auth?account=G...           → Anchor returns challenge transaction (XDR)
2. Client signs the challenge transaction     → (no broadcast, just sign)
3. Client → POST /auth { transaction: XDR }  → Anchor verifies, returns JWT
4. Client uses JWT in subsequent API calls    → Authorization: Bearer <jwt>
```

### Step 1: Get challenge (server-side, anchor implements this)
The challenge is a Stellar transaction with:
- Source: anchor's SIGNING_KEY
- Time bounds: current time ± 15 minutes
- Operations: `manageData` with key `<domain> auth` and random 64-byte nonce value
- Signed by: anchor's signing key only

### Step 2 & 3: Client signs challenge (client-side)
```javascript
import { TransactionBuilder, Keypair } from "@stellar/stellar-sdk";

// Fetch challenge
const res = await fetch(`https://api.anchor.com/auth?account=${publicKey}`);
const { transaction, network_passphrase } = await res.json();

// Parse and sign — challenge is transaction envelope XDR (string). Use the constructor / helper that matches your **installed** @stellar/stellar-sdk (see release notes + SEP-10 examples in the official docs).
const tx = TransactionBuilder.fromXDR(transaction, network_passphrase);
tx.sign(Keypair.fromSecret(secret));

// Submit signed challenge
const authRes = await fetch("https://api.anchor.com/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ transaction: tx.toXDR() }),
});
const { token } = await authRes.json();
// token is a JWT, store and use in subsequent requests
```

### Step 4: Use JWT
```javascript
const response = await fetch("https://api.anchor.com/transactions", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Multisig SEP-10
If the account requires multiple signers, collect all signatures before submitting the challenge.

---

## SEP-6 — Programmatic Transfer API

SEP-6 allows programmatic (non-interactive) deposit and withdrawal. The entire flow happens via API calls, with no UI or popups. Best for server-to-server integrations.

### Discover endpoints
```javascript
const tomlRes = await fetch("https://yourdomain.com/.well-known/stellar.toml");
// Parse TOML to get TRANSFER_SERVER
const transferServer = "https://api.anchor.com"; // from toml
```

### GET /info — What the anchor supports
```javascript
const info = await fetch(`${transferServer}/info`, {
  headers: { Authorization: `Bearer ${jwt}` },
}).then(r => r.json());

// info.deposit["USDC"] — deposit info for USDC
// info.withdraw["USDC"] — withdrawal info for USDC
```

### GET /deposit
```javascript
const deposit = await fetch(
  `${transferServer}/deposit?` + new URLSearchParams({
    asset_code: "USDC",
    account: userPublicKey,
    amount: "100",
    type: "bank_account",
  }),
  { headers: { Authorization: `Bearer ${jwt}` } }
).then(r => r.json());

// deposit.how — instructions for the user to send fiat
// deposit.extra_info — additional details
// deposit.min_amount, deposit.max_amount
```

### GET /withdraw
```javascript
const withdrawal = await fetch(
  `${transferServer}/withdraw?` + new URLSearchParams({
    asset_code: "USDC",
    type: "bank_account",
    dest: "agencia/conta",
    dest_extra: "0001/12345-6",
    amount: "500",
  }),
  { headers: { Authorization: `Bearer ${jwt}` } }
).then(r => r.json());

// withdrawal.account_id — Stellar address to send tokens to
// withdrawal.memo, withdrawal.memo_type — include in your payment transaction
```

### GET /transaction(s) — Poll status
```javascript
// Poll until status is "completed" or "error"
const tx = await fetch(
  `${transferServer}/transaction?id=${transactionId}`,
  { headers: { Authorization: `Bearer ${jwt}` } }
).then(r => r.json());

console.log(tx.transaction.status);
// pending_external | pending_anchor | pending_stellar | completed | error
```

---

## SEP-24 — Hosted Interactive Transfer

SEP-24 is similar to SEP-6 but uses an interactive web UI (popup or iframe) for user interaction. Required for flows that need KYC, 2FA, or bank form input from the user.

### Flow
```
1. POST /transactions/deposit/interactive   → Returns URL
2. Open URL in popup/iframe                → User completes form in anchor's UI
3. Poll GET /transaction?id=...            → Wait for completion
4. User sends stellar payment (for withdrawal) OR anchor sends (for deposit)
```

### Initiate interactive deposit
```javascript
const res = await fetch(`${sep24Server}/transactions/deposit/interactive`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    asset_code: "USDC",
    account: userPublicKey,
    amount: "100",
  }),
}).then(r => r.json());

// Open this URL for the user
window.open(res.url, "_blank", "width=600,height=700");

// Poll for status
const pollInterval = setInterval(async () => {
  const status = await fetch(
    `${sep24Server}/transaction?id=${res.id}`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  ).then(r => r.json());

  if (status.transaction.status === "completed") {
    clearInterval(pollInterval);
    // Done
  }
}, 5000);
```

---

## SEP-12 — KYC API

SEP-12 is used by anchors that require KYC. Clients submit user information (name, DOB, ID documents) via the `/customer` endpoint.

```javascript
// Submit KYC data
await fetch(`${anchorKycServer}/customer`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    account: userPublicKey,
    first_name: "João",
    last_name: "Silva",
    email_address: "joao@email.com",
    birth_date: "1990-01-15",
    id_type: "cpf",
    id_number: "123.456.789-00",
  }),
});

// Check KYC status
const customer = await fetch(
  `${anchorKycServer}/customer?account=${userPublicKey}`,
  { headers: { Authorization: `Bearer ${jwt}` } }
).then(r => r.json());

console.log(customer.status); // NEEDS_INFO | PROCESSING | ACCEPTED | REJECTED
```

---

## SEP-31 — Cross-Border Payments

SEP-31 enables direct anchor-to-anchor payments — a sender in one country sends money, a recipient in another receives it in their local currency. No Stellar wallet needed on the receiving end.

```javascript
// POST /transactions
const payment = await fetch(`${sep31Server}/transactions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: "100",
    asset_code: "USDC",
    asset_issuer: USDC_ISSUER,
    receiver_id: "receiver-kyc-id",  // from SEP-12
    sender_id: "sender-kyc-id",      // from SEP-12
    fields: {
      transaction: {
        receiver_routing_number: "021000021",
        receiver_account_number: "123456789",
        type: "SWIFT",
      },
    },
  }),
}).then(r => r.json());

// payment.id — transaction ID to poll
// payment.stellar_account_id — where to send tokens
// payment.stellar_memo — include in payment memo
```

---

## SEP-38 — Anchor RFQ (Quote)

SEP-38 provides a request-for-quote mechanism. Get exchange rates and firm quotes before committing to a transaction.

```javascript
// GET /prices — available pairs
const prices = await fetch(`${sep38Server}/prices?sell_asset=stellar:USDC:${USDC_ISSUER}`)
  .then(r => r.json());

// GET /price — indicative rate
const price = await fetch(
  `${sep38Server}/price?` + new URLSearchParams({
    sell_asset: `stellar:USDC:${USDC_ISSUER}`,
    buy_asset: "iso4217:BRL",
    sell_amount: "100",
  })
).then(r => r.json());

// POST /quote — firm quote (binding for limited time)
const quote = await fetch(`${sep38Server}/quote`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sell_asset: `stellar:USDC:${USDC_ISSUER}`,
    buy_asset: "iso4217:BRL",
    sell_amount: "100",
  }),
}).then(r => r.json());

// quote.id — use in SEP-6/24/31 request
// quote.expires_at — quote expiry time
// quote.price — rate
// quote.buy_amount — BRL amount
```

---

## Implementation Checklist

When building an anchor or integrating with one:

- [ ] `stellar.toml` served at `/.well-known/stellar.toml` with CORS `*`
- [ ] `SIGNING_KEY` set in toml and corresponding keypair secured
- [ ] SEP-10 auth endpoint returns valid challenge transactions
- [ ] Challenge transactions have valid time bounds (±15 min)
- [ ] JWT tokens expire (recommend 24h max)
- [ ] All SEP endpoints protected by JWT
- [ ] `/info` endpoint accurate for supported assets and limits
- [ ] Transaction status polling supported with all status values
- [ ] Memo handling: always include memo when anchor specifies one
- [ ] CORS headers on all API endpoints
- [ ] Test with [Stellar Lab](https://lab.stellar.org) and/or a SEP-compatible wallet (verify current wallet URLs in the official Stellar docs / SEP references)

---

## Official documentation

- SEPs overview: https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals  
- SEP repository: https://github.com/stellar/stellar-protocol/tree/master/ecosystem  
- Stellar RPC (for on-chain verification in apps): https://developers.stellar.org/docs/data/apis/rpc  
- Stellar RPC providers: https://developers.stellar.org/docs/data/apis/rpc/providers  

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/seps — MIT License*

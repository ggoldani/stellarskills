---
name: stellarskills-seps
description: SEP-1, SEP-6, SEP-10, SEP-12, SEP-24, SEP-31, SEP-38 — Stellar interoperability standards for anchors, wallets, and payment rails.
---

# STELLARSKILLS — SEPs

> SEP-1, SEP-6, SEP-10, SEP-12, SEP-24, SEP-31, SEP-38 — interoperability standards for Stellar payment rails.

---

## When to use

- Integrating deposit/withdrawal with an anchor (SEP-6 or SEP-24)
- Authenticating a Stellar keypair with an anchor service (SEP-10)
- Getting exchange quotes before transacting (SEP-38)
- Building cross-border sender-to-receiver payments (SEP-31)
- Serving `stellar.toml` for service discovery (SEP-1)

---

## Quick reference

| SEP | Name | Purpose | When to use |
|-----|------|---------|-------------|
| 1 | stellar.toml | Service & asset discovery file | Every Stellar service must serve one |
| 6 | Transfer API | Programmatic (non-interactive) deposit/withdraw | Server-to-server, no UI needed |
| 10 | Web Auth | Challenge-response authentication | Required before any SEP-6/24/31/38 call |
| 12 | KYC API | Submit and query customer identity data | Anchor requires KYC verification |
| 24 | Interactive Transfer | Hosted deposit/withdraw via popup/iframe | User must fill forms, 2FA, or bank input |
| 31 | Cross-Border | Anchor-to-anchor international payments | Sender in country A → recipient in country B |
| 38 | Quote API | Get exchange rates and firm quotes | Need price before committing to trade |
| 41 | Token Interface | Standard Soroban token contract (SAC) | Building or interacting with Soroban tokens |
| 45 | Web Auth (Contracts) | SEP-10 for contract accounts (C...) | Smart Account wallet auth with anchors |
| 46 | Contract Metadata | Embed metadata in WASM files | Publishing contracts with self-describing metadata |
| 48 | Interface Discovery | Contracts declare implemented interfaces | Runtime interface detection |
| 49 | Upgradeable Contracts | Contract upgrade patterns | Deploying contracts that need future upgrades |
| 50 | NFTs | Non-fungible token standard on Soroban | Building NFTs, building on SEP-41 |
| 55 | Build Verification | Verify deployed WASM matches source | Proving a contract's build provenance |

### Circle USDC issuers

| Network | Issuer |
|---------|--------|
| Mainnet | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| Testnet | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

Verify: https://developers.circle.com/stablecoins/usdc-contract-addresses

---

## Key SEP details

### SEP-10 — Challenge-response authentication

Prerequisite for SEP-6, SEP-24, SEP-31, SEP-38. Proves keypair ownership without on-chain transaction.

```
1. Client → GET /auth?account=G...           → Challenge XDR
2. Client signs challenge                    → No broadcast
3. Client → POST /auth { transaction: XDR }  → JWT
4. JWT in Authorization header               → All subsequent calls
```

```javascript
import { TransactionBuilder, Keypair } from "@stellar/stellar-sdk";

const res = await fetch(`https://api.anchor.com/auth?account=${publicKey}`);
const { transaction, network_passphrase } = await res.json();

const tx = TransactionBuilder.fromXDR(transaction, network_passphrase);
tx.sign(Keypair.fromSecret(secret));

const authRes = await fetch("https://api.anchor.com/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ transaction: tx.toXDR() }),
});
const { token } = await authRes.json();
// token is a JWT — use as: Authorization: Bearer <token>
```

Multisig: collect all signatures before submitting the challenge.

### SEP-6 — Programmatic deposit/withdraw

Server-to-server, no UI. All interaction via API.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/info` | GET | Supported assets, fees, fields |
| `/deposit` | GET | Start deposit (returns instructions) |
| `/withdraw` | GET | Start withdrawal (returns Stellar address + memo) |
| `/transaction` | GET | Poll status: `pending_external` → `completed` / `error` |

```javascript
const withdrawal = await fetch(
  `${server}/withdraw?` + new URLSearchParams({
    asset_code: "USDC", type: "bank_account",
    dest: "agencia/conta", dest_extra: "0001/12345-6", amount: "500",
  }),
  { headers: { Authorization: `Bearer ${jwt}` } }
).then(r => r.json());
// withdrawal.account_id, withdrawal.memo — include in payment
```

### SEP-24 — Hosted interactive transfer

User interacts with anchor's UI (popup/iframe). Needed for KYC, 2FA, bank forms.

| Step | Action |
|------|--------|
| 1 | `POST /transactions/deposit/interactive` → get URL |
| 2 | Open URL in popup/iframe → user completes flow |
| 3 | `GET /transaction?id=...` → poll until `completed` |

```javascript
const res = await fetch(`${server}/transactions/deposit/interactive`, {
  method: "POST",
  headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  body: JSON.stringify({ asset_code: "USDC", account: pubKey, amount: "100" }),
}).then(r => r.json());
window.open(res.url, "_blank", "width=600,height=700");
```

### SEP-38 — Quote API

Get exchange rates before transacting. Quotes are binding for a limited time.

| Endpoint | Purpose |
|----------|---------|
| `GET /prices` | Available pairs for a sell asset |
| `GET /price` | Indicative rate (non-binding) |
| `POST /quote` | Firm quote (binding, returns `quote.id`) |

```javascript
const quote = await fetch(`${server}/quote`, {
  method: "POST",
  headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    sell_asset: `stellar:USDC:${USDC_ISSUER}`,
    buy_asset: "iso4217:BRL", sell_amount: "100",
  }),
}).then(r => r.json());
// quote.id → pass to SEP-6/24/31 · quote.expires_at → quote expiry
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| No `stellar.toml` served | Wallets/clients cannot discover your endpoints — SEP-1 is mandatory |
| SEP-10 challenge expired | `tx_too_late` — challenges have ±15 min time bounds, re-fetch |
| Missing memo on withdrawal payment | Anchor cannot identify payment → funds may be lost |
| SEP-24 popup blocked | Browser blocks `window.open` without user gesture — require click handler |
| SEP-31 sender/receiver not SEP-12 verified | Transaction rejected — both parties need KYC on file |
| Quote expired before use | SEP-38 quote must be refreshed — use within `expires_at` |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `tx_too_late` | Challenge expired | Re-fetch challenge from `/auth` |
| `tx_bad_seq` | Reused sequence in challenge | Each challenge must be a new transaction |
| CORS blocked | Missing `Access-Control-Allow-Origin: *` | Add CORS headers to all endpoints + `stellar.toml` |
| JWT expired | Token past expiry | Re-authenticate via SEP-10 |
| `not_found` on `/info` | Wrong `TRANSFER_SERVER` URL | Parse `stellar.toml` to get correct endpoint |
| `invalid_asset` | Asset not supported by anchor | Check `/info` for supported asset codes |

---

## See also

- `/assets/SKILL.md` — SEP-41 / SAC token interface details
- `/accounts/SKILL.md` — Keypairs, signers, multisig (needed for SEP-10 multisig flows)
- [SEP specifications](https://github.com/stellar/stellar-protocol/tree/master/ecosystem) — authoritative source for all SEPs

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/seps — MIT License*

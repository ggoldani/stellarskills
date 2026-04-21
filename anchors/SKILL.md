---
name: stellarskills-anchors
description: Fiat on/off-ramps on Stellar. Integration flows, stellar.toml, and the anchor ecosystem.
---

# STELLARSKILLS — Anchors

> Fiat on/off-ramps on Stellar. Integration flows, stellar.toml, and the anchor ecosystem.

---

## When to use

- Integrating fiat deposit/withdrawal into a wallet or app
- Reading an anchor's endpoints and supported assets (`stellar.toml`)
- Building an anchor (issuing fiat-backed tokens on-chain)
- Working with cross-border payments or exchange rate quotes

---

## Quick reference

| SEP | Purpose | When to use |
|-----|---------|-------------|
| SEP-1 | `stellar.toml` — discover anchor endpoints and assets | First step in any anchor integration |
| SEP-10 | Auth — prove keypair ownership via signed challenge | Before calling any protected anchor API |
| SEP-24 | Hosted deposit/withdrawal — anchor provides web UI for KYC and banking | Most wallets; simplest integration path |
| SEP-6 | Programmatic deposit/withdrawal — pure API, no anchor UI | Full control over UX, no iframe |
| SEP-12 | KYC API — submit user identity data programmatically | SEP-6 flows; pre-KYC before deposit/withdrawal |
| SEP-31 | Cross-border payments — anchor-to-anchor remittance | B2B or remittance use cases |
| SEP-38 | Quotes — get exchange rates before transferring | Multi-currency flows needing upfront rates |

---

## stellar.toml (SEP-1)

Entry point for any anchor integration. Hosted at `https://<domain>/.well-known/stellar.toml`.

```toml
ACCOUNTS = "GCNZ...anchor_issuing,GABC...anchor_distribution"
TRANSFER_SERVER_SEP0024 = "https://api.example.com/sep24"
WEB_AUTH_ENDPOINT = "https://api.example.com/auth"
KYC_SERVER = "https://api.example.com/sep12"
```

Read at runtime:
```javascript
import { StellarToml } from "@stellar/stellar-sdk";
const toml = await StellarToml.Resolver.resolve("example.com");
toml.TRANSFER_SERVER_SEP0024;  // "https://api.example.com/sep24"
```

---

## SEP-24 flow (hosted deposit/withdrawal)

Standard wallet integration. Anchor provides the UI — you orchestrate the API calls.

1. **Discovery** — resolve `stellar.toml` → `TRANSFER_SERVER_SEP0024`
2. **Auth** — SEP-10 challenge → JWT
3. **Initiate** — `POST /transactions/deposit/interactive` (or `/withdraw`)
4. **UI** — open returned `url` in browser/webview (user completes KYC + banking details)
5. **Poll** — `GET /transaction?id=...` with JWT until status is `completed`

```javascript
const response = await fetch(
  `${transferServer}/transactions/deposit/interactive`,
  { method: "POST", headers: { Authorization: `Bearer ${jwt}` }, body }
);
const { url, id } = await response.json();
// Open url in webview, then poll GET /transaction?id=${id}
```

---

## SEP-10 authentication

Prove ownership of a Stellar keypair by signing a challenge. Returns a JWT for subsequent API calls.

```javascript
import { Sep10 } from "@stellar/stellar-sdk";

const challenge = await Sep10.getChallenge(
  "https://api.example.com/auth", serverKeypair.publicKey(), clientPublicKey
);
const signedChallenge = clientKeypair.sign(challenge);
const { token } = await Sep10.verifyChallenge(
  "https://api.example.com/auth", signedChallenge, serverKeypair
);
```

---

## Withdrawal memos

When withdrawing tokens back to an anchor, the payment **must include a memo** (usually Memo ID or Hash) from the anchor's API. Anchors use a single receiving account — the memo identifies which user gets the fiat.

**Missing memo = lost funds.**

```javascript
const tx = new TransactionBuilder(account, { fee: BASE_FEE })
  .addOperation(Operation.payment({
    destination: anchorAccountId,
    asset: anchorAsset,
    amount: "100",
  }))
  .addMemo(Memo.text(withdrawalResponse.memo))
  .build();
```

---

## Building an anchor

SDF maintains the **Anchor Platform** (Java SDK) — production-ready implementation of SEP-1, 6, 10, 12, 24, 31, 38.

```
GitHub:  https://github.com/stellar/java-stellar-anchor-sdk
Docs:    https://developers.stellar.org/docs/platforms/anchor-platform
```

Note: the legacy Python reference implementation (Polaris) is no longer recommended by SDF.

Stellar docs now use "Ramps (anchors)" as the primary term in newer pages.

---

## Trustlines

A user cannot receive an anchor's token without a trustline to that issuer. If the anchor sends tokens before the trustline exists, the payment fails (`op_no_trust`).

Many anchors sponsor the trustline reserve or require wallet-side trustline creation before the deposit completes.

---

## Finding anchors

- **Stellar Expert:** `https://stellar.expert/explorer/public/asset` — filter by verified issuers
- **MoneyGram Access:** fiat on/off-ramp integration — see Stellar docs for tutorial
- **Stellar Disbursement Platform (SDP):** SDF bulk payment infrastructure for enterprises

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Withdrawal payment without memo | Funds sent to anchor but cannot be matched to user — effectively lost |
| No trustline when anchor sends tokens | `op_no_trust` — anchor payment fails |
| SEP-10 challenge expired | Auth fails — re-fetch and re-sign the challenge |
| Anchor returns `pending_user_transfer_start` | User must send tokens on-chain before anchor wires fiat (withdrawal) |
| Wrong `TRANSFER_SERVER` vs `TRANSFER_SERVER_SEP0024` | Endpoint mismatch — SEP-24 calls fail with 404 |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_no_trust` | Recipient lacks trustline to issuer | Create trustline before initiating deposit |
| `tx_failed` (missing memo) | Withdrawal sent without memo | Always attach memo from anchor's withdrawal response |
| 401 on SEP-24 endpoints | Missing or expired JWT | Re-authenticate via SEP-10 |
| 404 on interactive URL | Wrong `TRANSFER_SERVER_SEP0024` or anchor misconfigured | Verify `stellar.toml` and use correct endpoint |
| KYC required during SEP-24 | Anchor needs identity verification | Redirect user to interactive URL to complete KYC |

---

## See also

- `/seps/SKILL.md` — full SEP technical details and protocol specs
- `/accounts/SKILL.md` — trustlines, signers, and account setup
- Official docs: [Anchors](https://developers.stellar.org/docs/learn/fundamentals/anchors)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/anchors — MIT License*

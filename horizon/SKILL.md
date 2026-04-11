---
name: stellarskills-horizon
description: Stellar legacy REST API (Horizon) for classic protocol data. Prefer Stellar RPC for new integrations.
---

# STELLARSKILLS — Horizon API

> Legacy REST API for Stellar classic protocol — accounts, payments, offers, transaction submission. Prefer **Stellar RPC** for new projects.

---

## When to use

- Maintaining existing systems that already use Horizon REST endpoints
- Querying classic protocol data (payments, effects, operations, order books)
- Streaming real-time events via Server-Sent Events
- Submitting classic (non-Soroban) transactions
- **Legacy only** — prefer Stellar RPC for new integrations; Horizon is not needed for Soroban smart contracts

---

## Quick reference

| Endpoint | Method | Purpose | Key params |
|----------|--------|---------|------------|
| `/accounts/{id}` | GET | Account state (balances, signers, seq) | — |
| `/transactions` | GET | List transactions | `forAccount`, `forLedger`, `order`, `limit` |
| `/transactions/{hash}` | GET | Single transaction by hash | — |
| `/operations` | GET | List operations | `forAccount`, `forTransaction` |
| `/payments` | GET | List payments (deposit/withdraw/create) | `forAccount`, `order` |
| `/effects` | GET | List effects (balance changes, trustline events) | `forAccount` |
| `/assets` | GET | Asset details (supply, holders, flags) | `forCode`, `forIssuer` |
| `/accounts` | GET (filtered) | Accounts holding an asset | `forAsset` |
| `/order_book` | GET | DEX order book (bids/asks) | `selling_asset`, `buying_asset` |
| `/offers` | GET | Offers from an account | `forAccount` |
| `/ledgers` | GET | Ledger metadata (fees, close time) | `order`, `limit` |
| `/fee_stats` | GET | Current network fee statistics | — |
| `/transactions` | POST | Submit transaction | XDR envelope in body |

| Network | URL |
|---------|-----|
| Mainnet | `https://horizon.stellar.org` |
| Testnet | `https://horizon-testnet.stellar.org` |

---

## Key patterns

### SDK setup

```javascript
import { Horizon, Networks, Keypair, TransactionBuilder,
  Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");
// npm install @stellar/stellar-sdk  # verify: https://github.com/stellar/js-stellar-sdk/releases
```

### Load account

```javascript
const account = await server.loadAccount(publicKey);
// .id, .sequence, .balances, .signers, .thresholds, .flags, .subentry_count
```

### Submit transaction

```javascript
const account = await server.loadAccount(keypair.publicKey());
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE, networkPassphrase: Networks.MAINNET,
})
  .addOperation(Operation.payment({
    destination: recipientPublicKey,
    asset: Asset.native(), amount: "10",
  }))
  .setTimeout(30).build();
tx.sign(keypair);
```

```javascript
try {
  const result = await server.submitTransaction(tx);
  console.log("Hash:", result.hash);
} catch (e) {
  console.error("Result codes:", e.response?.data?.extras?.result_codes);
}
```

Check `extras.result_codes` on failure — tells which operation failed and why.

### Transactions — list and paginate

```javascript
const txs = await server
  .transactions()
  .forAccount(publicKey)
  .order("desc").limit(20).call();

const page = await txs.next();  // cursor-based pagination
```

### Operations, payments, effects

```javascript
// Operations for an account
const ops = await server.operations()
  .forAccount(publicKey).order("desc").limit(50).call();

// Payments for an account
const payments = await server.payments()
  .forAccount(publicKey).order("desc").limit(20).call();

// Effects for an account
const effects = await server.effects()
  .forAccount(publicKey).order("desc").limit(20).call();
```

One transaction = up to 100 operations. Payments include `payment`, `path_payment_strict_send`, `path_payment_strict_receive`, `create_account`.

### Streaming (Server-Sent Events)

```javascript
const close = server.payments()
  .forAccount(publicKey)
  .cursor("now")
  .stream({
    onmessage: (p) => console.log(p.amount, p.asset_code ?? "XLM"),
    onerror: (err) => console.error(err),  // implement reconnect
  });
close();  // stop
```

Works on: transactions, operations, payments, effects, ledgers, offers.

### Order book & offers

```javascript
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses

const book = await server.orderbook(
  new Asset("USDC", USDC_ISSUER), Asset.native()
).call();

const offers = await server.offers().forAccount(publicKey).call();
```

### Fee stats & fee bump

```javascript
const stats = await server.feeStats();
// .last_ledger_base_fee, .fee_charged.p50, .fee_charged.p99

const feeBump = TransactionBuilder.buildFeeBumpTransaction(
  feeSourceKeypair, "10000", innerTx, Networks.MAINNET
);
feeBump.sign(feeSourceKeypair);
await server.submitTransaction(feeBump);
```

Use `p99` fee or fee bump during surge pricing.

### Memos

```javascript
import { Memo } from "@stellar/stellar-sdk";

// Text (28 bytes max)
.addMemo(Memo.text("user-id-12345"))
// ID (uint64)
.addMemo(Memo.id("9876543210"))
// Hash (32 bytes)
.addMemo(Memo.hash(Buffer.from(hashHex, "hex")))
```

Required by exchanges and anchors in SEP-6/24/31 flows.

### Fetch all pages

```javascript
async function fetchAll(builder) {
  const results = [];
  let page = await builder.limit(200).call();
  while (page.records.length > 0) {
    results.push(...page.records);
    page = await page.next();
  }
  return results;
}
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| SDF-hosted Horizon historical data | Truncated to ~1 year (since Aug 2024) — use third-party providers for longer history |
| Unfunded address in `loadAccount` | 404 — account must be created/funded first |
| Concurrent txs from same account | `tx_bad_seq` on the second — re-fetch sequence between submissions |
| Stream connection drops | No automatic reconnect — implement retry logic with backoff |
| Transaction with `setTimeout(30)` | Fails after 30 seconds if not included — use `tx_too_late` error handling |
| `op_no_trust` on payment | Recipient needs a trustline for the asset before receiving |
| `op_line_full` on payment | Recipient's trustline limit reached — must increase limit first |
| Muxed address (M...) as recipient | Credits the base G... account — muxed is a label, not a separate wallet |

---

## Common errors

| HTTP | Code | Cause | Fix |
|------|------|-------|-----|
| 400 | `tx_bad_seq` | Wrong/reused sequence number | Reload account before building tx |
| 400 | `tx_insufficient_fee` | Fee too low during surge | Check `feeStats`, use `p99` or fee bump |
| 400 | `op_underfunded` | Insufficient balance for payment + fees | Check balance minus min reserve + fees |
| 400 | `op_no_destination` | Recipient account doesn't exist | Use `createAccount` first |
| 400 | `op_no_trust` | No trustline for the asset | Recipient must add trustline |
| 400 | `op_line_full` | Trustline balance at limit | Increase trustline limit |
| 400 | `tx_too_late` / `tx_too_early` | Tx outside time bounds | Adjust `setTimeout` or `minTime`/`maxTime` |
| 504 | timeout | Network congestion | Resubmit or use fee bump transaction |

---

## See also

- `/rpc/SKILL.md` — Stellar RPC (preferred for new projects, required for Soroban)
- `/accounts/SKILL.md` — account creation, multisig, sponsorship, muxed accounts
- [Migrate Horizon → RPC](https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc) — official migration guide

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/horizon — MIT License*

---
name: stellarskills-horizon
description: Horizon REST API — accounts, transactions, effects, streaming
---

# STELLARSKILLS — Horizon API

> Stellar's REST API for accounts, transactions, operations, effects, order books, streaming. Not for Soroban — see /rpc/SKILL.md for smart contracts.

---

## What is Horizon?

Horizon is the REST API gateway to the Stellar network. It serves the **classic protocol** — accounts, payments, offers, trustlines, and transaction submission. For **Soroban smart contracts**, use the Soroban RPC instead (see `/rpc/SKILL.md`).

| Horizon | Soroban RPC |
|---------|-------------|
| Accounts, payments, offers, assets | Smart contract simulation and invocation |
| Historical transaction data | Contract state, ledger entries |
| Stellar DEX order book | Events from contracts |
| Submit classic transactions | Submit Soroban transactions |

---

## Endpoints

| Network | URL |
|---------|-----|
| Mainnet | `https://horizon.stellar.org` |
| Testnet | `https://horizon-testnet.stellar.org` |

SDF runs these for free with rate limits. For production, use a dedicated Horizon instance or provider (Blockdaemon, Validation Cloud, etc.).

---

## JavaScript SDK Setup

```javascript
import { Horizon, Networks, Keypair, TransactionBuilder, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");
// or testnet:
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
```

---

## Load Account

```javascript
const account = await server.loadAccount(publicKey);

// account fields:
account.id                // G... address
account.sequence          // sequence number (string)
account.balances          // array of balances
account.signers           // array of signers
account.thresholds        // low/med/high
account.flags             // auth flags
account.subentry_count    // number of subentries
account.home_domain       // set domain
account.data_attr         // account data entries (base64 encoded values)
```

---

## Submit a Transaction

```javascript
const keypair = Keypair.fromSecret(process.env.SECRET);
const account = await server.loadAccount(keypair.publicKey());

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.MAINNET,
})
  .addOperation(Operation.payment({
    destination: recipientPublicKey,
    asset: Asset.native(),
    amount: "10",
  }))
  .setTimeout(30)
  .build();

tx.sign(keypair);

try {
  const result = await server.submitTransaction(tx);
  console.log("Hash:", result.hash);
} catch (e) {
  const extras = e.response?.data?.extras;
  console.error("Result codes:", extras?.result_codes);
  // { transaction: "tx_failed", operations: ["op_underfunded"] }
}
```

### Always check result_codes on failure
Horizon wraps Stellar protocol errors. The `extras.result_codes` field tells you exactly which operation failed and why.

---

## Transactions

### Fetch a transaction by hash
```javascript
const tx = await server.transactions().transaction(hash).call();
console.log(tx.successful);
console.log(tx.envelope_xdr);  // raw XDR
console.log(tx.result_xdr);
```

### List transactions for an account
```javascript
const txs = await server
  .transactions()
  .forAccount(publicKey)
  .order("desc")
  .limit(20)
  .call();

// Paginate
const nextPage = await txs.next();
```

### Filter by ledger
```javascript
const txs = await server
  .transactions()
  .forLedger(ledgerSequence)
  .call();
```

---

## Operations

Operations are the individual actions inside a transaction. One transaction can have up to 100 operations.

```javascript
// List operations for an account
const ops = await server
  .operations()
  .forAccount(publicKey)
  .order("desc")
  .limit(50)
  .call();

ops.records.forEach(op => {
  console.log(op.type);        // payment, create_account, change_trust, etc.
  console.log(op.created_at);
  // type-specific fields:
  if (op.type === "payment") {
    console.log(op.from, op.to, op.amount, op.asset_type);
  }
});
```

### List operations for a transaction
```javascript
const ops = await server.operations().forTransaction(txHash).call();
```

---

## Payments

```javascript
// All payments for an account (deposits + withdrawals)
const payments = await server
  .payments()
  .forAccount(publicKey)
  .order("desc")
  .limit(20)
  .call();

// Includes: payment, path_payment_strict_send, path_payment_strict_receive, create_account
payments.records.forEach(p => {
  console.log(p.type, p.amount, p.asset_code ?? "XLM", p.from, p.to);
});
```

---

## Effects

Effects are the side-effects of operations — balance changes, trustline created, etc.

```javascript
const effects = await server
  .effects()
  .forAccount(publicKey)
  .order("desc")
  .limit(20)
  .call();

effects.records.forEach(e => {
  console.log(e.type);  // account_credited, account_debited, trustline_created, etc.
  console.log(e.amount, e.asset_type);
});
```

---

## Assets

### Find all accounts holding an asset
```javascript
const accounts = await server
  .accounts()
  .forAsset(new Asset("USDC", USDC_ISSUER))
  .limit(200)
  .call();
```

### Get asset details
```javascript
const assets = await server
  .assets()
  .forCode("USDC")
  .forIssuer(USDC_ISSUER)
  .call();

const asset = assets.records[0];
console.log(asset.amount);          // total supply
console.log(asset.num_accounts);    // accounts with trustline
console.log(asset.flags);           // issuer flags
```

---

## Order Book

```javascript
const orderBook = await server.orderbook(
  new Asset("USDC", USDC_ISSUER),  // base asset
  Asset.native()                    // counter asset (XLM)
).call();

console.log(orderBook.bids);  // [{price, amount}, ...]
console.log(orderBook.asks);
```

---

## Offers

```javascript
// Offers from an account
const offers = await server
  .offers()
  .forAccount(publicKey)
  .call();

offers.records.forEach(offer => {
  console.log(offer.id, offer.selling, offer.buying, offer.price, offer.amount);
});
```

---

## Ledgers

```javascript
// Latest ledger
const latest = await server.ledgers().order("desc").limit(1).call();
const ledger = latest.records[0];
console.log(ledger.sequence);
console.log(ledger.closed_at);
console.log(ledger.base_fee_in_stroops);
console.log(ledger.base_reserve_in_stroops);
```

---

## Streaming (Server-Sent Events)

Horizon supports real-time streaming for most endpoints. Streams are persistent HTTP connections.

```javascript
// Stream payments to an account
const close = server
  .payments()
  .forAccount(publicKey)
  .cursor("now")                    // start from current time
  .stream({
    onmessage: (payment) => {
      console.log("New payment:", payment.amount, payment.asset_code ?? "XLM");
    },
    onerror: (err) => {
      console.error("Stream error:", err);
      // Reconnect logic here
    },
  });

// To stop streaming:
close();
```

```javascript
// Stream all transactions
server.transactions().cursor("now").stream({ onmessage: (tx) => {
  console.log(tx.hash);
}});

// Stream ledgers
server.ledgers().cursor("now").stream({ onmessage: (ledger) => {
  console.log(ledger.sequence, ledger.closed_at);
}});
```

**Important**: Always implement reconnection logic for production streams. The connection can drop.

---

## Fee Stats

Check current network fees before setting fee in transactions:

```javascript
const feeStats = await server.feeStats();

console.log(feeStats.last_ledger_base_fee);          // current base fee in stroops
console.log(feeStats.fee_charged.p50);               // median fee charged
console.log(feeStats.fee_charged.p99);               // 99th percentile (surge pricing)
```

For surge pricing protection, set fee to `p99` or use a fee bump transaction.

---

## Fee Bump Transactions

A fee bump lets you wrap an existing transaction to pay a higher fee — useful to rescue a stuck transaction or sponsor fees for another account.

```javascript
import { FeeBumpTransaction, TransactionBuilder } from "@stellar/stellar-sdk";

const feeBump = TransactionBuilder.buildFeeBumpTransaction(
  feeSourceKeypair,        // who pays the fee
  "10000",                 // new fee (in stroops, per operation)
  innerTransaction,        // original transaction (already signed)
  Networks.MAINNET
);

feeBump.sign(feeSourceKeypair);
await server.submitTransaction(feeBump);
```

---

## Pagination Pattern

All collection endpoints support cursor-based pagination:

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

const allTxs = await fetchAll(
  server.transactions().forAccount(publicKey).order("asc")
);
```

---

## Memos

Memos attach metadata to transactions. Required by many exchanges and anchors.

```javascript
import { Memo } from "@stellar/stellar-sdk";

// Text memo (up to 28 bytes)
.addMemo(Memo.text("user-id-12345"))

// ID memo (uint64)
.addMemo(Memo.id("9876543210"))

// Hash memo (32 bytes)
.addMemo(Memo.hash(Buffer.from(hashHex, "hex")))
```

**Always include the memo type and value specified by an anchor in SEP-6/24/31 flows.**

---

## Common Errors

| HTTP | Code | Cause |
|------|------|-------|
| 400 | `tx_bad_seq` | Wrong sequence number — reload account |
| 400 | `tx_insufficient_fee` | Fee too low — check fee_stats |
| 400 | `op_underfunded` | Insufficient balance |
| 400 | `op_no_destination` | Recipient account doesn't exist |
| 400 | `op_no_trust` | No trustline for asset |
| 400 | `op_line_full` | Trustline at limit |
| 400 | `tx_too_late` / `tx_too_early` | Transaction expired or time bounds wrong |
| 504 | timeout | Network congestion — resubmit or use fee bump |

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/horizon — MIT License*

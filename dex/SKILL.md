# STELLARSKILLS — DEX & AMM

> Stellar's built-in order book, Automated Market Makers (AMM), Liquidity Pools, and Path Payments.

---

## The Built-in DEX

Stellar is unique among layer-1s: it has an order book natively built into the protocol. You don't need a smart contract (like Uniswap) to trade assets; it's a core protocol operation.

Features:
- Completely on-chain limit order book.
- No front-running via mempool (transactions apply deterministically).
- Trades execute immediately if they cross the spread.

### Create an Offer (Limit Order)

Use `ManageBuyOffer` or `ManageSellOffer`. They are effectively identical, just framed differently (I want to buy X vs I want to sell Y).

```javascript
import { Operation, Asset } from "@stellar/stellar-sdk";

const USDC = new Asset("USDC", "GA5...");
const XLM = Asset.native();

// "I want to sell 100 USDC to buy XLM at a price of 10 XLM per USDC"
const sellOffer = Operation.manageSellOffer({
  selling: USDC,
  buying: XLM,
  amount: "100",          // Amount of USDC I'm selling
  price: "10.0",          // 10 XLM / 1 USDC
  offerId: "0",           // 0 means create a new offer
});
```

### Update or Cancel an Offer

To update, provide the existing `offerId`.
To cancel, update the offer but set `amount: "0"`.

```javascript
const cancelOffer = Operation.manageSellOffer({
  selling: USDC,
  buying: XLM,
  amount: "0",            // Cancel
  price: "10.0",          // Price must still match original
  offerId: "12345",       // ID from previous transaction effect
});
```

---

## Automated Market Makers (AMM) / Liquidity Pools

Stellar also supports protocol-level AMMs. Users can provide liquidity to pools (CPMM: $x \times y = k$) and earn a 0.3% protocol fee on swaps.

### Get a Liquidity Pool ID

Pools are identified by a deterministic hash of their assets and fee.

```javascript
import { LiquidityPoolAsset } from "@stellar/stellar-sdk";

// Pool for XLM / USDC (assets must be sorted lexicographically)
const lpAsset = new LiquidityPoolAsset(Asset.native(), USDC, LiquidityPoolFeeV18);
const poolId = lpAsset.getLiquidityPoolId();
```

### Provide Liquidity (Deposit)

```javascript
const deposit = Operation.liquidityPoolDeposit({
  liquidityPoolId: poolId,
  maxAmountA: "100",      // Max XLM willing to deposit
  maxAmountB: "10",       // Max USDC willing to deposit
  minPrice: "9.5",        // Slippage protection: min A/B price
  maxPrice: "10.5",       // Slippage protection: max A/B price
});
```

### Withdraw Liquidity

```javascript
const withdraw = Operation.liquidityPoolWithdraw({
  liquidityPoolId: poolId,
  amount: "50",           // Amount of pool shares to redeem
  minAmountA: "90",       // Slippage: minimum XLM to receive
  minAmountB: "9",        // Slippage: minimum USDC to receive
});
```

---

## Path Payments (Swaps)

Path payments are the most powerful DEX feature. They allow an account to send Asset A, route it through the DEX (order books or AMMs), and deliver Asset B to the recipient — all in one atomic transaction.

**If the DEX cannot satisfy the exchange rate requested, the entire transaction fails.**

### Strict Send (Known Input, Variable Output)

"I want to spend exactly 10 USDC, give the recipient as much BRL as possible."

```javascript
const strictSend = Operation.pathPaymentStrictSend({
  sendAsset: USDC,
  sendAmount: "10.0",           // Exactly 10 USDC spent
  destination: recipientKey,
  destAsset: BRL,
  destMin: "45.0",              // Slippage: tx fails if recipient gets < 45 BRL
  path: [],                     // Optional intermediary assets
});
```

### Strict Receive (Variable Input, Known Output)

"The recipient must receive exactly 50 BRL, spend as little of my USDC as possible."

```javascript
const strictReceive = Operation.pathPaymentStrictReceive({
  sendAsset: USDC,
  sendMax: "11.0",              // Slippage: tx fails if costs > 11 USDC
  destination: recipientKey,
  destAsset: BRL,
  destAmount: "50.0",           // Exactly 50 BRL received
  path: [],                     // Optional intermediary assets
});
```

### Path Finding

You usually don't need to specify the `path` array manually. Let Horizon find the best path across order books and AMMs.

```javascript
const server = new Horizon.Server("https://horizon.stellar.org");

// Find best path for a Strict Receive
const paths = await server.strictReceivePaths({
  sourceAssets: [USDC, XLM],    // What assets do I have to spend?
  destinationAsset: BRL,
  destinationAmount: "50.0",
}).call();

const bestPath = paths.records[0];
console.log(`Spend ${bestPath.source_amount} of ${bestPath.source_asset_code}`);
console.log(`Path:`, bestPath.path);
```

Pass `bestPath.path` into the `path` array of your Operation.

---

## Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `op_underfunded` | Not enough asset to create offer or swap | Check balances |
| `op_cross_self` | Trying to match against your own offer | Cancel existing offer first |
| `op_over_source_max` | (Strict Receive) Slippage hit, cost too high | Adjust `sendMax` |
| `op_under_dest_min` | (Strict Send) Slippage hit, output too low | Adjust `destMin` |
| `op_no_trust` | Recipient lacks trustline for destination asset | Recipient must `changeTrust` |

---

*stellarskills.vercel.app/dex — MIT License*

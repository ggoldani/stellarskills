---
name: stellarskills-dex
description: Stellar native DEX: order books, AMM pools, liquidity management, path payments.
---

# STELLARSKILLS — DEX

> Stellar native DEX: order books, AMM pools, liquidity management, path payments.

---

## When to use

- Trading assets on-chain via limit orders or AMM swaps
- Providing or withdrawing liquidity from AMM pools
- Executing path payments (A → intermediary → B) in one atomic tx
- Finding optimal swap routes across order books and pools
- Canceling or updating existing offers

---

## Quick reference

| Mechanism | Operation | Key detail |
|-----------|-----------|------------|
| Sell offer | `manageSellOffer` | Sell X, buy Y at `price` (Y/X) |
| Buy offer | `manageBuyOffer` | Buy Y, sell X at `price` (Y/X) |
| Cancel offer | `manageSellOffer` amount=0 | Must match original `offerId` + `price` |
| AMM deposit | `liquidityPoolDeposit` | Max amounts + price range for slippage |
| AMM withdraw | `liquidityPoolWithdraw` | Pool shares → min amounts out |
| Path send | `pathPaymentStrictSend` | Fixed input, variable output (`destMin`) |
| Path receive | `pathPaymentStrictReceive` | Fixed output, variable input (`sendMax`) |
| Find paths | Horizon `strictReceivePaths` | Returns sorted routes; pass `.path` to op |

DEX on Stellar is native protocol — no smart contracts needed. Trades are deterministic (no mempool front-running).

---

## Order books

Limit orders (offers) are core protocol operations. Two framing modes, identical mechanism.

### Create a sell offer

```javascript
import { Operation, Asset } from "@stellar/stellar-sdk";

const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // verify: https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC = new Asset("USDC", USDC_ISSUER_MAINNET);
const XLM = Asset.native();

const sellOffer = Operation.manageSellOffer({
  selling: USDC, buying: XLM,
  amount: "100",     // USDC to sell
  price: "10.0",     // XLM per USDC
  offerId: "0",      // 0 = new offer
});
```

### Cancel an offer

```javascript
const cancelOffer = Operation.manageSellOffer({
  selling: USDC, buying: XLM,
  amount: "0",       // cancel
  price: "10.0",     // must match original
  offerId: "12345",  // from previous tx effect
});
```

---

## AMM liquidity pools

Constant-product AMM (`x × y = k`) built into the protocol. Pools identified by deterministic hash of (assetA, assetB, fee).

### Get pool ID

```javascript
import { LiquidityPoolAsset, LiquidityPoolFeeV18 } from "@stellar/stellar-sdk";

const lpAsset = new LiquidityPoolAsset(Asset.native(), USDC, LiquidityPoolFeeV18);
const poolId = lpAsset.getLiquidityPoolId();
```

### Deposit liquidity

```javascript
const deposit = Operation.liquidityPoolDeposit({
  liquidityPoolId: poolId,
  maxAmountA: "100",   // max XLM to deposit
  maxAmountB: "10",    // max USDC to deposit
  minPrice: "9.5",     // slippage floor (A/B)
  maxPrice: "10.5",    // slippage ceiling (A/B)
});
```

### Withdraw liquidity

```javascript
const withdraw = Operation.liquidityPoolWithdraw({
  liquidityPoolId: poolId,
  amount: "50",        // pool shares to redeem
  minAmountA: "90",    // min XLM received
  minAmountB: "9",     // min USDC received
});
```

---

## Path payments

Send asset A, route through DEX (order books + AMMs), deliver asset B — one atomic transaction. Fails if exchange rate is unsatisfiable.

### Strict send (fixed input)

```javascript
const strictSend = Operation.pathPaymentStrictSend({
  sendAsset: USDC, sendAmount: "10.0",
  destination: recipientKey,
  destAsset: XLM, destMin: "5.0",
  path: [],
});
```

### Strict receive (fixed output)

```javascript
const strictReceive = Operation.pathPaymentStrictReceive({
  sendAsset: USDC, sendMax: "11.0",
  destination: recipientKey,
  destAsset: XLM, destAmount: "50.0",
  path: [],
});
```

### Find swap paths

```javascript
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");
const paths = await server.strictReceivePaths({
  sourceAssets: [USDC, XLM],
  destinationAsset: XLM,
  destinationAmount: "50.0",
}).call();

const bestPath = paths.records[0];
// Pass bestPath.path to the path array in your Operation
```

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Match against own offer | `op_cross_self` — tx fails |
| No trustline for dest asset | `op_no_trust` — recipient needs `changeTrust` |
| Pool deposit exceeds reserves | Partial fill within `maxAmount` bounds |
| Path payment route exhausted mid-tx | Entire tx fails atomically |
| Cancel offer with wrong `offerId` | Creates a new offer instead |
| Offer with price=0 | Rejected — invalid price |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `op_underfunded` | Insufficient balance for offer or swap | Check balances before building tx |
| `op_cross_self` | Matching against your own offer | Cancel existing offer first |
| `op_over_source_max` | Strict receive slippage exceeded | Increase `sendMax` |
| `op_under_dest_min` | Strict send output below threshold | Decrease `destMin` |
| `op_no_trust` | Recipient lacks trustline | Recipient must add `changeTrust` |
| `tx_bad_seq` | Stale sequence number | Re-fetch account before building |

---

## See also

- `/operations/SKILL.md` — full operation builder reference
- `/assets/SKILL.md` — trustlines required to hold non-XLM assets
- [Liquidity on Stellar](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/dex — MIT License*

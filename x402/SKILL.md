---
name: stellarskills-x402
description: Pay-per-API calls for AI Agents on Stellar. Monetize endpoints natively without subscriptions or credit cards using HTTP 402.
---

# STELLARSKILLS — x402 Protocol (Agent Economy)

> Pay-per-API calls for AI Agents on Stellar. Monetize endpoints natively without subscriptions or credit cards using HTTP 402.

> ⚠️ **CUTTING EDGE TECH:** The x402 protocol on Stellar is extremely new. The SDKs and middleware patterns shown here may change rapidly. Always verify against the latest Coinbase/Stellar x402 documentation and contribute updates via PR!

---

## 1. What is x402?

x402 revives the reserved `402 Payment Required` HTTP status code. It allows servers to monetize endpoints per-request and allows clients (especially autonomous AI Agents) to pay for that request natively using digital assets (like USDC) on the Stellar Network.

Instead of a human signing up for a subscription tier and providing a credit card, an AI Agent can dynamically pay 1/100th of a cent via a Stellar micropayment every time it hits your API.

### The Flow
1. **Client** requests a protected resource.
2. **Server** responds with HTTP `402` and payment requirements.
3. **Client** signs a Stellar payment transaction using their keypair (with Soroban auth).
4. **Client** retries the request with the signed payment in the `X-PAYMENT` header.
5. **Server** verifies the payment via a facilitator, settles on Stellar, and returns the resource.

---

## 2. Server Integration (Selling Access)

To protect an API endpoint, use the x402 payment middleware. The middleware intercepts the request and handles the 402 rejection and the subsequent payment verification automatically.

```bash
npm install stellar-x402 express
```

```javascript
import express from 'express';
import { paymentMiddleware } from 'stellar-x402/server';

const app = express();

// Protect a specific route
app.use(
  '/api/premium-data',
  paymentMiddleware({
    // Configuration dictates price and the Stellar address receiving the payment
    token: 'USDC',
    amount: '0.05',
    recipient: process.env.STELLAR_MERCHANT_PUBLIC_KEY
  })
);

app.get('/api/premium-data', (req, res) => {
  // This block only executes if the client successfully paid
  res.json({ secret: "AI agents rule the world" });
});

app.listen(3000);
```

---

## 3. Client Integration (Agent Paying for Access)

If you are writing an AI Agent that needs to consume a paid x402 endpoint, do not handle the `402` retry logic manually. Use the client wrapper.

The client wrapper automatically intercepts `402 Payment Required` responses, parses the cost, uses the Agent's private key to sign a transaction, and transparently retries the request with the `X-PAYMENT` header attached.

```javascript
import { wrapFetchWithPayment } from 'stellar-x402/client-http';
import { Keypair } from '@stellar/stellar-sdk';

// The agent's wallet
const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);

// Wrap the native fetch API
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

async function getPremiumData() {
  try {
    // 1. Initial request (fails with 402)
    // 2. Wrapper automatically signs payment
    // 3. Wrapper automatically retries request with X-PAYMENT header
    // 4. Returns the final 200 OK response
    const response = await fetchWithPayment('https://api.example.com/premium-data');

    const data = await response.json();
    console.log(data); // { secret: "AI agents rule the world" }

  } catch (error) {
    console.error("Payment or network failed:", error);
  }
}
```

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/x402 — MIT License*

---
name: stellarskills-cross-chain
description: Cross-chain integration on Stellar. Circle CCTP for native USDC and Axelar for GMP (General Message Passing) and ITS (Interchain Token Service).
---

# STELLARSKILLS — Cross-Chain

> Cross-chain integration on Stellar. Circle CCTP for native USDC and Axelar for GMP and ITS.

---

## When to use

- Bridging native USDC between Stellar and other chains via Circle CCTP
- Sending messages from a Soroban contract to an EVM chain via Axelar GMP
- Receiving cross-chain messages from other networks in a Soroban contract
- Deploying multichain tokens via Axelar Interchain Token Service (ITS)

---

## Quick reference

| Protocol | Purpose | Key concept |
|----------|---------|-------------|
| **CCTP** | Native USDC transfers | Burn on source, mint on destination |
| **Axelar GMP** | General Message Passing | Contract-to-contract communication |
| **Axelar ITS** | Interchain Token Service | Multichain tokens with unified supply |

---

## Circle CCTP (Cross-Chain Transfer Protocol)

Burns USDC on the source chain and mints on the destination. No wrapped assets or third-party bridges.

### CctpForwarder — mandatory for Stellar

Stellar uses 32-byte addresses that do not distinguish accounts (`G...`) from contracts (`C...`). CCTP assumes `mintRecipient` is always a contract. **You must route through the `CctpForwarder` contract** — set both `mintRecipient` and `destinationCaller` to the forwarder address.

**Failure mode:** if `mintRecipient` points to a user account or muxed address instead of the forwarder, minted USDC is **permanently stuck and unrecoverable**.

### Seven-decimal precision

Stellar USDC uses **7 decimal places**, unlike other CCTP chains (6 decimals). Amounts must be scaled correctly when crossing chains.

### Hook data format

The `CctpForwarder` reads `forwardRecipient` from hook data:

| Bytes | Field | Value |
|-------|-------|-------|
| 0–23 | Magic | All zeros (Circle-reserved) |
| 24–27 | Version | `0` |
| 28–31 | Length | Byte length of `forwardRecipient` strkey |
| 32.. | Recipient | `forwardRecipient` as UTF-8 strkey (`G...`, `C...`, or `M...`) |

### Stellar domain ID

Stellar's CCTP domain ID is `27`.

---

## Axelar GMP (General Message Passing)

Enables Soroban contracts to send and receive messages across chains (Ethereum, Avalanche, Base, Polygon, etc.).

### Outbound (Stellar → other chain)

1. Call `pay_gas()` on the **Gas Service** contract (pays for the full cross-chain transaction)
2. Call `call_contract()` on the **Gateway** contract with destination chain, address, and payload

### Inbound (other chain → Stellar)

1. Axelar relayer triggers `execute()` on the receiving contract
2. Contract must call `validate()` → `validate_message()` on the Gateway to verify the message is authenticated

**Security:** without `validate()`, malicious actors can pass arbitrary data to `execute()`. Always validate before processing.

### Contract interfaces (Rust/Soroban)

```rust
// Gateway — outbound
fn call_contract(
    env: Env,
    caller: Address,
    destination_chain: String,
    destination_address: String,
    payload: Bytes,
)

// Executable trait — inbound (implement on your contract)
fn execute(
    env: Env,
    source_chain: String,
    message_id: String,
    source_address: String,
    payload: Bytes,
)
```

---

## Axelar ITS (Interchain Token Service)

Deploys and manages tokens across multiple chains with unified supply and native-like fungibility.

### Capabilities

- Deploy new interchain tokens across connected chains
- Connect existing Stellar tokens (classic or contract) to other chains
- Transfer tokens cross-chain via `interchain_transfer()`

### Key contracts

| Component | Role |
|-----------|------|
| `InterchainTokenService` | Main interface for cross-chain operations |
| `TokenManager` | Handles mint/burn/lock per chain (one per token) |
| `Gateway` | Routes cross-chain messages |
| `GasService` | Handles cross-chain gas payment |

### Hub mode

All ITS messages route through the **ITS Hub** on the Axelar network — not directly chain-to-chain. Trust is based on a system of **trusted chains** (not trusted addresses as in EVM).

### Flow limits

Operators can set per-token flow limits to control how many tokens move in or out over time periods. Set to `0` to freeze, `None` to remove limits.

---

## Official cautions

- **CctpForwarder is mandatory.** Wrong `mintRecipient` or `destinationCaller` permanently locks funds. No recovery path exists.
- **7 decimal precision on Stellar USDC** vs 6 on other CCTP chains. Incorrect scaling causes silent rounding errors.
- **Always call `validate()` on inbound GMP messages.** Skipping it allows arbitrary data injection.
- **GMP `pay_gas()` must run before `call_contract()`.** Insufficient gas = message stalls on the Axelar network.
- **ITS flow limits are operator-controlled.** Confirm limits are configured before relying on transfer availability.
- CCTP and Axelar on Stellar are relatively new integrations. Verify contract addresses against official docs before production use.

---

## See also

- [CCTP on Stellar — Circle developer docs](https://developers.circle.com/cctp/references/stellar)
- [Axelar Stellar GMP documentation](https://docs.axelar.dev/dev/general-message-passing/stellar-gmp/intro/)
- [Axelar Stellar ITS documentation](https://docs.axelar.dev/dev/send-tokens/stellar/intro/)
- `assets/SKILL.md` — USDC issuer addresses, trustlines, SAC
- `soroban/SKILL.md` — Soroban contract basics for GMP/ITS implementation
- `seps/SKILL.md` — SEP standards for anchor interoperability

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/cross-chain — MIT License*

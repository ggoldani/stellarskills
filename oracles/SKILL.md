---
name: stellarskills-oracles
description: Oracles on Stellar (Soroban). Reflector, Band Protocol, DIA Oracles. Price feeds for smart contracts.
---

# STELLARSKILLS — Oracles

> Oracles on Stellar (Soroban). Reflector, Band Protocol, DIA Oracles. Price feeds for smart contracts.

---

## When to use

- Accessing off-chain price data within Soroban smart contracts.
- Using price feeds for DeFi protocols (lending, synthetic assets, AMMs).
- Verifying external data points in a decentralized manner.

---

## Supported Oracle Providers

### Reflector
Reflector is a price oracle explicitly built for Soroban. It aggregates prices from multiple exchanges and supports the stellar ecosystem uniquely.
- Mainnet DEX: `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`
- Mainnet External (CEX/DEX): `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`
- Mainnet Fiat: `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC`
- Testnet External (CEX/DEX): `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63`

### Band Protocol
Band is a cross-chain data oracle using BandChain.
- Mainnet: `CCQXWMZVM3KRTXTUPTN53YHL272QGKF32L7XEDNZ2S6OSUFK3NFBGG5M`
- Testnet: `CBRV5ZEQSSCQ4FFO64OF46I3UASBVEJNE5C2MCFWVIXL4Z7DMD7PJJMF`

### DIA Oracles
DIA is a cross-chain, trustless oracle network that delivers verifiable price feeds directly from primary markets.
- Testnet: `CAEDPEZDRCEJCF73ASC5JGNKCIJDV2QJQSW6DJ6B74MYALBNKCJ5IFP4`

---

## Example Usage (Reflector)

To use Reflector in a Soroban contract, define the client and invoke the `lastprice` or comparable methods based on the specific oracle's interface.

```rust
// Pseudocode example for consuming an oracle
let client = OracleClient::new(&env, &oracle_address);
let price_data = client.get_price(&Symbol::new(&env, "XLM/USD"));
```

Always check the specific documentation for each provider for precise interface structures.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Outdated price data | The oracle hasn't been updated recently | Check oracle timestamp or use multiple oracles |
| Missing asset feed | The chosen oracle doesn't track this pair | Request custom oracle (DIA) or check other providers |

---

## See Also
- [Official Stellar Oracles Documentation](https://developers.stellar.org/docs/data/oracles)
- [Reflector Oracles Documentation](https://docs.reflector.network)
- [Band Protocol Documentation](https://docs.bandchain.org/)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/oracles — MIT License*

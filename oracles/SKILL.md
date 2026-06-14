---
name: oracles
description: Oracle integrations on Stellar and Soroban. Covers Reflector, Band, DIA, and the SEP-40 consumer interface. Use when a contract needs external price feeds or off-chain data.
user-invocable: true
argument-hint: "[oracle task]"
---

# Oracles on Stellar

> Oracle integrations on Stellar and Soroban. Reflector, Band, DIA, and the SEP-40 consumer interface.

## When to use this skill
- Accessing off-chain price data inside Soroban smart contracts
- Using price feeds for DeFi protocols, RWAs, or synthetic assets
- Choosing an oracle provider or a common consumer interface
- Verifying that a feed is fresh and suitable for on-chain use

## Related skills
- Reading chain state, events, and historical data → `../data-indexers/SKILL.md`
- Building Soroban contracts that consume oracle data → `../soroban/SKILL.md`
- Compliance or privacy-aware flows around oracle data → `../privacy/SKILL.md`

## Oracle providers

### Reflector
Reflector is a price oracle built for Stellar/Soroban. It aggregates prices from multiple sources and supports the SEP-40 consumer interface.
- Mainnet DEX: `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`
- Mainnet External (CEX/DEX): `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`
- Mainnet Fiat: `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC`
- Testnet External (CEX/DEX): `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63`

### Band Protocol
Band is a cross-chain oracle network using BandChain.
- Mainnet: `CCQXWMZVM3KRTXTUPTN53YHL272QGKF32L7XEDNZ2S6OSUFK3NFBGG5M`
- Testnet: `CBRV5ZEQSSCQ4FFO64OF46I3UASBVEJNE5C2MCFWVIXL4Z7DMD7PJJMF`

### DIA Oracles
DIA delivers verifiable price feeds directly from primary markets.
- Testnet: `CAEDPEZDRCEJCF73ASC5JGNKCIJDV2QJQSW6DJ6B74MYALBNKCJ5IFP4`

## SEP-40 consumer interface

SEP-40 is the standard consumer interface for oracle price feeds on Stellar. Prefer it when you want a uniform way to consume or switch oracle providers.

## Example usage (Reflector)

```rust
// Pseudocode example for consuming an oracle
let client = OracleClient::new(&env, &oracle_address);
let price_data = client.get_price(&Symbol::new(&env, "XLM/USD"));
```

Always check the provider docs for exact client methods, feed addresses, and freshness rules.

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Outdated price data | Oracle not updated recently | Check timestamp or use a fallback provider |
| Missing asset feed | Provider doesn't track the pair | Request another feed or another provider |

## See also
- [Official Stellar Oracles Documentation](https://developers.stellar.org/docs/data/oracles)
- [Oracle Providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)
- [SEP-0040](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/oracles — MIT License*

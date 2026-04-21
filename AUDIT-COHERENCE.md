# AUDIT-COHERENCE.md — StellarSkills Coherence Audit

**Date:** 2026-04-11
**Repo:** `~/Documents/Projects/stellarskills` (https://github.com/ggoldani/stellarskills)
**Reference:** Official Stellar docs (developers.stellar.org) + Official Stellar Dev Skill (stellar-dev-skill)

---

## Summary

| Metric | Count |
|--------|-------|
| Total skills | 20 |
| ✅ Coerente | 10 |
| ⚠️ Desatualizado | 10 |
| 🔴 Incorreto | 0 |

**Overall:** No critical errors or incorrect information found. All issues are outdated references, version drift, or minor wording inaccuracies. The repo's factual content about Stellar protocol, SDK patterns, and SEP standards is fundamentally sound.

---

## Systemic Issues (affect multiple skills)

### 1. JS SDK version outdated (v14.6.1 → v15.0.1)
**Severity:** Medium | **Affected skills:** root, frontend, tools

JS SDK v15.0.1 (Protocol 26) was released 2026-03-31 with XDR-breaking changes. Multiple skills reference v14.6.1.

- **Root SKILL.md** says: "e.g. **v14.6.1** as of Mar 2026"
- **Frontend SKILL.md** says: "verify current tag, e.g. **v14.6.1**"
- **Fix:** Update to v15.0.1 and add a note about Protocol 26 breaking changes.

### 2. Horizon "deprecated" label is inaccurate
**Severity:** Low-Medium | **Affected skills:** root, accounts, assets, horizon, fees, why

Skills label Horizon as "deprecated" but the official docs page does not use this word. Horizon is actively maintained with current documentation. A migration guide exists (Horizon → RPC) but that's not the same as deprecation.

- **Fix:** Replace "deprecated" with "legacy" or "not recommended for new integrations — see migration guide".

### 3. Stellar docs URL migration (404s)
**Severity:** Medium | **Affected skills:** anchors, frontend, local-node, tools, seps

The Stellar docs site was restructured. Several URLs in skills return 404:

| Old URL | Status | Fix |
|---------|--------|-----|
| `docs/learn/fundamentals/sep-standard` | 404 | → `docs/learn/fundamentals/stellar-ecosystem-proposals` |
| `docs/run/local-development` | 404 | → `docs/tools/quickstart` |
| `docs/build/reference/stellar-wallets-kit` | 404 | → check Build Applications tutorials |
| `docs/learn/fundamentals/anchors` | Likely changed | → verify under `docs/learn/fundamentals/ramps` |
| `docs/tools/developer-tools/anchor-tools` | Likely 404 | → verify new path |
| `docs/data/rpc/admin-guide` | Changed | → `docs/data/apis/rpc/admin-guide` |
| `docs/build/apps/x402` | Redirected | → `docs/build/agentic-payments/x402` |

### 4. soroban-sdk version 25.3.0 → 25.3.1
**Severity:** Low | **Affected skills:** soroban, testing, openzeppelin

- **Fix:** Pin to `"25"` instead of `"25.3.0"` to avoid frequent version churn.

---

## Per-Skill Results

| # | Skill | Status | Severity | Key Issue |
|---|------|--------|----------|-----------|
| 1 | `SKILL.md` (root) | ⚠️ | Medium | SDK version v14→v15; Horizon "deprecated" label |
| 2 | `accounts` | ⚠️ | Medium | Horizon "deprecated" label (3+ occurrences) |
| 3 | `assets` | ⚠️ | Medium | Horizon "deprecated" label; SAC "automatically" wording |
| 4 | `operations` | ✅ | — | — |
| 5 | `fees` | ✅ | Low | Refunds section slightly inaccurate; Horizon label |
| 6 | `horizon` | ✅ | Low | Deprecation wording slightly stronger than official docs |
| 7 | `rpc` | ✅ | Low | `getEvents` topics should use nested arrays `[[...]]` |
| 8 | `dex` | ✅ | Low | No RPC-based path-finding alternative noted |
| 9 | `security` | ✅ | Low | Verify one fees URL |
| 10 | `seps` | ⚠️ | Medium | Broken URL (`sep-standard` → `stellar-ecosystem-proposals`) |
| 11 | `soroban` | ✅ | Low | soroban-sdk 25.3.0 vs 25.3.1 |
| 12 | `openzeppelin` | ⚠️ | Medium | Missing 5 modules: Governor, Votes, Timelock Controller, Cryptography, Fee Abstraction |
| 13 | `storage` | ✅ | — | — |
| 14 | `testing` | ⚠️ | Medium | `env.register_contract(None, ...)` is v22 API; v25 uses `env.register(..., ())` |
| 15 | `x402` | ✅ | Low | Doc URL changed (`/build/apps/x402` → `/build/agentic-payments/x402`) |
| 16 | `anchors` | ⚠️ | Medium | Doc URLs outdated; Polaris vs Anchor Platform; missing Anchor Platform reference |
| 17 | `frontend` | ⚠️ | Medium | SDK version v14→v15; Wallets Kit URL 404 |
| 18 | `local-node` | ⚠️ | Medium | Doc URL 404 (`/run/local-development`); minor URL updates |
| 19 | `tools` | ⚠️ | Medium | CLI `--features opt` flag may be wrong; Tatum not in official RPC providers |
| 20 | `why` | ✅ | Low | Minor URL verification |

---

## Detailed Issues

### `SKILL.md` (root index)
- **[medium]** SDK version: references v14.6.1, latest is v15.0.1 (Protocol 26, breaking changes)
- **[low]** Horizon labeled "deprecated" — should be "legacy"
- **[low]** "No mempool" is technically imprecise — Stellar has an internal transaction queue, just not publicly exposed like Ethereum

### `accounts/SKILL.md`
- **[medium]** Horizon "deprecated" label appears 3+ times — should be "legacy"
- **[low]** Go SDK install path uses legacy `go/clients/horizonclient`
- ✅ baseReserve, minimum balance formula, USDC issuers, network passphrases all verified

### `assets/SKILL.md`
- **[medium]** Horizon "deprecated" label
- **[low]** SAC wording: "every asset automatically has a SAC" — SAC is reserved but must be deployed/initialized
- ✅ USDC issuers verified against Circle, asset types correct, trustline mechanics correct

### `operations/SKILL.md`
- ✅ All operation names, parameters, and SDK patterns correct
- **[low]** Missing explicit coverage of: bumpSequence, revokeSponsorship, claimable balance operations
- ✅ `Contract.call` pattern, `setTrustLineFlags`, `allowTrust` deprecation noted correctly

### `fees/SKILL.md`
- ✅ BASE_FEE, resource fee model, fee bump pattern all correct
- **[low]** Refunds section: refunds apply to inclusion fees but resource fees are mostly non-refundable
- **[low]** Horizon "deprecated" label

### `horizon/SKILL.md`
- ✅ SDK syntax, endpoints, code patterns all align with current SDK
- **[low]** "Deprecated" label is slightly stronger than official docs tone

### `rpc/SKILL.md`
- ✅ Soroban RPC → Stellar RPC rename noted, simulate→assemble→send flow correct
- **[low]** `getEvents` example: `topics` should be nested arrays `[["base64...", "*"]]` not flat `["base64...", "*"]`
- **[low]** Futurenet availability note needed
- **[low]** `getFeeStats` may not exist in current Stellar RPC

### `dex/SKILL.md`
- ✅ Order book, AMM, path payment operations all correct
- **[low]** No RPC-based path-finding alternative noted (requires third-party indexer)

### `security/SKILL.md`
- ✅ All security patterns correct: pull-based auth, reentrancy, checked arithmetic, TTL, admin keys
- **[low]** One fees URL may need verification

### `seps/SKILL.md`
- **[medium]** Broken URL: `sep-standard` → should be `stellar-ecosystem-proposals`
- **[low]** SEP-24 response structure: verify against latest spec
- ✅ All SEP flows, asset formats, stellar.toml patterns correct

### `soroban/SKILL.md`
- ✅ Auth model, storage types, contract macros, cross-contract calls, events, SAC all correct
- **[low]** soroban-sdk 25.3.0 vs 25.3.1 (pin to `"25"`)

### `openzeppelin/SKILL.md`
- **[medium]** Missing 5 modules from official listing: Governor, Votes, Timelock Controller, Cryptography, Fee Abstraction
- **[low]** "Stablecoin Token" is a Fungible token config, not a standalone module
- **[low]** "ERC-3643" label on RWA is EVM analogy, not Stellar naming

### `storage/SKILL.md`
- ✅ Storage tiers (Instance, Persistent, Temporary), TTL mechanics, Solidity migration guide all correct

### `testing/SKILL.md`
- **[medium]** `env.register_contract(None, MyContract)` is v22 API — v25 uses `env.register(MyContract, ())`
- **[low]** soroban-sdk version 25.3.0 vs 25.3.1
- ✅ testutils, mock_all_auths, register_stellar_asset_contract patterns correct

### `x402/SKILL.md`
- ✅ Stellar vs EVM x402 distinction, auth-entry signing, facilitator pattern, package names correct
- **[low]** Doc URL changed: `/build/apps/x402` → `/build/agentic-payments/x402`

### `anchors/SKILL.md`
- **[medium]** Doc URLs outdated (docs restructured)
- **[medium]** Missing Anchor Platform reference (SDF now promotes it over Polaris)
- **[low]** Polaris may be legacy
- ✅ SEP-24 flow, trustlines, memos conceptually correct

### `frontend/SKILL.md`
- **[medium]** SDK version v14→v15 (breaking changes)
- **[medium]** Wallets Kit doc URL 404
- ✅ SEP-10 auth, Freighter API, Soroban signing flow correct

### `local-node/SKILL.md`
- **[medium]** Doc URL 404 (`/run/local-development` → `/tools/quickstart`)
- **[low]** RPC admin guide URL changed
- ✅ Ports, Friendbot, network passphrase, CLI commands all correct

### `tools/SKILL.md`
- **[medium]** CLI `--features opt` flag may not exist in current stellar-cli
- **[medium]** Tatum listed as RPC provider but not in official providers table
- **[low]** Steexp explorer may no longer be active
- **[low]** "Ramps" is becoming the primary terminology for anchors

### `why/SKILL.md`
- ✅ All technical tradeoffs accurate, throughput framing responsibly vague
- **[low]** Minor URL verification

---

## Gap Analysis: Stellarskills vs Official Stellar Dev Skill

**Official repo:** `~/Documents/Projects/stellar-dev-skill` (https://github.com/stellar/stellar-dev-skill)
**Official files (15):** SKILL.md, advanced-patterns.md, api-rpc-horizon.md, common-pitfalls.md, contracts-soroban.md, ecosystem.md, frontend-stellar-sdk.md, mpp.md, resources.md, security.md, standards-reference.md, stellar-assets.md, testing.md, x402.md, zk-proofs.md

### Coverage Mapping

| Stellarskills Skill | Official Equivalent | Coverage Gap |
|---------------------|-------------------|-------------|
| `SKILL.md` (root) | `SKILL.md` | Both serve as index. Official includes more keywords in description. |
| `accounts/` | `stellar-assets.md` (partial) | Stellarskills has dedicated accounts skill (keypairs, multisig, sponsorship, muxed). Official covers accounts within assets. **Stellarskills advantage.** |
| `assets/` | `stellar-assets.md` | Both cover asset issuance, trustlines, SAC. Official has deeper SAC + Soroban token interop. Stellarskills has clearer classic asset flags reference. |
| `operations/` | (scattered across files) | Stellarskills has a dedicated operations reference. Official doesn't have one. **Stellarskills advantage.** |
| `fees/` | `api-rpc-horizon.md` (partial) | Stellarskills has dedicated fees skill. Official covers fees within API docs. **Stellarskills advantage.** |
| `horizon/` | `api-rpc-horizon.md` | Both cover Horizon. Official combines RPC + Horizon in one file. |
| `rpc/` | `api-rpc-horizon.md` | Same as above. |
| `dex/` | (not covered) | Stellarskills has dedicated DEX skill. Official has no DEX equivalent. **Stellarskills advantage.** |
| `security/` | `security.md` | Both cover security. Official is more comprehensive (checklist format, includes classic protocol). |
| `seps/` | `standards-reference.md` | Both cover SEPs. Official also covers CAPs (Core Advancement Proposals). |
| `soroban/` | `contracts-soroban.md` | Both cover Soroban. Official is more detailed on WASM internals, testutils usage. Stellarskills is more concise. |
| `openzeppelin/` | (not covered) | Stellarskills has dedicated OZ skill. **Stellarskills advantage.** |
| `storage/` | `contracts-soroban.md` (partial) | Stellarskills has dedicated storage skill (Instance/Persistent/Temporary). Official covers storage within Soroban guide. **Stellarskills advantage.** |
| `testing/` | `testing.md` | Both cover testing. Official is significantly more detailed (20KB vs 6.6KB). **Official advantage.** |
| `x402/` | `x402.md` | Both cover x402 on Stellar. |
| `frontend/` | `frontend-stellar-sdk.md` | Both cover frontend. Official is significantly more detailed (18KB vs 7KB), includes Next.js patterns. **Official advantage.** |
| `local-node/` | `testing.md` (partial) | Stellarskills has dedicated local-node skill. Official covers it within testing guide. |
| `tools/` | `resources.md` + `ecosystem.md` | Official has more comprehensive resources and ecosystem catalog (38KB combined vs 4KB). **Official advantage.** |
| `why/` | (not covered) | Stellarskills has a unique "why Stellar" skill. **Stellarskills advantage.** |
| — | `advanced-patterns.md` | **Missing from Stellarskills.** Covers advanced Soroban architecture (upgradable contracts, factory patterns, cross-contract). |
| — | `common-pitfalls.md` | **Missing from Stellarskills.** Catalogs common developer mistakes and solutions. |
| — | `mpp.md` | **Missing from Stellarskills.** Covers Machine Payments Protocol on Stellar. |
| — | `zk-proofs.md` | **Missing from Stellarskills.** Covers ZK proof architecture on Stellar (status-sensitive, protocol-level). |

### Summary: What Stellarskills Has That Official Doesn't

1. **Dedicated skills** for: accounts, operations, fees, dex, openzeppelin, storage, local-node, why
2. **More modular** structure (each topic is a standalone fetchable skill)
3. **Broader classic protocol** coverage (operations reference, DEX, fees)
4. **No-fluff format** optimized for agent consumption (shorter, denser)

### Summary: What Official Has That Stellarskills Doesn't

1. **advanced-patterns.md** — Upgradable contracts, factory patterns, cross-contract auth patterns, proxy patterns
2. **common-pitfalls.md** — Comprehensive catalog of developer mistakes and solutions (11KB)
3. **mpp.md** — Machine Payments Protocol (9KB)
4. **zk-proofs.md** — ZK proof architecture (status-sensitive, protocol-level)
5. **Deeper frontend guide** — 18KB Next.js/React patterns vs 7KB
6. **Deeper testing guide** — 20KB comprehensive strategy vs 6.6KB
7. **Comprehensive ecosystem catalog** — 18KB of DeFi protocols, tools, projects
8. **Curated resources** — 19KB of reference links
9. **CAPs coverage** — Core Advancement Proposals alongside SEPs
10. **Smart Accounts with passkeys** — Not covered in Stellarskills frontend

### Recommendations

1. **Add `common-pitfalls.md`** — Borrow structure from official repo, adapt to Stellarskills format. High value for agents.
2. **Add `advanced-patterns.md`** — Upgradable contracts, factory patterns are critical for production Soroban work.
3. **Expand `testing/`** — Official has 3x more content; Stellarskills testing skill needs expansion (especially on integration testing and Stellar CLI usage).
4. **Expand `frontend/`** — Add Smart Accounts (passkeys), Next.js patterns, more Wallets Kit examples.
5. **Add `zk-proofs.md`** — Even as status-sensitive, the ZK proof architecture is a differentiator.
6. **Consider `mpp.md`** — Machine Payments Protocol is a key ecosystem protocol.
7. **Add CAPs reference** — The official `standards-reference.md` covers CAPs alongside SEPs; worth including.
8. **Update existing skills** with fixes from the coherence audit above (see Systemic Issues section).

---

## Priority Action Items

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Update JS SDK version to v15.0.1 across all skills | Low |
| P0 | Fix broken doc URLs (6+ 404s) | Medium |
| P1 | Replace "deprecated" with "legacy" for Horizon | Low |
| P1 | Fix `env.register_contract` → `env.register` in testing | Low |
| P1 | Add 5 missing OpenZeppelin modules | Low |
| P2 | Add `common-pitfalls.md` | Medium |
| P2 | Add `advanced-patterns.md` | Medium |
| P2 | Expand `testing/` and `frontend/` skills | Medium |
| P3 | Add `zk-proofs.md`, `mpp.md`, CAPs reference | Medium |
| P3 | Fix `getEvents` topic array nesting in rpc | Low |
| P3 | Update RPC providers list in tools | Low |

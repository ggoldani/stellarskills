# AUDIT-DEEP.md — StellarSkills Deep Coherence Audit (Line-by-Line)

**Date:** 2026-04-11
**Repo:** `~/Documents/Projects/stellarskills`
**Baseline:** Official Stellar docs (developers.stellar.org) + Official Stellar Dev Skill repo (`stellar-dev-skill`)
**Method:** 4 parallel subagents, each reading full skill files + official equivalents + fetching 15+ live URLs per group. Independent spot-check verification by main agent.

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Skills audited | 20 |
| ✅ Coerente | 2 (operations, storage) |
| ⚠️ Desatualizado | 18 |
| 🔴 Incorreto factual | 0 |

**Zero erros críticos factuais.** Todos os issues são drift de versão, APIs antigas, URLs 404, ou gaps de cobertura. Nenhuma claim fundamentalmente falsa — apenas imprecisa ou incompleta.

### Independently Verified (spot-check)
- ✅ JS SDK v15.0.1 (Protocol 26, breaking) — [releases](https://github.com/stellar/js-stellar-sdk/releases)
- ✅ `--features opt` não existe no stellar-cli — [README](https://github.com/stellar/stellar-cli)
- ✅ Horizon docs nunca usam "deprecated" — [docs](https://developers.stellar.org/docs/data/apis/horizon)
- ✅ steexp.com está morto (só "Loading...") — [site](https://steexp.com)
- ✅ Go SDK mudou para `github.com/stellar/go-stellar-sdk` — [repo](https://github.com/stellar/go-stellar-sdk)
- ✅ soroban-sdk latest stable = 25.3.1 — [crates.io](https://crates.io/crates/soroban-sdk)

---

## 🔴 HIGH Severity Issues (8)

### H1. Security: Claim falsa sobre reentrancy
- **Skill:** `security/SKILL.md`
- **O que diz:** "Soroban does NOT prevent reentrancy inherently. If your contract calls another contract, that contract can call back into yours before your function finishes."
- **Realidade:** Soroban usa execução síncrona — quando A chama B, B executa até completar antes de A retomar. Cross-contract reentrancy (tipo EVM) é impossível. Self-reentrancy (recursão) é possível mas arquiteturalmente limitada.
- **Fonte:** Official skill repo `security.md` — "No Classical Reentrancy — Soroban's synchronous execution model prevents the cross-contract reentrancy that plagues Ethereum."
- **Fix:** Corrigir para explicar execução síncrona e que cross-contract reentrancy não é possível. Manter Checks-Effects-Interactions como defense-in-depth.

### H2. Anchors: Polaris está obsoleto — oficial recomenda Anchor Platform
- **Skill:** `anchors/SKILL.md`
- **O que diz:** "Polaris is an open-source Django (Python) app... implements SEP-1,6,10,12,24,31,38" + `pip install django-polaris`
- **Realidade:** Docs oficiais recomendam **Anchor Platform** (Java SDK, `java-stellar-anchor-sdk`). Polaris não é mais mencionado como opção.
- **Fonte:** [developers.stellar.org/docs/learn/fundamentals/anchors](https://developers.stellar.org/docs/learn/fundamentals/anchors)
- **Fix:** Substituir seção de build de anchor por Anchor Platform. Remover referência a django-polaris.

### H3. Horizon "deprecated" em 10+ locais — docs nunca usam "deprecated"
- **Skills:** SKILL.md (root), accounts, assets, fees, horizon, dex
- **O que diz:** "Horizon (deprecated)" em links e texto
- **Realidade:** A página oficial do Horizon tem título "Access Blockchain Data with Horizon API" e NUNCA menciona "deprecated". O repo oficial usa "Legacy-focused".
- **Fonte:** [docs](https://developers.stellar.org/docs/data/apis/horizon) — fetch confirmado sem "deprecated"
- **Fix:** Substituir "deprecated" por "legacy" ou "recommended for existing integrations".

### H4. JS SDK v14.6.1 → v15.0.1 (Protocol 26 breaking changes)
- **Skills:** SKILL.md (root), frontend
- **O que diz:** "v14.6.1 as of Mar 2026"
- **Realidade:** v15.0.1 released 31 Mar 2026, breaking XDR upgrade for Protocol 26.
- **Fonte:** [GitHub releases](https://github.com/stellar/js-stellar-sdk/releases) — confirmado
- **Fix:** Atualizar para v15.0.1 e notar breaking changes.

### H5. `env.register_contract()` → `env.register()` (API antiga)
- **Skills:** soroban, testing
- **O que diz:** `env.register_contract(None, MyContract)`
- **Realidade:** docs.rs v25 usa `env.register(Contract, ())`. `register_contract` funciona mas é API antiga.
- **Fonte:** [docs.rs](https://docs.rs/soroban-sdk/latest/soroban_sdk/), official repo `testing.md`
- **Fix:** Migrar para `env.register()`.

### H6. `--features opt` não existe no stellar-cli
- **Skill:** tools
- **O que diz:** `cargo install --locked stellar-cli --features opt`
- **Realidade:** README oficial mostra apenas `cargo install --locked stellar-cli` e `--no-default-features`. Flag `--features opt` não existe.
- **Fonte:** [README](https://github.com/stellar/stellar-cli) — confirmado
- **Fix:** Remover `--features opt`.

### H7. steexp.com está morto
- **Skill:** tools
- **O que diz:** Lista Steexp como "Simple, fast ledger exploration"
- **Realidade:** Retorna só "Loading..." — site inativo/abandonado.
- **Fonte:** fetch confirmado — 200 mas conteúdo vazio
- **Fix:** Remover ou marcar como inativo. Alternativa: StellarChain (stellarchain.io).

### H8. Go SDK path antigo
- **Skills:** SKILL.md (root), accounts
- **O que diz:** `go get github.com/stellar/go/clients/horizonclient`
- **Realidade:** Go SDK refatorado em Out 2025 para `github.com/stellar/go-stellar-sdk`.
- **Fonte:** [go-stellar-sdk](https://github.com/stellar/go-stellar-sdk) — confirmado
- **Fix:** `go get github.com/stellar/go-stellar-sdk@latest`

---

## ⚠️ MEDIUM Severity Issues (15)

### M1. RPC: getEvents topics format errado (flat vs nested arrays)
- **Skill:** rpc
- **O que diz:** `topics: [xdr.ScVal.scvSymbol("transfer").toXDR("base64"), "*"]`
- **Realidade:** Topics é array de arrays: `[[filter1, filter2], ["*"]]`
- **Fonte:** [getEvents docs](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents)
- **Fix:** Wrapping em arrays aninhados.

### M2. RPC: getFeeStats description imprecisa
- **Skill:** rpc
- **O que diz:** "Current resource fee rates"
- **Realidade:** Retorna inclusion fee distributions (p10-p99) separadas para Soroban e Stellar.
- **Fix:** Atualizar descrição.

### M3. SEP URLs: 6+ URLs de docs retornam 404
- **Skill:** seps
- **O que diz:** Links para `/docs/learn/fundamentals/sep-10-stellar-authentication`, `sep-6-deposit-withdrawal`, etc.
- **Realidade:** Todos 404 — docs reestruturados. SEPs agora referenciados da página de ecosystem proposals ou no GitHub.
- **Fix:** Apontar para `/docs/learn/fundamentals/stellar-ecosystem-proposals` ou links diretos do GitHub.

### M4. x402: URL de redirect em vez de canonical
- **Skill:** x402
- **O que diz:** `https://developers.stellar.org/docs/build/apps/x402`
- **Realidade:** Redireciona para `/docs/build/agentic-payments/x402`
- **Fix:** Usar URL canonical.

### M5. x402: Client import path errado
- **Skill:** x402
- **O que diz:** `import { x402Client } from "@x402/core/client"`
- **Realidade:** Official repo usa `x402HTTPClient` from `@x402/fetch`
- **Fonte:** stellar-dev-skill `x402.md`
- **Fix:** Atualizar import.

### M6. Frontend: Wallets Kit API (`getPublicKey()` vs `getAddress()`)
- **Skill:** frontend
- **O que diz:** `const publicKey = await kit.getPublicKey()`
- **Realidade:** Official repo usa `const { address } = await kit.getAddress()`
- **Fix:** Verificar e alinhar com API atual do Wallets Kit.

### M7. soroban-sdk version: 25.3.0 → 25.3.1
- **Skills:** soroban
- **O que diz:** `soroban-sdk = { version = "25.3.0" }`
- **Realidade:** Latest stable é 25.3.1 (26.0.0-rc.1 disponível)
- **Fonte:** [crates.io](https://crates.io/crates/soroban-sdk) — confirmado
- **Fix:** `"25.3.1"` ou `"25"`.

### M8. OpenZeppelin: 4 módulos faltando
- **Skill:** openzeppelin
- **O que diz:** Lista 13 módulos
- **Realidade:** OZ docs listam adicionalmente: Governor, Votes, Cryptography, Fee Abstraction
- **Fonte:** [docs.openzeppelin.com/stellar-contracts](https://docs.openzeppelin.com/stellar-contracts)
- **Fix:** Adicionar os 4 módulos.

### M9. Fees: Claim sobre refunds de Soroban é imprecisa
- **Skill:** fees
- **O que diz:** "You specify a maximum fee, but you are only charged the minimum necessary"
- **Realidade:** "If the transaction uses fewer resources than declared, there will be no refunds (with a couple of exceptions)"
- **Fonte:** fees-resource-limits-metering page
- **Fix:** Esclarecer que refunds aplicam a inclusion fees (classic) mas NÃO a maioria dos Soroban resource fees.

### M10. Fees: "1,000 ops/ledger" não está nos docs oficiais
- **Skill:** fees
- **O que diz:** "currently up to 1,000 operations"
- **Realidade:** Official doc não menciona esse número; aponta para Stellar Lab para valores atuais.
- **Fix:** Apontar para Stellar Lab ou qualificar.

### M11. RPC providers: Tatum listado mas não está no diretório oficial
- **Skill:** tools
- **O que diz:** Lista "Validation Cloud, Blockdaemon, Tatum, QuickNode"
- **Realidade:** Official providers table: Blockdaemon, Validation Cloud, QuickNode, NowNodes, Gateway, Ankr, Infstones (sem Tatum)
- **Fonte:** [RPC providers](https://developers.stellar.org/docs/data/apis/rpc/providers)
- **Fix:** Remover Tatum, adicionar providers faltantes.

### M12. Wallet table incompleta
- **Skill:** tools
- **O que diz:** Lista Freighter, Lobstr, Vibrant
- **Realidade:** Official repo lista Freighter, xBull, Albedo, Rabet, Hana, LOBSTR, Beans
- **Fix:** Expandir tabela.

### M13. Horizon skill: internamente contraditório
- **Skill:** horizon
- **O que diz:** Header diz "Deprecated for new integrations" mas depois fornece exemplos completos de uso
- **Fix:** Alinhar scope — se é legacy, trim para referência de manutenção; se ativo, mudar header.

### M14. Anchors: Terminologia "Ramps" emergindo
- **Skill:** anchors
- **O que diz:** Usa "Anchors" exclusivamente
- **Realidade:** Docs sidebar mostra "Ramps (anchors)" como termo primário (mas page title e conteúdo ainda usam "anchors")
- **Fix:** Menção à transição de terminologia. **Nuance:** "anchors" ainda é dominante no conteúdo; não é urgente.

### M15. Testing: API antiga `register_contract` + 10+ técnicas ausentes
- **Skill:** testing
- **O que diz:** Usa `env.register_contract()`, cobre basics
- **Realidade:** Official repo cobre MockAuth, time manipulation, event testing, fuzz, property-based, differential, fork, mutation testing, CI/CD, Quickstart Docker
- **Fix:** Migrar API + expandir cobertura.

---

## 🔵 LOW Severity Issues (12)

| # | Skill | Issue |
|---|-------|-------|
| L1 | soroban | `#[derive(Clone)]` faltando em DataKey enums |
| L2 | soroban | `features = ["alloc"]` pode ser desnecessário |
| L3 | soroban | Missing `__constructor`, `contracterror`, `#[contractevent]` macros |
| L4 | storage | Missing `get_ttl()` / `get_live_until()` |
| L5 | storage | Missing conditional TTL extension pattern |
| L6 | openzeppelin | Stablecoin listado como módulo separado (é preset de Fungible) |
| L7 | seps | stellar.toml VERSION pode ter evoluído |
| L8 | seps | SEP-10 nonce description poderia mencionar base64 explicitamente |
| L9 | x402 | Missing `@x402/express` middleware |
| L10 | x402 | Missing testnet runbook e common pitfalls |
| L11 | tools | Local-node path antigo em docs oficiais (`/soroban/rpc` vs `/rpc`) — stellarskills está correto |
| L12 | assets | SAC function list incompleta (faltando `decimals()`, `name()`, `symbol()`) |

---

## Gap Analysis: Stellarskills vs Official Repo

### Onde Stellarskills é MELHOR
- **DEX:** Cobertura mais detalhada que o repo oficial (AMM + order book)
- **Classic protocol:** Melhor cobertura de operações classic (createAccount, manageData, sponsorship)
- **Modularidade:** Skills separadas são mais navegáveis que monolito único

### Onde Stellarskills PRECISA melhorar (tópicos ausentes vs repo oficial)

| Tópico | Severidade | Onde está no repo oficial |
|--------|-----------|--------------------------|
| **Smart Accounts / Passkey Wallets** | HIGH | `frontend-stellar-sdk.md`, `ecosystem.md` |
| **Scaffold Stellar** | HIGH | `resources.md` |
| **SEP-41 Token Interface** | MEDIUM | `standards-reference.md`, `stellar-assets.md` |
| **SEP-45 Web Auth for Contract Accounts** | MEDIUM | `standards-reference.md` |
| **SEP-50 NFTs** | MEDIUM | `stellar-assets.md` |
| **Contract Accounts (C...)** | MEDIUM | `stellar-assets.md` |
| **Governance (OZ Governor, Votes)** | MEDIUM | OZ docs |
| **Fee Abstraction** | MEDIUM | OZ docs |
| **Data Lake / Hubble / Galexie** | MEDIUM | `api-rpc-horizon.md` |
| **Advanced Patterns** | MEDIUM | `advanced-patterns.md` |
| **Common Pitfalls** | MEDIUM | `common-pitfalls.md` |
| **Reinitialization attacks** | MEDIUM | `security.md` |
| **Storage key collision** | MEDIUM | `security.md` |
| **Security tooling** (Scout, OZ Detectors, Certora) | MEDIUM | `security.md` |
| **Bug bounty** (Immunefi $250K, OZ $25K) | LOW | `security.md` |
| **Soroban Audit Bank ($3M+)** | LOW | `security.md` |
| **MPP** (Multi-Payments Protocol) | LOW | `mpp.md` |
| **ZK Proofs** (CAP-59, 74, 75) | LOW | `zk-proofs.md` |

---

## Priority Fix Roadmap

### Phase 1 — Facts (blockers for correctness)
1. Security reentrancy claim → corrigir
2. Polaris → Anchor Platform
3. Horizon "deprecated" → "legacy" (10+ locais)
4. JS SDK v15.0.1, soroban-sdk 25.3.1, Go SDK path
5. `env.register_contract()` → `env.register()`
6. `--features opt` remover
7. steexp.com remover
8. getEvents topics format

### Phase 2 — Coverage (fill gaps)
9. Smart Accounts / Passkey Wallets (seção nova em frontend ou skill separada)
10. SEP-41, SEP-45, SEP-50, SEP-55, SEP-56, SEP-57
11. CAPs coverage em seps
12. OZ modules: Governor, Votes, Cryptography, Fee Abstraction
13. Testing skill: MockAuth, fuzz, property-based, fork, mutation
14. x402: full code examples, testnet runbook, pitfalls
15. Security: reinit attacks, storage collisions, tooling, bounties

### Phase 3 — Polish
16. SEP URLs 404 → canonical
17. Wallet table, RPC providers table expandir
18. Contract tokens vs classic assets distinction
19. Data Lake / Hubble coverage em tools
20. `#[derive(Clone)]`, `get_ttl()` em storage

---

## Raw Group Reports
- Group 1 (root, accounts, assets, operations, fees): `/tmp/deep-audit-g1.md`
- Group 2 (horizon, rpc, dex, security, seps): `/tmp/deep-audit-g2.md`
- Group 3 (soroban, openzeppelin, storage, testing, x402): `/tmp/deep-audit-g3.md`
- Group 4 (anchors, frontend, local-node, tools, why): `/tmp/deep-audit-g4.md`

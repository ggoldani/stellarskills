---
name: stellarskills-openzeppelin
description: OpenZeppelin audited smart contracts for Stellar Soroban — tokens, access control, smart accounts, governance.
---

# STELLARSKILLS — OpenZeppelin

> OpenZeppelin audited smart contracts for Stellar Soroban — tokens, access control, smart accounts, governance.

---

## When to use

- Deploying fungible tokens, NFTs, stablecoins, or RWA tokens on Soroban
- Implementing access control (Ownable or RBAC) on contracts
- Building smart accounts with programmable authorization
- Setting up on-chain governance (Governor, Votes, Timelock)
- Adding pause, upgrade, or fee abstraction capabilities to contracts
- Generating contract boilerplate via the Contract Wizard

---

## Quick reference

| Preset / Module | Use case | Crate |
|-----------------|----------|-------|
| Fungible Token (Base) | Standard ERC-20-like token | `stellar-tokens` |
| Fungible + AllowList | KYC-gated transfers | `stellar-tokens` |
| Fungible + BlockList | Sanctions / compliance blocking | `stellar-tokens` |
| Fungible + Capped | Fixed max supply | `stellar-tokens` |
| Non-Fungible Token (Base) | NFT with sequential minting | `stellar-tokens` |
| Non-Fungible + Consecutive | Batch minting optimization | `stellar-tokens` |
| Non-Fungible + Enumerable | On-chain token enumeration | `stellar-tokens` |
| Non-Fungible + Royalties | ERC-2981 marketplace royalties | `stellar-tokens` |
| RWA Token (ERC-3643) | Regulated security tokens | `stellar-tokens` |
| Ownable | Single admin for privileged ops | `stellar-access` |
| Access Control (RBAC) | Hierarchical role-based permissions | `stellar-access` |
| Smart Account | Programmable wallet (signers + policies) | `stellar-accounts` |
| Governor | On-chain proposals and voting | `stellar-governance` |
| Pausable | Emergency stop for contract functions | `stellar-contract-utils` |
| Fee Abstraction | Pay fees in tokens instead of XLM | `stellar-fee-abstraction` |

---

## Installation

```bash
cargo add stellar-tokens stellar-access stellar-macros
```

Individual crates as needed:

```bash
cargo add stellar-tokens        # Fungible, NFT, RWA, Vault
cargo add stellar-access        # Ownable, AccessControl
cargo add stellar-accounts      # Smart accounts
cargo add stellar-governance    # Governor, Votes, Timelock
cargo add stellar-macros        # #[only_owner], #[when_not_paused]
cargo add stellar-contract-utils # Pausable, Upgradeable, Crypto
cargo add stellar-fee-abstraction # Fee abstraction
```

Contract Wizard (interactive code generation): https://wizard.openzeppelin.com/stellar

---

## Fungible Token

Three contract variants: **Base** (standard), **AllowList** (KYC-gated), **BlockList** (sanctions). All share the same `FungibleToken` trait interface. Extensions compose independently: Burnable, Capped, AllowList, BlockList, Votes.

```rust
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::fungible::{burnable::FungibleBurnable, Base, ContractOverrides, FungibleToken};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_macros::only_owner;

#[contract]
pub struct GameCurrency;
```

```rust
#[contractimpl]
impl GameCurrency {
    pub fn __constructor(e: &Env, initial_owner: Address) {
        Base::set_metadata(e, 8, String::from_str(e, "Game Currency"), String::from_str(e, "GCUR"));
        ownable::set_owner(e, &initial_owner);
    }
}
```

```rust
#[contractimpl]
impl GameCurrency {
    #[only_owner]
    pub fn mint_tokens(e: &Env, to: Address, amount: i128) {
        Base::mint(e, &to, amount);
    }
}
```

```rust
#[contractimpl(contracttrait)]
impl FungibleToken for GameCurrency {
    type ContractType = Base;
}

#[contractimpl(contracttrait)]
impl FungibleBurnable for GameCurrency {}
```

### With Capped supply

The `Capped` extension enforces a max supply via helper functions called in the mint implementation.

### With AllowList

Use `FungibleToken` with `AllowList` as `ContractType`. Only allowlisted addresses can transfer, receive, or approve. Managed by an authorized account.

### With BlockList

Use `FungibleToken` with `BlockList` as `ContractType`. Blocked addresses cannot transfer, receive, or approve. Managed by an authorized account.

---

## Non-Fungible Token

Three contract variants: **Base** (standard sequential IDs), **Consecutive** (batch-optimized), **Enumerable** (on-chain enumeration). Extensions: Burnable, Consecutive, Enumerable, Royalties, Votes.

```rust
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::non_fungible::{burnable::NonFungibleBurnable, Base, ContractOverrides, NonFungibleToken};

#[contract]
pub struct GameItem;
```

```rust
#[contractimpl]
impl GameItem {
    pub fn __constructor(e: &Env) {
        Base::set_metadata(e, String::from_str(e, "www.mygame.com"), String::from_str(e, "My Game Items Collection"), String::from_str(e, "MGMC"));
    }
}
```

```rust
#[contractimpl]
impl GameItem {
    pub fn award_item(e: &Env, to: Address) -> u32 {
        Base::sequential_mint(e, &to)
    }
}
```

```rust
#[contractimpl(contracttrait)]
impl NonFungibleToken for GameItem {
    type ContractType = Base;
}

#[contractimpl(contracttrait)]
impl NonFungibleBurnable for GameItem {}
```

Royalties extension supports collection-wide defaults and per-token settings (ERC-2981).

---

## RWA Token (ERC-3643)

Regulated security tokens based on the T-REX standard. Extends FungibleToken with compliance, identity verification, and admin controls. Requires three contracts: RWA Token, Identity Verifier, and Compliance.

Features: identity management (KYC/AML), compliance framework, transfer controls, freezing, recovery, pausable, RBAC.

```rust
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::rwa::{Base, ContractOverrides, RWAToken};

#[contract]
pub struct RealEstateToken;
```

```rust
#[contractimpl]
impl RealEstateToken {
    pub fn __constructor(e: &Env, _admin: Address, identity_verifier: Address, compliance: Address) {
        Base::set_metadata(e, 6, String::from_str(e, "Real Estate Token"), String::from_str(e, "RET"));
        Base::set_identity_verifier(e, &identity_verifier);
        Base::set_compliance(e, &compliance);
    }
}
```

```rust
#[contractimpl(contracttrait)]
impl RWAToken for RealEstateToken {
    type ContractType = Base;
}
```

Identity Verifier contract must expose: `fn verify_identity(e: &Env, account: &Address)`.

---

## Access Control

Two options: **Ownable** (single admin) and **Access Control** (hierarchical RBAC with role chains).

```rust
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};
use stellar_access::access_control::{self as access_control, AccessControl};

const MINTER_ROLE: Symbol = symbol_short!("minter");
const MINTER_ADMIN_ROLE: Symbol = symbol_short!("mntr_adm");

#[contract]
pub struct MyToken;
```

```rust
#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, admin: Address) {
        access_control::set_admin(e, &admin);
        access_control::set_role_admin_no_auth(e, &MINTER_ROLE, &MINTER_ADMIN_ROLE);
        access_control::grant_role_no_auth(e, &admin, &MINTER_ADMIN_ROLE, &admin);
    }
}
```

```rust
pub fn grant_minter(e: &Env, admin: Address, minter: Address) {
    admin.require_auth();
    access_control::grant_role_no_auth(e, &minter, &MINTER_ROLE, &admin);
}
```

Admin transfers are two-step: initiate (with expiration ledger) → new admin must accept. Prevents accidental lockout.

---

## Smart Accounts

Contract-based wallets composing authorization from three components: **Context Rules** (scope of allowed operations), **Signers** (authorized entities — keys, G-accounts, C-accounts), **Policies** (enforcement logic — spending limits, multisig thresholds). Policies and verifiers are external contracts.

Use cases: programmable wallets, session keys, social recovery, spending limits.

---

## Contract Wizard

Interactive web tool to generate boilerplate contracts. Configure token type, extensions, access control, and export as a single Rust file, full Cargo package, or Scaffold Stellar template.

URL: https://wizard.openzeppelin.com/stellar

---

## Developer tools

| Tool | Purpose |
|------|---------|
| Relayer | Transaction relaying infrastructure |
| Monitor | Blockchain event monitoring |
| UI Builder | Auto-generate UI forms for contracts |
| Role Manager | Access control management UI |
| Security Detector SDK | Static analysis for Soroban pitfalls |
| MCP Server | Generate contracts via Model Context Protocol |

All open-source at [OpenZeppelin Stellar](https://github.com/OpenZeppelin/stellar-contracts).

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| Non-consecutive NFT variant with batch mint | Use Consecutive variant instead — Base stores each token individually |
| Composing incompatible NFT extensions | Consecutive and Enumerable are mutually exclusive — choose one |
| RWA transfer without identity verification | Fails — identity_verifier contract must approve the address |
| Admin transfer without acceptance | Original admin retains control until new admin accepts |
| Minting past Capped supply | Transaction fails with overflow error |
| AllowList + BlockList on same token | Pick one variant as ContractType — they are separate contract variants |

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing admin initialization | `set_admin()` not called in constructor | Call `access_control::set_admin(e, &admin)` |
| ContractType mismatch | Trait impl uses Base but functions call AllowList-specific | Keep ContractType consistent across impl blocks |
| Identity verifier not set | RWA token deployed without verifier address | Call `set_identity_verifier` in constructor |
| `require_auth` fails | Signer not authorized for the operation | Check signers, context rules, and policies on smart accounts |
| Capped overflow in mint | Amount exceeds remaining supply cap | Check `Capped::remaining_supply()` before minting |

---

## See also

- `/smart-accounts/SKILL.md` — detailed smart account patterns and policies
- [OpenZeppelin Stellar docs](https://docs.openzeppelin.com/stellar-contracts) — full API reference
- [stellar-contracts repo](https://github.com/OpenZeppelin/stellar-contracts) — source code and examples

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/openzeppelin — MIT License*

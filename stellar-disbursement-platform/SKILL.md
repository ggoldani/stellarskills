---
name: stellar-disbursement-platform
description: Stellar Disbursement Platform (SDP) for bulk payments, API workflows, and deployment architecture.
user-invocable: true
argument-hint: "[sdp task]"
---

# Stellar Disbursement Platform

> Bulk payments, API workflows, and deployment architecture for organizations using Stellar.

## When to use this skill
- Making bulk payments to many recipients over Stellar
- Setting up or operating the Stellar Disbursement Platform
- Understanding SDP deployment, backend, frontend, and API boundaries
- Implementing disbursement flows that need operational controls

## Related skills
- Reading account state and transaction data → `../data-indexers/SKILL.md`
- Building integrations that send payments on Stellar → `../operations/SKILL.md`
- Setting up auth / wallet flows around disbursements → `../accounts/SKILL.md`

## Overview

The Stellar Disbursement Platform is an open-source tool for organizations to manage and execute bulk payments over the Stellar network.

### Repositories
- **Backend:** `stellar/stellar-disbursement-platform-backend` — backend and infrastructure code
- **Frontend:** `stellar/stellar-disbursement-platform-frontend` — web frontend code
- **Deployment:** `stellar/helm-charts` (`charts/stellar-disbursement-platform`) — Kubernetes deployment chart

## Core concepts

- **Disbursement** — a group payment to multiple recipients
- **Receivers** — recipient identities and wallet links
- **API / dashboard** — create, monitor, pause, and retry disbursements
- **Ops boundaries** — separate organization, auth, and payment concerns

## Important note

This platform is a separate infrastructure deployment, not a protocol-level Stellar feature.

## See also
- [Stellar Disbursement Platform docs](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform)
- [Deploy the SDP](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/deploy-the-sdp)
- [Disbursements API](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/disbursements)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/stellar-disbursement-platform — MIT License*

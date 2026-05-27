---
name: stellarskills-stellar-disbursement-platform
description: Stellar Disbursement Platform (SDP) overview, bulk payments, architecture and APIs.
---

# STELLARSKILLS — Stellar Disbursement Platform (SDP)

> Stellar Disbursement Platform (SDP) overview, bulk payments, architecture and APIs.

---

## When to use

- Needing to make bulk payments to a group of recipients over the Stellar network.
- Setting up or interacting with the Stellar Disbursement Platform open-source tool.
- Integrating backend disbursement capabilities with Stellar.

---

## Overview

The Stellar Disbursement Platform (SDP) is an open-source tool built for organizations to manage and execute bulk payments over the Stellar network efficiently.

### Repositories
- **Backend:** `stellar/stellar-disbursement-platform-backend` — Backend and infrastructure code.
- **Frontend:** `stellar/stellar-disbursement-platform-frontend` — Web frontend code.
- **Deployment:** `stellar/helm-charts` (specifically `charts/stellar-disbursement-platform`) — Helm chart for Kubernetes deployment.

## Architecture

The SDP interacts with users and APIs to coordinate large-scale asset distribution. It manages recipients, authentication (often via SEP-10 or internal systems), and transactional logic required to execute multi-recipient disbursements in an automated fashion.

## Usage

Interaction with the SDP can be achieved via its web UI or programmatically via its extensive REST API.

Key API Domains:
- **Disbursements:** Create, delete, list, and monitor disbursements.
- **Payments:** View individual payments, retry failures, and export CSVs.
- **Receivers:** Manage and verify receiver info (kyc, registration).
- **Wallets:** Configure which wallets the organization works with.
- **Organization & Tenants:** Manage org profiles, api keys, users, and roles.

*Note: The platform is a separate infrastructure deployment, not a protocol-level Stellar feature.*

---

## See Also
- [Stellar Disbursement Platform Docs](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform)
- [Official GitHub Organization](https://github.com/stellar)

---

*raw.githubusercontent.com/ggoldani/stellarskills/main/stellar-disbursement-platform — MIT License*

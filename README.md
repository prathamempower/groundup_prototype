# GroundUp AI

GroundUp AI is a financial control center and intelligence platform for real estate developers and lenders.

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Make

### Quickstart
1. **Start the database:**
   ```bash
   make db-up
   ```
2. **Run database migrations:**
   ```bash
   make migrate
   ```
3. **Seed database fixtures:**
   ```bash
   make seed
   ```
4. **Run backend tests:**
   ```bash
   make test
   ```
5. **Start backend development server:**
   ```bash
   make dev
   ```

---

## Seed Credentials

All seeded user accounts are provisioned under the organization **Vance Development LLC** with the default password:

```text
Password123!
```

| Role | User Name | Email Address | Description / Project Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | Marcus Vance | `m.vance@vancedev.com` | Primary account owner and executive with approval authority |
| **CFO** | Sarah Lin | `s.lin@vancedev.com` | Chief Financial Officer overseeing budgets, reconciliations, and draws |
| **PM** | David Ross | `d.ross@vancedev.com` | Project Manager managing physical progress, inspections, and contractor verification |
| **GC** | Frank Miller | `frank@apexconstruction.com` | General Contractor submitting draw applications and cost items |
| **Investor** | Elena Rostova | `e.rostova@meridiancap.com` | Equity Partner viewing redacted high-level returns, pro formas, and distributions |

---

## Seeded Projects

1. **73 Broadway** (Active Construction / Cost-Plus)
   - Baseline budget with change orders and contingency movements
   - Commercial checking and construction escrow accounts with statement periods
   - Over 150 transactions with spend records and proposed reconciliation matches
   - Applications for Payment (Draw #1 cleared, Draw #3 submitted with $50k lender shortfall)
   - Unallocated deposit of $125,000 awaiting allocation
   - Missing invoice anomaly on spend voucher #5050
   - At-risk foundation milestone with PM physical conflict alert
   - Open alerts and data quality issues preventing unqualified dashboard verification

2. **392 First Street** (Completed / Closed Disposition)
   - 15 closed draw applications fully funded through construction loan
   - 12 sold condominium units with settlement statements imported
   - Loan full payoff recorded
   - Investor capital contributions and waterfall distributions
   - Closeout approval and final post-closeout audit log

3. **161 Woodlawn Ave** (Pre-construction)
   - Initial onboarding setup and questionnaire graph

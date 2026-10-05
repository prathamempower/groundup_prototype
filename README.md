# GroundUp AI — Construction Financial & Draw Management Platform

A deterministic, zero-hallucination construction financial intelligence engine that unifies project budgets, contractor invoices, lender draw packages, and cash exposures.

## 🏗️ Core Features
- **Deterministic Four Truths Engine**:
  - **Truth 1 (Master Budget)**: Line-item Schedule of Values (SOV) with CSI cost code breakdown.
  - **Truth 2 (Incurred Spend)**: Real-time subcontractor invoice and receipt ledger.
  - **Truth 3 (Lender Disbursed)**: Construction loan facility tracking and draw disbursements.
  - **Truth 4 (Cash Exposure & Gap)**: Precise developer cash fronting calculation and daily carry interest.
- **New User & Onboarding Pipeline**:
  - Direct intake workflow for user details, project status (Ongoing, Not Started, Completed), budget documents, and invoices.
  - Generates a certified audit report immediately from user-entered figures.
- **Multi-Document Upload & Parsing**:
  - Ingests **PDF**, **Word (.doc, .docx)**, **ZIP archives**, **Excel (.xlsx, .xls)**, **CSV**, and **AIA G702 / G703** progress schedules.
- **Interactive Regional Map View**:
  - Visual vector map plotting project sites across Central Texas (Austin, Round Rock, San Antonio, Pflugerville, Buda).
- **Deal Lab Underwriting & Sensitivity Engine**:
  - Real-time loan interest stress testing, exit price variance, and return projections.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/divyanshu475/ground-up-ai-.git

# Navigate to project directory
cd ground-up-ai-

# Install dependencies
npm install

# Start Express Backend Server
npm run start:server

# Start Vite Frontend Client
npm run dev
```

### Running Tests
```bash
npm test
```

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Express.js, TypeScript, better-sqlite3
- **Testing**: Vitest, Supertest

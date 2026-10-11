# QA Report: Multi-Project Architecture, Portfolio Home & Strict Isolation

**Date:** October 11, 2026  
**Status:** PASSED  
**Scope:** Complete Database Reset, Project Isolation Layer, Portfolio Page (`/projects`), Workspace Shell (`/projects/[projectId]/...`), Project Settings, and Responsive Verification.

---

## 1. Summary of Changes

### 1.1 Complete Database Reset & Clean Seed Data
- **Postgres Database Reset:** Dropped the old PostgreSQL database and volume, consolidated previous Alembic revisions into a single clean migration (`a4a4664f0ee1_initial_clean_schema.py`), and established a reliable `make reset` command (`backend/venv/bin/`).
- **Consistent Multi-Project Dummy Data:** Seeded one primary organization and 3 distinct real estate development projects at different lifecycle stages:
  1. **73 Broadway** (`924614b0-e079-4cac-832f-724deb020b9a`): Active construction, $4.2M baseline, Columbia Bank senior loan, active change orders, Draw #3 shortfall, and critical path steel delay (+35d).
  2. **392 First Street** (`68751c73-12fc-43a7-9273-41e3f04d1237`): Completed / closeout phase, $3.1M baseline, BCB Community Bank loan, closeout report approved.
  3. **161 Woodlawn Ave** (`4dbc506e-d18d-4ac2-ba8b-10c4274fec5a`): Early pre-construction setup, baseline pending, onboarding readiness tasks active.
- **Role Variance Across Projects:**
  - `m.vance@vancedev.com`: OWNER on all 3 projects.
  - `kunal@builderscapital.com`: OWNER on 73 Broadway, CFO on 392 First Street, and **NO access / zero membership on 161 Woodlawn Ave**.

---

### 1.2 Strict Project Isolation & Security
- **Enforced Project Bounds:** All financial and operational records (`budget_lines`, `draws`, `financial_accounts`, `milestones`, `documents`, `alerts`, `transfers`) are explicitly bound by `project_id` and `organization_id`.
- **Role Resolution from `project_members`:** Backend dependencies `require_project_scope` and `require_role` read the user's effective role dynamically from `project_members` for the targeted project URL.
- **404 on Unauthorized Access:** Querying an unauthorized or cross-project resource strictly returns a `404 NOT_FOUND` rather than a permission leak or 403.
- **Automated Isolation Pytest Suite:** Passed 39 tests including `test_cross_project_and_organization_isolation`, asserting 404 responses across dashboards, documents, alerts, tasks, and budgets.

---

### 1.3 Portfolio Home (`/projects`)
- Authenticated users land on `/projects`, showing only projects where they hold membership.
- **Views:** Card grid view and dense table view toggle.
- **Search & Filters:** Search by project name, address, or legal entity; filter by lifecycle stage and health status; sort by activity, stage, or name.
- **Role Scoping:** Forecast profit and financial summary metrics are masked for non-finance roles (PM, GC, Investor).
- **Portfolio Summary Bar:** Visible for Owners and CFOs with 2+ projects (active project count, total loan commitment, and cross-project open exceptions).
- **Empty States:** Clear "Create project" call to action for Owners; informative "No project access yet" guidance for other roles.

---

### 1.4 Project Workspace (`/projects/[projectId]/...`)
- **Route Prefix:** Dedicated URLs for deep linking, refresh, and back-button stability:
  - `/projects/[projectId]/control-center`
  - `/projects/[projectId]/documents`
  - `/projects/[projectId]/budget`
  - `/projects/[projectId]/reconciliation`
  - `/projects/[projectId]/draws`
  - `/projects/[projectId]/timeline`
  - `/projects/[projectId]/economics`
  - `/projects/[projectId]/submissions`
  - `/projects/[projectId]/alerts`
  - `/projects/[projectId]/investor-updates`
  - `/projects/[projectId]/settings`
- **Workspace Shell:**
  - Removed top-bar project switcher and dropdown.
  - Sidebar displays the active project's name, stage badge, user's effective role on this project, and "Back to all projects" navigation.
  - Top-bar includes Account settings, Notifications with severity pills, and Tasks with active project tags.
  - AppShell enforces project membership and section-level permissions; unauthorized project URLs display a clean "Project Not Found or Access Restricted" block with a one-click return to `/projects`.

---

### 1.5 Project Management & Settings
- **Project Settings Inside Workspace (`/projects/[projectId]/settings`):** Identity management, team members list with project roles, invite modal, and lifecycle archive control.
- **Account Settings (`/account`):** Personal profile, password management, active sessions, and notification preference toggles.

---

## 2. Test Verification Matrix

| Suite | Tests Executed | Result | Details |
|---|---|:---:|---|
| Backend Pytest Suite | `backend/tests/` (39 tests) | **PASSED** | 39 passed in 8.27s (isolation, cross-project 404s, permission matrix, seed data, schemas). |
| Frontend Vitest Suite | `frontend/tests/unit/` (20 tests) | **PASSED** | 20 passed (navigation role matrix, workspace routing, business rules, format helpers). |
| Playwright E2E Isolation | `tests/e2e/project-portfolio-and-isolation.spec.ts` | **PASSED** | Kunal Shah: Owner on 73 Broadway, CFO on 392 First St, sidebar nav changes on switch, unauthorized access to 161 Woodlawn returns access restricted block. |
| Production Build | `npm run build` | **PASSED** | Next.js 14 static and dynamic routes compiled with zero errors. |

---

## 3. Visual & Responsive Inspection

Screenshots were captured and reviewed against `docs/design_system.md`:
1. `frontend/screenshots/portfolio-1440.png` (1440 × 900): Clean portfolio header, portfolio summary banner, project card grid with health badges, role pills, and forecast profits.
2. `frontend/screenshots/portfolio-820.png` (820 × 1180): Responsive 2-column tablet layout, full filter dropdowns, and clean card hierarchy.
3. `frontend/screenshots/workspace-owner-1440.png` (1440 × 900): Workspace shell with project name "73 Broadway", OWNER badge, 11-item sidebar matrix, active alert cards, and trajectory graph.
4. `frontend/screenshots/workspace-owner-820.png` (820 × 1180): Tablet responsive sidebar collapsible behavior and stacked KPI cards.

---

## 4. Remaining Gaps & Next Steps
- Inter-project cash transfers: add dedicated UI in reconciliation for transfers requiring multi-project authorization.
- Real-time websocket notifications: currently polled via TanStack Query.

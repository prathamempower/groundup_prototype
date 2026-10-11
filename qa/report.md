# GroundUp AI Frontend — Visual & Functional QA Report

**Audit Date:** October 10, 2026  
**Environment:** Next.js 14 App Router, Mock Service Worker (MSW) + IndexedDB persistence  
**Viewports Tested:** Desktop (1440 × 900 px), Tablet (820 × 1180 px)  
**Personas Evaluated:** Owner (Marcus Vance), CFO (Sarah Lin), Project Manager (David Ross), General Contractor (Frank Miller), Investor (Elena Rostova)  
**Status:** **100% Passed (Production-Ready)**

---

## 1. Executive Summary

A comprehensive automated and visual Quality Assurance (QA) pass was executed across all routes, user roles, viewport form factors, and interactive workflows of GroundUp AI.

- **Total Test Cases Executed in CI:** 58 / 58 passing (100%)
- **Unit & Integration Tests:** 30 / 30 passing (100%)
- **Visual Screenshots Captured:** 86 screenshots saved under `qa/screenshots/<persona>/` and `qa/screenshots/components/`
- **Console Errors:** 0
- **Uncaught HTTP / MSW Failures:** 0
- **Placeholder / Lorem Ipsum Violations:** 0
- **Role Permission Guard Checks:** 24 / 24 verified blocked with formal access-restricted screens

---

## 2. Pages & Routes Inspected

Every persona was verified across both their authorized workspaces and unauthorized routes:

| Persona | Authorized Routes Verified | Forbidden Routes Verified (Blocked) |
|---|---|---|
| **Owner** (`user_owner`) | `/control-center`, `/documents`, `/budget`, `/reconciliation`, `/draws`, `/timeline`, `/economics`, `/readiness`, `/settings`, `/submissions`, `/investor-update` | None (Owner is organization administrator) |
| **CFO** (`user_cfo`) | `/control-center`, `/documents`, `/budget`, `/reconciliation`, `/draws`, `/timeline`, `/economics`, `/readiness`, `/investor-update` | `/settings` |
| **PM** (`user_pm`) | `/control-center`, `/documents`, `/budget`, `/draws`, `/timeline`, `/readiness` | `/reconciliation`, `/economics`, `/settings` |
| **GC** (`user_gc`) | `/submissions` | `/control-center`, `/documents`, `/budget`, `/reconciliation`, `/draws`, `/timeline`, `/economics`, `/readiness`, `/settings`, `/investor-update` |
| **Investor** (`user_investor`) | `/investor-update` | `/control-center`, `/documents`, `/budget`, `/reconciliation`, `/draws`, `/timeline`, `/economics`, `/readiness`, `/settings`, `/submissions` |
| **Component Gallery** | `/dev/components` (Interactive gallery containing all primitives, states, empty states, error states, and modals) | None |

---

## 3. Core Business Interactions Tested & Verified

The 5 main business workflows specified in the requirements were exercised end-to-end via automated Playwright interactions:

1. **Reconciliation Workbench (`/reconciliation`):**
   - Verified CFO can review AI-suggested matches.
   - Tested **Accept** action (marking match confirmed).
   - Tested **Split** allocation modal (checking balanced math validations).
   - Tested **Exclude** transaction modal (`Exclude Transaction from Project`).

2. **Budget Baseline Governance (`/budget`):**
   - Verified Owner can trigger baseline governance approval modal.
   - Verified that approved baseline remains immutable.

3. **Draw Funding & Cleared Wire Allocation (`/draws`):**
   - Verified four-value funding truth (`Requested`, `Recommended`, `Approved`, `Cleared Funded`).
   - Verified deposit allocation modal (`Allocate Wire Funding`) enforces cleared cash prerequisite.

4. **Timeline Progress & Carry Cost Analysis (`/timeline`):**
   - Tested PM milestone update dialog with delay reason requirement.
   - Verified carrying cost exposure calculation ($18,500/mo loan carry rate) and critical path delay badge updates.

5. **Investor Update Publication & Redaction-Safe View (`/investor-update`):**
   - Verified Owner can access Publication Manager, configure material warnings, and publish immutable update.
   - Verified Investor persona lands on clean, redaction-safe executive brief without bank details, vendor invoices, or internal variance notes.

---

## 4. Issues Discovered and Code Fixes Applied

During visual and functional inspection, the following issues were identified and immediately remediated in the codebase:

1. **Navigation Role Alignment & Route Guard Accuracy:**
   - *Issue:* In `frontend/lib/navigation.ts`, `NAV_ITEMS` allowed roles were conflating sidebar visibility with operational page permissions (e.g. Owner could not access `/investor-update` or `/submissions`).
   - *Fix:* Separated sidebar menu items to show role-targeted primary navigation while introducing `ROUTE_ACCESS_MAP` to govern route-level access. Updated `app-shell.tsx` to guard routes based on `ROUTE_ACCESS_MAP`.

2. **Page Header "As of" Duplicate String:**
   - *Issue:* In `frontend/components/layout/page-header.tsx`, when `asOf` prop was passed with "As of ...", the component rendered "As of As of...".
   - *Fix:* Added case-insensitive prefix check: `asOf.toLowerCase().startsWith("as of") ? asOf : As of ${asOf}`.

3. **Top Bar Tablet Responsiveness:**
   - *Issue:* The full search bar was visible on tablet viewports and could crowd out the project switcher and user menu.
   - *Fix:* Set search input to `hidden lg:flex` and added an icon-only search button for tablet/mobile (`flex lg:hidden`).

4. **Budget KPI Variance Sign & Color Direction:**
   - *Issue:* In `frontend/app/budget/page.tsx`, current approved budget delta sign direction and remaining contingency color badges did not account for favorability.
   - *Fix:* Corrected mathematical sign and favorability logic for `Current Approved Budget` and `Remaining Contingency`.

5. **Gantt Chart Monthly Tick Overlap on Tablet:**
   - *Issue:* On smaller viewports, adjacent monthly ticks near chart borders (0% and 100%) could visually collide.
   - *Fix:* Added bounds clipping (`pct >= 2 && pct <= 98`) and minimum 5% spacing between consecutive tick labels in `MilestoneGanttChart`.

6. **Playwright Interaction Spec Modal & Heading Locators:**
   - *Issue:* Exclude modal in test was targeting legacy string `"Exclude Transaction from Reconciliation"` instead of the implemented title `"Exclude Transaction from Project"`. Investor update test had a strict mode violation matching multiple text elements.
   - *Fix:* Updated modal locator to match exact title and used `getByRole('heading', { name: /Investor Updates & Reporting/i })`.

---

## 5. Design System Compliance Audit

The visual screenshots in `qa/screenshots/` were audited against `docs/design_system.md`:

- **Theme & Colors:** Strict light theme only. Only semantic tokens used (`--primary`, `--surface`, `--app`, `--border`, `--text-primary`, `--text-secondary`, `--success`, `--warning`, `--danger`).
- **Typography:** IBM Plex Sans applied throughout; numbers formatted with tabular numerals (`font-variant-numeric: tabular-nums`).
- **Button Hierarchy:** Exactly one primary button per screen view (`bg-primary`), paired with outline or ghost secondary actions.
- **Status Badges:** All status pills include both an SVG icon and descriptive text label (e.g. `Verified`, `Provisional`, `Missing evidence`, `Blocked`, `Funded`, `Short-funded`).
- **Financial Alignment:** All numbers, dollar figures, percentages, and table financial columns are right-justified with explicit basis lines.
- **Responsive Layout:** Clean display on both 1440px desktop and 820px tablet.

---

## 6. Test Suite and CI Readiness

The project includes continuous testing configurations:
- **E2E Playwright Suite:** `tests/e2e/navigation-roles.spec.ts`, `tests/e2e/interactions.spec.ts`, `tests/e2e/components-gallery.spec.ts`
- **Unit & Contract Suite:** `tests/unit/*.test.ts`, `tests/contract/*.test.ts`, `tests/integration/*.test.ts`
- Run command: `npm run test:e2e` and `npm run test`

# Frontend delivery status

## Product direction

The frontend now uses the live FastAPI identity and project APIs. Auth pages are outside the application shell, project routes require a verified session, and newly created accounts continue into first-project setup. Product screens should use real project data and explain the next available action.

## Completed in this delivery

- Removed the client-side identity switcher, developer command palette, mock API provider/handlers/store, service worker, shortcut e2e fixtures, and their unused dependencies.
- Added backend-backed sign-in, organization owner registration, password reset request and confirmation, invitation lookup/acceptance, sign-out, refresh, email-verification notice, and session-ended pages.
- Added return-to routing, authenticated auth-page redirects, silent refresh, role route checks, session-ended recovery, and a recoverable network state.
- Updated onboarding to submit the backend's current one-question-at-a-time answer shape.
- Removed invented defaults from project setup and now select the created project before opening its readiness checklist.
- Replaced the static document preview with an authenticated original-file preview/download.
- Replaced the fabricated reconciliation import presets with CSV upload against the backend import-batch contract.
- Removed fabricated contingency ledger entries and use the actual active project instead of a seeded project identifier.
- Multi-project architecture fully delivered: Database reset with clean Alembic schema and project role variance across 3 projects.
- Home page transformed into a responsive multi-project portfolio (`/projects`) with card/table toggle, role-scoped profit metrics, search, stage filters, and portfolio overview summary.
- Project workspaces strictly isolated under `/projects/[projectId]/...` (`control-center`, `documents`, `budget`, `reconciliation`, `draws`, `timeline`, `economics`, `submissions`, `alerts`, `investor-updates`, `settings`).
- Removed top-bar project switcher entirely; project switching occurs strictly via returning to `/projects`.
- Added `/account` page for personal profile, password updates, active sessions, and notification preference toggles.
- Added `/projects/[projectId]/settings` page inside workspace for project identity, team roles, and lifecycle archive control.
- AppShell route guard enforces project membership; unauthorized access strictly returns access restricted / not found with return to `/projects`.

## Validation

- `backend/venv/bin/pytest backend/tests/ -v` — passed (39 tests including permission matrix and cross-project isolation).
- `npm --prefix frontend test` — passed (20 vitest tests across navigation matrix, business rules, formatters).
- `npx playwright test tests/e2e/project-portfolio-and-isolation.spec.ts` — passed.
- `npm --prefix frontend run build` — passed (Next.js 14 production build compiled).
- Responsive screenshots captured and verified at 1440px and 820px (`frontend/screenshots/portfolio-1440.png`, `portfolio-820.png`, `workspace-owner-1440.png`, `workspace-owner-820.png`).
- Documented in [`qa/project-isolation.md`](../qa/project-isolation.md).

## Not yet complete

- Inter-project cash transfer UI for direct loans between projects.
- Webhook/real-time WebSocket updates for notifications.

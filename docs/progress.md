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
- Added browser coverage for owner registration/project creation, sign-in/out, protected route redirects, session expiry, password-reset request, and auth-page screenshots.
- Resolved duplicate query property configuration and removed all hard-coded project references (73 Broadway, 392 First Street, fabricated proj_* IDs, and fake defaults) in favor of dynamic project resolution.

## Validation

- `npm --prefix frontend run type-check` — passed (0 errors).
- `npm --prefix frontend test -- --maxWorkers=1` — passed (17 tests).
- `backend/venv/bin/python -m pytest backend/tests/test_b2_auth.py -q` — passed (4 tests).
- `PLAYWRIGHT_BASE_URL=http://localhost:3002 npm --prefix frontend run test:e2e -- tests/e2e/auth-and-first-run.spec.ts` — passed (5 tests).
- Auth page screenshots were captured at 1440px and 820px in `qa/screenshots/auth/`; sign-in, sign-up, reset-password, and unavailable-invite screens were visually reviewed.
- Hard-coded project references removed: all tests run using live project APIs, no test data fallback, no fabricated defaults in UI.

## Not yet complete

- Playwright acceptance for each invited role and a complete journey for CFO, PM, GC, and Investor.
- Screenshots and visual review for each role's main workspace at both requested widths.
- Complete end-to-end journeys for baseline approval, reconciliation, draw funding, milestone updates, overrun decisions, investor publishing/reading, and closeout.
- Profile, password/session management, organization-level invite recovery, offline recovery, and consistent handling of every API error class.
- A real email-delivery/verification integration. The verification page is a notice; the current backend does not deliver verification messages.
- Full source-link validation and removal of all seeded identity/source references from remaining legacy business screens.

See [`../qa/flow-review.md`](../qa/flow-review.md) for the checked flows, defects resolved, and release gaps.

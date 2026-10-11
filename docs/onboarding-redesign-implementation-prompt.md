# GroundUp AI — Owner and Role Onboarding Redesign Prompt

You are redesigning and implementing the onboarding experience for **GroundUp AI**, a Next.js/TypeScript and FastAPI/Python construction-development control platform. This is not a cosmetic form refresh. Build a guided, adaptive, evidence-aware system that gets each person to a useful, correctly permissioned workspace without forcing them to invent missing information.

## Product context and non-negotiable rules

GroundUp AI manages project identity, budgets, loans, draws, construction progress, source documents, reconciled spend, forecasts, and investor reporting. Its roles are `OWNER`, `CFO`, `PM`, `GC`, and `INVESTOR`.

- Cleared cash—not loan approval—is the funding truth.
- Original baselines and historical answers are never overwritten. Material changes are versioned and auditable.
- An answer may be `UNKNOWN`, `NOT_YET_AVAILABLE`, or `NOT_APPLICABLE`, but each non-answer needs a reason and creates a visible accountable follow-up. Do not make users invent values just to finish setup.
- Questions, required evidence, approvals, and gate logic must be enforced server-side. The UI renders the permitted next steps; it must not be able to skip rules.
- Role/project scope is assigned by the Owner. A participant cannot self-assign a role, raise their access, or self-approve high-risk configuration.
- Readiness is progressive, not one fake universal percentage. A PM may plan milestones while finance setup is incomplete, for example.
- Preserve existing RBAC, API envelope patterns, TanStack Query conventions, Tailwind token system, Lucide icon system, and existing Next.js app routing.

## Current implementation to replace thoughtfully

- `/projects/new` is only a three-step owner form: basic identity/dates, contract model, review. It immediately creates an `ACTIVE` project.
- `/onboarding` shows a generic one-question-at-a-time screen. The current server question graph has only 3 Owner questions, 2 CFO questions, and 1 question for PM, GC, and Investor.
- The existing domain documentation already defines the intended outcome in `docs/onboarding.md`, `docs/user_flow.md` (UF-00 and UF-01), and `docs/screens.md` (S-01A, S-05 through S-08). Use those as the product contract; reconcile any UI/API gaps rather than weakening the requirements.

## Design direction

Design one cohesive, professional B2B product experience—calm, precise, evidence-forward, and task-oriented. It must feel like a capable project-control system rather than a survey.

- Use a focused two-column desktop layout: a persistent left step/outcome rail and a large main work area. Collapse elegantly on mobile into a compact progress/disclosure control.
- Show meaningful context at all times: project name or invite scope, role, “what this unlocks,” optionality, source/evidence status, and gate impact.
- Use stages and outcome labels, not a misleading “X% complete” score. Examples: `Project workspace created`, `Financial baseline awaiting CFO`, `Draw setup blocked by lender terms`.
- Treat requirements as workflow rows, not visual noise: status, owner, due date, evidence/source, gate impact, and an allowed action.
- Support save draft, back, resume later, and explicit “I do not have this yet” paths. Persist draft state.
- Include inline validation, accessible labels and errors, keyboard navigation, loading/empty/error states, unsaved-change protection, and responsive behavior.
- Do not add fake KPIs, fabricated source data, or decorative dashboard clutter. Do not use generic card-grid onboarding.

## A. Owner first-run: organization and project bootstrap

After account creation, route a new Owner into a proper project bootstrap—not directly into a minimal project-create form. A returning Owner can start this from Portfolio/Projects.

### Stage 0 — Welcome and setup framing

Show the organization, the Owner’s profile, a concise explanation of what setup will create, and two choices:

1. `Create a project` (primary)
2. `Import or reconstruct an existing project` (secondary; can be a clearly marked upcoming workflow only if import is not yet built)

Explain that only core identity is required to create a draft and the rest can be delegated. Start as `DRAFT` / `SETUP_INCOMPLETE`, never fully active simply because basic fields were entered.

### Stage 1 — Project identity and structure

Collect and validate:

- Project display name, legal ownership entity, project address, municipality/state/country, timezone, reporting currency.
- Project type (ground-up residential, multifamily, mixed-use, renovation, land/development, other) and asset/use description.
- Lifecycle stage: acquisition, pre-construction/permitting, construction, completion/closeout, marketing/disposition, or reconstruction of a completed project.
- Owner/sponsor entity and primary Owner contact.
- Planned construction start, target completion, reporting cadence, and whether units/phases exist.
- Unit/phase structure when relevant: count, unit types, phases, and whether sales/disposition are in scope.

Before project creation, perform a server-side duplicate candidate check using entity/address/name. Show likely matches without merging automatically. Allow `Create anyway`, `Open existing`, or `Save draft for review` with an audit reason.

### Stage 2 — Acquisition, capital, and loan path

Branch based on lifecycle and whether property is acquired. Collect only applicable information:

- Acquisition status, purchase/target price, closing date/target date, closing costs, acquisition source, and source documents.
- Capital sources: owner equity, investor equity, acquisition/bridge loan, construction loan, seller financing, GC financing, other.
- For each applicable loan: lender, commitment, interest method (reserve/monthly/capitalized), rate or “pending”, reserve, maturity, draw policy, required evidence, effective dates, and linked loan term sheet/loan agreement.
- For investor equity: whether contributions, ownership/allocation, distribution/waterfall policy, and reporting permissions are already known; create delegated finance/owner follow-ups where needed.
- Capture source status for every material item: not received, uploaded/unreviewed, reviewed, contradicted, not applicable, or waived with reason/expiry.

### Stage 3 — Construction and governance model

Collect and branch on:

- Contract model: open-book, cost-plus, GMP, fixed price, milestone-based, profit share, or hybrid. For hybrid, identify each scope and its model.
- GC identity/contact and whether a signed contract exists.
- Contract value, fee/markup, retainage, payment application cadence, change-order rules, schedule-of-values availability, lien-waiver and evidence requirements—only if the chosen model requires them.
- Financial operating model: dedicated project operating account, shared account with allocation policy/inter-project transfer controls, card/cash/personal-payment paths, reconciliation cadence, and finance review policy.
- Budget/SOV availability, source/format, baseline owner, and whether it must be imported, mapped, or reconstructed.
- Schedule availability, source, milestone ownership, permit/inspection process, and current known blockers.

High-risk financial, contractual, access, or reporting settings should create a pending configuration version for Owner approval; no irreversible setting is silently applied.

### Stage 4 — Team, parties, access, and delegation

Present a role-specific invite builder for CFO, PM, GC, and Investor. Owner may add email, name, company/party, project scope, effective dates, role, optional task due date, and a short contextual invitation message.

- Preview the exact access each role receives before sending.
- Support “invite now,” “assign later,” and “save as draft.”
- Invite scope must be project-scoped where applicable, expiring/revocable, and auditable.
- Generate focused setup tasks automatically from project configuration: e.g., CFO account mapping/budget baseline; PM milestone schedule; GC contract and payment-evidence requirements; Investor visibility and delivery preference.
- Include a party checklist for lender, GC/vendors, investors, and other relevant contacts even when no invite is sent.

### Stage 5 — Source-document checklist

Generate a living checklist from the selected paths. At minimum, assess acquisition documents, loan documents, GC contract/SOV, budget baseline, schedule, bank/card statements, permits/inspections, and disposition information where applicable.

Each row needs status, responsible person, due date, gate impact, request/upload action, source link, and explanation of what remains blocked. Permit document upload/request actions from the wizard, but do not pretend an upload is reviewed or verified.

### Stage 6 — Review, launch, and readiness

Show a plain-English summary of selected models, unresolved facts, generated delegated tasks, outstanding evidence, approval-required settings, and exactly what workflows are now available/blocked.

Actions:

- `Save project draft`
- `Create project and send invitations`
- `Create project without invitations`

After creation, route to a redesigned project setup/readiness hub—not a generic dashboard. The hub should show project state (`DRAFT`, `SETUP_INCOMPLETE`, `READY_FOR_APPROVAL`, `ACTIVE`, `BLOCKED`), outcome gates, task ownership, approval queue, evidence checklist, and clear next actions. A project becomes active only once its relevant minimum configuration has passed its gate rules.

## B. Invite acceptance and self-onboarding

Retain the invite acceptance flow but add an onboarding landing state after account creation. It must clearly display organization, inviter, assigned role, project(s), expiry, scope, security requirement, privacy/data-access note, and the participant’s first required outcome. Do not merely show a password form then drop the person into questions.

Every role experience must follow this pattern:

1. Role-specific welcome: what the person is responsible for, what they can access, and what the Owner/team will receive.
2. Adaptive setup steps grouped by outcome, with conditional branches and document/task requests.
3. A review/submit state identifying pending Owner approvals versus changes that are immediately saved.
4. A role-ready landing state showing the first actionable task, completed setup, blocked dependencies, and an obvious route to the appropriate workspace.

### CFO / Accounting flow

Goal: establish a trustworthy financial baseline without making the CFO complete unrelated construction work.

- Confirm company/contact, project role, reporting currency/period close cadence.
- Identify project financial paths: dedicated/shared account, cards, cash, personal/other payments, and inter-project transfers.
- Map each account/source: institution, last four/account nickname, purpose, statement frequency, coverage start/end, source owner; never expose credentials or require bank connection during onboarding.
- If shared/commingled, require allocation policy, project coding approach, and transfer-control owner.
- Identify budget/SOV source and upload/import path; collect baseline type, source totals/date/version, mapping owner, and variance/review policy.
- Collect financing/draw operational details only within CFO scope: loan evidence, funding/cleared-deposit source, draw reconciliation owner, and reporting cutoff.
- End with a finance-readiness checklist that distinguishes “can import/reconcile” from “verified financial dashboard ready.” Owner approves production account mapping, baseline, and material loan configuration.

### PM flow

Goal: establish the evidence-backed milestone and field-progress workflow.

- Confirm company/contact, assigned project/phases, schedule source and version/date.
- Upload/link schedule or explicitly create a milestone-plan task; never mark unknown dates as zero delay.
- Define major milestones, dependencies, planned dates, responsible parties, relevant budget categories, and forecast-update cadence.
- Capture permit/inspection authority, evidence/photos workflow, delay reason taxonomy, and who verifies work for draws.
- Show what the PM can do immediately versus what depends on finance/lender setup.
- End at Timeline with first action: import/build milestone plan or update assigned milestone.

### GC flow

Goal: configure compliant, limited submission and evidence capture—not gain financial-control access.

- Confirm legal company, primary contact, project and assigned scopes/trades.
- Confirm contract model and signed-contract/SOV status; discrepancies create a task rather than modify Owner configuration.
- Branch: fixed/GMP/milestone contracts collect payment application format, billing cadence, milestone/SOV requirements, retainage/waiver expectations; open-book/cost-plus collect invoice/labor/material/evidence and markup-submission requirements; hybrid separates scopes.
- Confirm change-order submission workflow, documentation required, progress-photo expectations, and claim contacts.
- Finish on My Submissions with a first allowed submission/action. Clearly state that GC cannot approve claims, alter budgets, or mark funding as received.

### Investor flow

Goal: confirm a clean, read-only reporting experience with Owner-controlled visibility.

- Confirm identity/entity, project(s), preferred reporting delivery/channel/cadence, notification contact, and acknowledgement of read-only scope.
- Collect tax/K-1 or distribution-contact information only if the product and authorization support it; otherwise create an Owner-managed follow-up, do not collect sensitive financial data unnecessarily.
- Let the investor choose digest and alert preferences, not report data scope. Owner remains the only authority for publication and visibility.
- Finish on Project Update showing current published status or a respectful “No published update yet” state and contact route.

## C. Backend, data, and API work

Replace the simplistic static role question order with a versioned, server-side adaptive decision graph. Questions need stable key/version, scope, input schema, validation, condition/visibility rule, evidence requirement, action rules, approval policy, effective period, and help text. The client must receive enough structured information to render sections, question progress/outcomes, special-answer handling, uploads/tasks, and review state.

Implement or extend models/endpoints as needed for:

- Project draft/setup state and an idempotent draft save/resume model.
- Duplicate candidate detection before project creation.
- Expanded project fields and normalized related configuration where appropriate; do not overload an unstructured answer payload for all durable project data.
- Conditional questions and per-answer action side effects: follow-up tasks, document requirements, draft configuration proposals, and gate recalculation.
- Source checklist items, task assignment/due date/status, and document request links.
- Versioned high-risk configuration proposal / Owner approval-rejection flow with evidence and rationale.
- Multi-project role setup and project-scoped invite state.
- Readiness responses that expose outcome/gate status and blockers—not only an arbitrary aggregate percentage.

Maintain backward compatibility where feasible, migrate current data safely, write Alembic migrations, and add backend tests for every major branch and permission boundary.

## D. Acceptance criteria

- A new Owner can create a saved project draft with only the required identity fields, then resume it.
- An Owner can complete the detailed configuration above, delegate role setup, upload/request evidence, and launch a project with transparent readiness—not false “active” status.
- Each role sees a purpose-built flow and only information/actions allowed by its scope.
- The graph branches by lifecycle, financing path, account model, contract model, schedule/source availability, and investor/disposition relevance.
- Unknown/not-yet-available/not-applicable answers produce reasoned follow-up work and only block dependent gates.
- High-risk settings require appropriate Owner approval and preserve version/audit history.
- Existing access controls still prevent GC and Investor access to restricted finance/document detail.
- All core routes are usable on desktop and mobile; direct URL access respects the same backend authorization.
- Add tests for Owner bootstrap, each role’s primary happy path, one conditional branch per role, unknown-answer task creation, approval-required configuration, incomplete-readiness behavior, and access-denied routes.

## Deliverable format

First provide an implementation plan that maps the design into routes, reusable components, API/model changes, migrations, and tests. Then implement in coherent increments. Do not reduce this to a long static questionnaire, a prettier version of the existing three-step form, or client-only branching.

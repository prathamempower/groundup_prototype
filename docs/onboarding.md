# Adaptive Onboarding and Delegated Setup

## Goal

GroundUp AI onboarding must collect the minimum information needed to configure a trustworthy project workflow. The owner establishes the organization, project, access, and approval boundaries. CFOs, project managers, GCs, and investors complete their own assigned setup through role-specific adaptive questions and tasks. The owner approves high-risk decisions instead of entering every detail.

## Design principles

- Ask one relevant question at a time; do not use a fixed long form.
- Every answer can determine the next question, required document, task, approval, or enabled product workflow.
- Store answer, rule/version, actor, effective date, and source/evidence where applicable.
- Allow `UNKNOWN`, `NOT_YET_AVAILABLE`, and `NOT_APPLICABLE`; create a task rather than force a false answer.
- A configuration answer can be revised only through a versioned change flow when it affects financial, access, or reporting behavior.
- Each person sees only questions and tasks within their project role and access scope.

## Ownership model

| Role | Owns during onboarding | Owner approval required for |
|---|---|---|
| Owner/Admin | organization, project identity, workflow choice, invitations, approval policy | N/A |
| CFO/Accounting | source-account mapping, import configuration, financial-data review, opening reconciliation | production account mapping and finance readiness |
| Project Manager | milestone plan, schedule source, inspection/permit process | initial schedule baseline where policy requires |
| GC | company profile, contract confirmation, payment/evidence submission requirements | GC assignment and contract configuration |
| Investor | profile, invitation acceptance, notification preferences | all project/report visibility remains owner-controlled |

## Onboarding states

```text
INVITED → ACCOUNT_CREATED → PROFILE_COMPLETE → ROLE_SETUP_IN_PROGRESS
→ PROJECT_SETUP_IN_PROGRESS → READY_FOR_APPROVAL → ACTIVE
```

`BLOCKED`, `EXPIRED`, `REVOKED`, and `OFFBOARDED` are terminal or recovery states. A user may be active on one project while still completing setup on another.

## Organization and project bootstrap

1. Owner creates organization, confirms legal entity/defaults, and chooses identity/security policy.
2. Owner creates a project with only required identity fields: name, entity, address, currency, lifecycle stage, and owner.
3. Owner selects known project model answers or marks them unknown: acquisition model, financing model, GC contract model, account model, and disposition model.
4. GroundUp generates the project-specific question graph, document checklist, delegated setup tasks, and approval gates.
5. Owner invites participants by email, bulk import, or expiring project-scoped invite link.
6. Each participant completes self-onboarding. The readiness dashboard continuously identifies missing, conflicting, and approved configuration.

## Adaptive decision graph

### Project stage

```text
New project?
  Yes → Has property been acquired?
           No → collect target acquisition and planned financing path
           Yes → collect acquisition funding model
  No  → Select current stage
           Construction → configure loan, account, GC, schedule, and draw paths
           Marketing/Sale → configure units, sales, payoff, and distribution paths
           Complete → configure closeout reconstruction and actual-return path
```

### Financing

```text
Active construction loan?
  Yes → lender, commitment, interest method, draw process, required evidence
           Interest reserve → request reserve amount and depletion data
           Monthly/capitalized → request payment/accrual source and schedule
  No  → owner equity, investor equity, seller/GC financing, or other
           Investor equity → configure contributions, ownership, and distribution policy
```

### GC contract

```text
Contract model?
  FIXED_PRICE / MILESTONE_BASED → collect contract value, milestones, retainage, proof rules
  OPEN_BOOK / COST_PLUS         → collect markup, invoice/labor/card evidence rules, review policy
  HYBRID                         → identify fixed and open-book scopes; configure each separately
```

### Accounts and spend

```text
Dedicated operating account?
  Yes → map institution/account/purpose/statement coverage
  No  → shared account?
           Yes → require allocation policy and inter-project transfer controls
           No  → collect cash/card/personal-account payment paths and heightened evidence policy
```

## Question configuration contract

Every question has:

| Field | Purpose |
|---|---|
| `question_key`, `version` | stable, versioned identity |
| audience/scope | organization role, project role, lifecycle/contract applicability |
| prompt and input schema | supported answer type, options, amount/date/file constraints |
| visibility rule | condition under which question appears |
| validation rule | requiredness, format, allowed range, evidence requirement |
| action rules | next questions, task generation, document requirement, workflow configuration |
| approval policy | who can confirm/change the answer |
| effective period | when the answer applies; required for amendments |

Question logic executes server-side. The client only renders the resulting next step and cannot skip required rules by manipulating the UI.

## Enterprise identity and invite policy

- Email invite, project-scoped invite link, and CSV bulk-invite paths.
- Invite includes organization, role, permitted project(s), expiry, required tasks, and security requirements.
- Expiring/revocable invitations, domain allowlists, MFA policy, audit trail, and no self-assigned role escalation.
- SSO/SAML and enforced MFA are part of enterprise release; SCIM provisioning follows when enterprise identity providers require it.
- A removed user loses future access immediately but historical actions remain attributable.

## Readiness and progressive activation

Readiness is granular. A PM can create milestones while finance setup is incomplete; a CFO can import a statement before the full schedule exists. The following gates remain blocked until their prerequisites pass:

| Outcome | Required readiness |
|---|---|
| Verified financial dashboard | account mapping, source coverage, budget baseline/review policy, finance sign-off |
| Submission-ready draw | configured lender rule, required evidence, required reviews, no blocking condition |
| Investor publication | owner approval, permitted data scope, report snapshot, material-warning acknowledgement |
| Project closeout | payoff/disposition workflow configured, material reconciliation issues resolved or formally waived |

The owner receives a generated setup summary and approves only critical configurations: original baseline, loan/account project mapping, GC/contract configuration, approval-policy changes, investor visibility, and closeout.

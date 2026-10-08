# GroundUp — Master Product Architecture & UX Cleanup Plan

Act as a **Senior Software Architect, Product Designer, UX Engineer, and RBAC specialist**.

You have:
- `@docs/*`
- `current_screen.md`

Your first job is to **fully understand the documented business requirements and the actual current implementation**.

Do NOT start coding immediately.

## 1. Understand the Product First

Read all `@docs` completely.

Then read `current_screen.md` completely.

Treat:
- `@docs` = business/product source of truth
- `current_screen.md` = current implementation truth

Identify exactly where the current implementation conflicts with the documented product.

Do not blindly preserve existing screens or architecture.

---

# 2. Find Every Problem

Audit the complete application and identify:

### Product Problems
- Wrong workflows
- Missing workflows
- Duplicate workflows
- Unnecessary screens
- Screens that should be merged
- Screens that should be removed
- Features that do not belong in the product
- Incorrect terminology
- Wrong user journeys
- Prototype/demo concepts that should not exist in the final product

### UX Problems
- Cluttered pages
- Too many navigation items
- Poor information hierarchy
- Generic forms
- Duplicate information
- Excessive modals
- Confusing actions
- Dead ends
- Users being blocked by permission errors
- Poor empty/loading/error states
- Inconsistent page structures

### Architecture Problems
- Duplicate components
- Duplicate business logic
- Duplicate forms
- Duplicate permission checks
- Hardcoded role logic
- Hardcoded mock data
- Dead routes
- Orphaned components
- Unused components
- Conflicting route definitions
- State duplicated in multiple places
- Incorrect source of truth
- Prototype-only logic that should be removed

### RBAC Problems
Audit organization-level and project-level access.

Use this user role model:

- OWNER
- ADMIN
- PROJECT_MANAGER
- GENERAL_CONTRACTOR
- FINANCE
- ACCOUNTANT
- INVESTOR
- VIEWER

IMPORTANT:

**LENDER IS NOT A GROUNDUP APP USER.**

A lender is an external `Party` associated with a project/loan.

Do NOT create a lender login/persona/onboarding/user role unless the documentation explicitly requires an external lender portal later.

---

# 3. Create the Correct Product Structure

Do not organize the application around whatever screens currently exist.

Organize it around the actual GroundUp business lifecycle:

Project Creation
→ Acquisition
→ Due Diligence
→ Planning & Permits
→ Financing
→ Construction
→ Draws
→ Completion
→ Sales & Closing
→ Final Outcome

Then identify the supporting control areas:

- Financial Control
- Expenses & Cash
- Reconciliation
- Documents
- Risks & Issues
- Investors & Capital
- Reports
- Audit Trail

Determine which should be:
- Global workspace
- Project workspace
- Project tab
- Detail drawer
- Modal
- Background workflow
- Removed entirely

---

# 4. Decide What to REMOVE

For every current page/component, explicitly classify it:

```text
KEEP
MERGE
REBUILD
MOVE
REMOVE
REPLACE
```

For every REMOVE/MERGE decision explain:

- Why it exists currently
- Why it is wrong/redundant
- What replaces it
- What functionality must be preserved

Do not keep something simply because it already exists.

---

# 5. Decide What Must Be ADDED

Find every important missing product capability.

For every missing capability provide:

- Screen/workspace name
- Purpose
- Users
- Required information
- Main actions
- Related workflows
- Required components
- Data/dependency requirements

Do not invent functionality that is unsupported by `@docs`.

---

# 6. Redesign Navigation

Create the final navigation architecture.

Define:

## Global Navigation

Keep it intentionally small.

Example:

```text
Portfolio
Projects
Underwriting
Inbox
Tasks & Approvals
Reports
AI Assistant
```

Then define the project-level navigation separately.

Do not put every feature in the global sidebar.

For the project workspace, use lifecycle + control structure.

Also define:
- Organization switcher
- Project switcher
- User/profile access
- Admin/team access
- Role-specific navigation

---

# 7. Fix RBAC Completely

Design a single centralized authorization model.

```text
Organization
   ↓
User
   ↓
Project Membership
   ↓
Role
   ↓
Permissions
   ↓
Navigation
   ↓
Routes
   ↓
Actions
   ↓
Data visibility
```

Permissions should support:

```text
VIEW
CREATE
EDIT
SUBMIT
APPROVE
MANAGE
EXPORT
```

Do not use scattered checks such as:

```ts
if (role === ...)
```

throughout the application.

Create one source of truth.

A user with no access should generally never see the module.

Avoid:

```text
Visible Module
↓
Click
↓
403
```

Instead:

```text
No Permission
↓
Module hidden
```

Direct unauthorized URLs should gracefully redirect to an authorized destination.

---

# 8. Fix the User Experience

Every major workflow must feel like a real enterprise product.

Avoid:
- Generic CRUD pages
- Giant forms
- Dashboard clutter
- Random cards
- Too many tabs
- Unnecessary popups
- Technical permission messages
- Prototype/demo language

Use:
- Clear hierarchy
- Contextual actions
- Focused workflows
- Progressive disclosure
- Tables where structured data matters
- Detail drawers for record inspection
- Modals only for focused actions
- One clear primary action per screen

---

# 9. Fix New Project + Onboarding

Separate:

### User Onboarding
Who is the person?
What role do they have?
Which organization/project do they belong to?

### Project Creation
What is the project?
Where is it?
What type is it?
What stage is it?
How is it funded?

Do not combine unrelated setup.

New Project should use a **guided one-question-at-a-time flow**, where the next question depends on the previous answer.

Do not create a giant traditional form.

---

# 10. Remove Prototype/Demo Pollution

Identify and remove or isolate:

- Persona switching
- Fake login shortcuts
- Hardcoded metrics
- Fake timestamps
- Hardcoded project values
- Static AI keyword responses
- Demo-only lender personas
- Fake geographic/demo controls
- Prototype badges
- Test-only controls

Anything needed only for development should not appear as normal product UX.

---

# 11. Consolidate Components

Find duplicate implementations and create reusable systems.

Examples:

- One onboarding engine
- One project creation engine
- One permission system
- One change-order workflow
- One document/evidence system
- One report/export system
- One modal/drawer pattern
- One financial table pattern
- One status system
- One notification/alert system

Remove obsolete implementations after migration.

---

# 12. Produce a Final Screen Map

Create the proposed application map:

```text
Global
├── ...
│
Project Workspace
├── ...
│
Control
├── ...
│
Outcome
├── ...
```

For every screen provide:

- Purpose
- Primary users
- Navigation location
- Main sections
- Primary action
- Supporting actions
- Data required
- Permissions
- Related screens

---

# 13. Produce a BEFORE → AFTER Plan

Create a table:

| Current | Action | New | Reason |
|---|---|---|---|
| Existing screen | REMOVE | — | Redundant |
| Existing screen | MERGE | New workspace | Duplicate |
| Existing screen | REBUILD | New workspace | Wrong UX |
| Missing capability | ADD | New screen | Required |

Be extremely specific.

---

# 14. Produce Implementation Phases

Plan implementation in safe phases:

### Phase 1
Architecture + routes + RBAC

### Phase 2
Global shell + navigation

### Phase 3
Project workspace

### Phase 4
Core lifecycle workflows

### Phase 5
Financial/control workflows

### Phase 6
Role-specific experiences

### Phase 7
Cleanup + testing

For each phase include:
- Files/components affected
- Dependencies
- Risks
- Expected result

---

# 15. Final Response Requirements

Do NOT immediately write code.

Return a **complete master redesign/cleanup plan first**.

Your response must contain:

1. Executive assessment
2. Critical problems
3. What to remove
4. What to merge
5. What to rebuild
6. What to add
7. Final navigation architecture
8. Final RBAC architecture
9. Final screen map
10. Component architecture
11. Data/workflow concerns
12. BEFORE → AFTER mapping
13. Implementation phases
14. Priority:
   - P0 = critical
   - P1 = important
   - P2 = improvement

Be direct and opinionated.

Do not give generic UX advice.

Every recommendation must connect to an actual problem found in the current implementation or a requirement in `@docs`.

**Do not modify code until this complete plan has been reviewed and approved.**
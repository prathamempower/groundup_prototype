# GroundUp AI Design System

## 1. Purpose and tone

GroundUp AI is a financial control tool for owners, CFOs, and project managers. The interface should feel calm, precise, and trustworthy. Users make decisions about money, so every screen answers: **what is the status, what is the basis, and what needs my decision.**

Rules that drive every choice:

1. **Light theme only** for V1. One theme, fully polished.
2. **Content first.** No decorative illustrations, gradients, stock imagery, or marketing copy inside the app.
3. **Numbers are the hero.** Aligned, consistent, and always labeled with basis and as-of time.
4. **Status is never color alone.** Pair color with an icon and a text label.
5. **One primary action per view.** Everything else is secondary.
6. **Show only what the role can act on.** Hide, don't disable, unavailable features. Disable only when a prerequisite is missing, and say why.

## 2. Color tokens

### Neutrals (Layered & Soft Surfaces)

| Token | Hex | Use |
|---|---|---|
| `bg-app` | `#F8FAFC` | App canvas background (soft cool slate tint) |
| `bg-surface` | `#FFFFFF` | Cards, tables, panels, modals |
| `bg-subtle` | `#F1F5F9` | Table headers, inputs, subtle pill badges |
| `bg-muted` | `#E2E8F0` | Subtle borders, active indicator tracks |
| `border` | `#E2E8F0` | Subtle clean 1px dividers, cards, inputs |
| `border-strong` | `#CBD5E1` | Input hover, emphasized structural borders |
| `text-primary` | `#0F172A` | Crisp Slate-900 body, headings, hero numerals |
| `text-secondary` | `#475569` | High-contrast Slate-600 labels, helper text |
| `text-muted` | `#64748B` | Timestamps, secondary metadata (WCAG AA compliant) |

### Brand and semantic (Deep Indigo / Accent with Subtle Tinted States)

| Token | Hex | Use |
|---|---|---|
| `primary` | `#1E3A8A` | Deep premium navy/indigo for headers, brand, primary buttons |
| `primary-hover` | `#172554` | Rich pressed state |
| `primary-accent` | `#3B82F6` | Vibrant accent blue for focus rings, sparklines, active bars |
| `primary-subtle` | `#EFF6FF` | Tinted background for active navigation, highlighted rows |
| `success` / `success-subtle` | `#0D9488` / `#F0FDFA` | Verified, funded, reconciled (Teal/Emerald precision) |
| `warning` / `warning-subtle` | `#D97706` / `#FFFBEB` | Provisional, short-funded, expiring (Warm Amber) |
| `danger` / `danger-subtle` | `#DC2626` / `#FEF2F2` | Overrun, rejected, blocked, errors (Rose Crimson) |
| `info` / `info-subtle` | `#0284C7` / `#F0F9FF` | Proposed by AI, pending human review (Sky Blue) |

Contrast: all text/background pairs strictly meet WCAG 2.2 AA (4.5:1 body, 3:1 large text and interactive components).

### Modern Depth, Radius, & Elevation

- **Radius Scale:**
  - `rounded-sm`: 6px (micro tags, pills)
  - `rounded-md`: 8px (buttons, inputs, status badges)
  - `rounded-lg`: 12px (cards, side sheets, modal dialogs)
  - `rounded-xl`: 16px (hero dashboard containers, command palette)
- **Layered Elevation Shadows:**
  - `shadow-xs`: `0 1px 2px 0 rgba(15, 23, 42, 0.05)` (subtle input/card resting)
  - `shadow-sm`: `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)` (cards, popovers)
  - `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` (floating bars, dropdowns)
  - `shadow-overlay`: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)` (modals, drawers, cmd-k)
- **Subtle Gradients:** Applied exclusively to primary buttons (`linear-gradient(to bottom, #1E3A8A, #172554)`), active sidebar markers, and hero KPI surfaces (`linear-gradient(to bottom right, #FFFFFF, #F8FAFC)`).

### Financial meaning (consistent everywhere)

| Concept | Color | Label |
|---|---|---|
| Verified / reconciled | success | Verified |
| Provisional / unreviewed | warning | Provisional |
| AI proposal awaiting review | info | Proposed |
| Missing evidence / blocked | danger | Missing evidence / Blocked |
| Over budget / negative variance | danger text, minus sign | Over budget |
| Under budget / favorable | success text, plus sign | Under budget |

Four truths use fixed icons and labels so users learn them once: **Budget**, **Spend**, **Funding**, **Progress**. They are never merged into one figure without a named basis.

## 3. Typography

- **Typeface:** IBM Plex Sans (400, 500, 600). Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Numbers:** `font-variant-numeric: tabular-nums` everywhere amounts appear. Right-align in tables.
- **Monospace** (IBM Plex Mono) only for hashes, masked account identifiers, and IDs.
- Sentence case for all labels, buttons, and headings. No all-caps.

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Page title | 24 / 32 | 600 | One per page |
| Section title | 18 / 26 | 600 | Panels and card headings |
| Subsection | 15 / 22 | 600 | Table group headers, form groups |
| Body | 14 / 22 | 400 | Default text, table cells |
| Label | 13 / 18 | 500 | Form labels, column headers |
| Caption | 12 / 16 | 400 | Source citations, as-of times, helper text |
| Key figure | 28 / 36 | 600 | Dashboard KPIs, tabular |

Line length for prose is capped at 72 characters. Minimum text size is 12px; interactive text is 14px or larger.

## 4. Layout and spacing

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48. No other values.
- **Grid:** 12 columns, 24px gutters, content max-width 1440px. Data screens may use full width.
- **Shell:**
  - Left sidebar, 232px, collapsible to 64px icons.
  - Top bar, 56px: project switcher, global search, notifications, user menu.
  - Page header: title, status badge, as-of time, one primary action.
- **Breakpoints:** 640 (mobile), 1024 (tablet), 1280 (desktop). Desktop is primary. Tablet and mobile support read, review, approve, and evidence upload. Dense reconciliation tables stay desktop-first with horizontal scroll inside the table container.
- **Radius:** 6px for inputs, buttons, badges; 8px for cards and modals. No other radii.
- **Elevation:** borders define structure. Shadow only on overlays (menus, modals, toasts): `0 4px 16px rgba(27,34,48,0.12)`.

## 5. Navigation and information architecture

Sidebar, in this order, shown by role:

| Item | Owner | CFO | PM | GC | Investor |
|---|:-:|:-:|:-:|:-:|:-:|
| Control center | ✓ | ✓ | ✓ | | |
| Documents | ✓ | ✓ | ✓ | | |
| Budget | ✓ | ✓ | ✓ | | |
| Reconciliation | ✓ | ✓ | | | |
| Draws | ✓ | ✓ | ✓ | | |
| Timeline | ✓ | ✓ | ✓ | | |
| Economics | ✓ | ✓ | | | |
| My submissions | | | | ✓ | |
| Project update | | | | | ✓ |
| Settings and team | ✓ | | | | |

- Active item uses `primary-subtle` background and `primary` text with a 3px left bar.
- A badge on an item shows the count of open, material work items only. No badge when zero.
- Breadcrumbs appear on detail pages only: Project / Section / Record.
- Global search finds documents, vendors, draws, and transactions within the user's scope.

## 6. Components

### Buttons

| Type | Style | Rule |
|---|---|---|
| Primary | `primary` fill, white text | One per view |
| Secondary | White, `border-strong`, primary text | Supporting actions |
| Tertiary | Text only, primary | Low-priority actions |
| Destructive | `danger` fill, white text | Reject, withdraw, reverse. Always confirm. |

Height 36px (40px on touch). Labels are verb plus object: "Approve baseline", "Confirm match", "Publish update". Loading state shows a spinner and keeps the label; the button is disabled during the request. The same verb is reused in the resulting toast ("Approve baseline" → "Baseline approved").

### Forms

- Labels above inputs. Required fields marked in the label text ("Required"), not by color alone.
- Helper text below the input in caption style; validation errors replace it, in `danger`, with an icon.
- Validate on blur and on submit; never on first keystroke. Preserve user input on error.
- Money inputs: currency prefix, thousands separators, tabular numerals, no spinners.
- Date inputs accept typing and a picker. Show the format.
- Fields with `Unknown`, `Not yet available`, and `Not applicable` options show them as radio choices under the field, as defined in onboarding. Choosing one creates a task and says so.
- One question per step in onboarding, with visible progress ("Step 3 of 7") only when the count is known.

### Tables (core component)

- Sticky header, 44px rows (36px compact option), 12px horizontal padding.
- Text left-aligned; amounts and percentages right-aligned; status centered or left in a fixed column.
- Column headers sortable where useful; the sort direction is shown with an icon.
- Row selection with checkbox for bulk actions; a bulk-action bar appears on selection.
- Totals row pinned at the bottom with a label for its basis.
- Filters above the table: search, status, date range. Active filters appear as removable chips with a "Clear all" action.
- Pagination at the bottom: rows per page (25, 50, 100) and cursor controls.
- Row click opens the detail side panel; the row stays visible.
- Empty and loading states follow section 8.

### Status badges

Pill-shaped (6px radius), 24px height, icon plus text, subtle background with strong text color. Examples: `Verified`, `Provisional`, `Proposed`, `Missing evidence`, `Blocked`, `Funded`, `Short-funded`, `Under review`.

### Key figure tile

Used on the control center. Contains: label, value, basis line ("Approved budget", "Cleared cash"), change vs original with sign and color-plus-icon, and a "View sources" link. No sparklines or decoration. Tiles are neither clickable as a whole nor animated.

### Evidence and source citation

Every material number can open a **source panel**: document name, page or row, extraction version, reviewer, review time, and a link to the original. The control is a small "Sources" text button, always in the same position next to the figure.

### Review panel (documents and reconciliation)

Two columns: original document viewer on the left (page navigation, highlighted cited area), proposed fields on the right. Each field shows raw value, normalized value, confidence, and actions: Accept, Edit, Reject. Keyboard shortcuts for accept and next field. The primary action "Confirm and continue" is enabled only when every required field has a decision.

### Reconciliation row

Shows source transaction, proposed link, confidence with reasons, evidence strength, and actions: Accept, Split, Remap, Exclude, Mark as transfer. Allocation dialog shows a running balance and blocks save until it equals the source amount.

### Modals and drawers

- Modals for short confirmations and approvals (max width 560px). Drawers (right, 480–640px) for detail and edit work.
- Focus is trapped; Esc closes; focus returns to the trigger.
- Approval dialogs list exactly what will change and what stays immutable, and ask for a rationale when required by policy.

### Toasts and banners

- Toasts: confirm a completed action, auto-dismiss in 5 seconds, never used for errors that need action.
- Banners: persistent, inline at the top of a page for data-quality warnings ("2 sources missing. Forecast is incomplete.") with a link to resolve.

### Charts

- Only when a chart answers a question a table cannot: trend of forecast profit, budget vs actual by category, contingency burn.
- Max 5 series, a legend, labeled axes with units, and a data table alternative.
- Color is paired with line style or direct labels. No 3D, no pie charts for more than 3 parts.

## 7. Key screen patterns

### Control center (Owner)

```text
Page title  | status badge | as-of time                  [Primary: Create investor update]
Data-quality banner (only when relevant)
Key figures: Forecast profit | Cash gap | Contingency left | Forecast completion
Original vs current forecast (table with variance and reason)
Open exceptions (top 5, with owner and age)  |  Draw status
```

Missing data shows "Incomplete" with the reason, never zero.

### Document inbox

Table of documents with type, project, status, uploader, and duplicate flag. Upload area sits above the table as a compact button and drop zone. Quarantined files show the reason and a resolution action.

### Draw workspace

Draw header with lifecycle status. A four-column amounts strip: Requested, Recommended, Approved, Cleared funded. Each is separate and labeled. Lines table below. A right-hand checklist shows missing requirements. Shortfall appears as a warning banner with the amount.

### Timeline

Milestone list with planned, actual, and forecast dates, percent complete, evidence count, and delay cause. A simple horizontal bar view is optional. At-risk dependencies are labeled in text.

### Investor update

Single column, read-only, print-friendly. Shows stage, original vs current economics, progress, risks, and next funding event, with the as-of time and any disclosure. No navigation to internal data.

## 8. States and microcopy

| State | Pattern |
|---|---|
| Loading | Skeleton in the shape of the content; spinner only inside buttons |
| Empty | One sentence on what belongs here, plus one action. Example: "No bank statements yet. Upload a statement to start reconciliation." |
| Error | What happened, why if known, how to fix. No apologies. Example: "Allocation is $120.00 short of the source amount. Add the remaining amount to continue." |
| Blocked | Name the prerequisite and link to it. Example: "Submission-ready needs a lender rule. Configure lender rules." |
| Success | Past-tense confirmation of the action |
| Stale data | Show "As of Oct 10, 2026, 8:00 AM" and a Refresh action |

Writing rules: plain verbs, active voice, sentence case, same name for an action across the flow. Say "Approve", "Reject", "Confirm match". Avoid "Submit", "OK", and system terms like "payload" or "entity". Show amounts with currency and two decimals; show dates as "Oct 10, 2026".

## 9. Interaction and accessibility

- WCAG 2.2 AA. Full keyboard operation, visible focus ring (2px `primary`, 2px offset) on every interactive element.
- Touch targets at least 40×40px; 24×24px minimum for dense table controls with adequate spacing.
- Semantic landmarks, table headers with scope, labels bound to inputs, `aria-live` for toasts and async job status.
- Never rely on color alone. Respect `prefers-reduced-motion`.
- Motion is functional only: 150ms for panel open/close and focus change. No decorative or entrance animations.
- Destructive or high-risk actions (approve baseline, publish update, reverse record) require confirmation with a clear summary. Step-up authentication is requested when policy requires it.
- Autosave drafts of long forms; show "Saved" with time. Never lose work on navigation: warn before leaving unsaved changes.
- Role-based visibility is enforced by the API. The UI hides features for convenience only.

## 10. Do and don't

| Do | Don't |
|---|---|
| Show basis and as-of time on every figure | Show a single "total" without naming what it includes |
| Use labels, icons, and color together | Use red or green alone |
| Keep Requested, Approved, and Funded separate | Combine them or imply approved means funded |
| Show "Incomplete" when inputs are missing | Show zero for missing data |
| Offer one clear next action | Fill the page with equal-weight buttons |
| Link every number to its sources | Present figures without traceability |
| Use plain, specific copy | Use marketing language or filler |

## 11. Implementation notes

- Tailwind CSS with the tokens above defined as CSS variables and mapped in the Tailwind config. No hard-coded hex values in components.
- shadcn/ui as the component base for dialog, menu, select, tabs, tooltip, restyled with the tokens above so no default shadcn colors or radii remain. React Hook Form with Zod for validation, matching server rules.
- A single shared component library: Button, Input, MoneyInput, DateInput, Select, DataTable, StatusBadge, KeyFigure, SourcePanel, ReviewPanel, Drawer, Modal, Banner, Toast, EmptyState.
- Money, date, and status formatting live in shared helpers so every screen renders values identically.
- Visual regression and axe accessibility checks run in CI for each shared component and for the primary screens.

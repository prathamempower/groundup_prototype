---
trigger: model_decision
---

# GroundUp AI: Project Craft & Agentic Engineering Rules

These rules are mandatory for all agentic workflows, feature implementations, and code modifications within this codebase.

---

## 1. Mandatory Pre-Flight Checklist

Before writing or modifying any code, the agent MUST run and verify the following 5-point checklist:

1. **Root Intent & Surface Check:** Identify the exact problem being solved and the exact files responsible. Do not touch unrelated files.
2. **Cognitive Load & Slop Audit:** Scrutinize every planned element. Reject unnecessary filler, fake badges (like "Sample Project"), artificial subheaders, bulky paragraph checklists, and toy-like animations.
3. **Boundary & Concurrency Assessment:** Evaluate behavior under network latency, multi-user simultaneous actions, and rapid repeated clicks.
4. **Contract & Regression Safety:** Verify that existing data contracts, API routes, and components remain intact.
5. **Brand & Language Governance:** Enforce Zero Em Dashes, Zero Executive Acronyms (CEO/CTO), and Zero AI filler jargon (*delve, foster, leverage, facilitate, streamline*).

---

## 2. Mandatory Change & Addition Logging

At the completion of every task, provide a clear, structured summary:
- **Modified / Created Files:** Clickable file links with exact paths.
- **Removed (Anti-Slop):** What was removed and why (e.g. removed fake labels, removed redundant cards).
- **Added / Refined:** What was created or enhanced, adhering to Apple HIG minimalism.
- **Cognitive Impact:** How the change reduces friction and respects user time.

---

## 3. Testing & Verification Standard

1. **Unit Tests:** Mandatory for mathematical calculations (retainage, interest burn, WBS aggregation) and data normalization.
2. **Integration Tests:** Mandatory for API routes, database operations, and state machine transitions.
3. **End-to-End Tests:** Mandatory for complete user flows (Playwright / Vitest). Run with realistic and adversarial payloads.

---

## 4. Adversarial "Break My App" QA Loop

After implementing any feature or fix, the agent must actively attempt to break the implementation:
1. **Multi-User Simulation:** Test concurrent actions from multiple tabs or simulated users touching the same record.
2. **Rapid Click / Debounce Stress:** Click buttons rapidly before promises resolve; type quickly in inputs to check debounce stability.
3. **Malformed Inputs:** Test empty strings, extreme numbers, special characters, and network timeout errors.
4. **Zero-Crash Verification:** The application must never crash, render a blank screen, or display unhandled promise rejections.

---

## 5. First-Principles Clarification Loop

When requirements contain any ambiguity or multiple design options:
- Ask simple, direct, child-like clarifying questions one at a time.
- Provide the recommended best-practice option with clear rationale.
- Walk down each branch of the design tree until full alignment is reached.

---

## 6. Containerless Architecture & Unconstrained Layout Governance

1. **Zero Unnecessary Containers & Pill Badges:** Never wrap raw text, mode switch links (*Already have an account? Log in*, *Don't have an account? Sign up*), or divider labels (*or continue with email*, *or register with work email*) inside artificial boxes, pill badges, background containers, borders, or shadow wrappers. Present them as pure, clean, high-contrast typography directly against the fluid background.
2. **Whole Screen Fluid Fit:** Layouts must adaptively fit the viewport across any device height and width without awkward trapped whitespace or artificial microscopic column clamps. Forms should scale intelligently across tablet and desktop (`w-full max-w-xl md:max-w-2xl lg:max-w-3xl`) with balanced vertical rhythm that never forces unnecessary scrollbars.
3. **Architectural Heading Text Effects:** Major headers (such as *Welcome back* and *Create your account*) must feature refined, sophisticated text effects: subtle dark slate-to-navy depth gradients, tight optical tracking (`tracking-tight`), and polished font smoothing that elevate the executive aesthetic.

---

## 7. Prohibition of AI Slop Styles & Mandatory Semantic SVGs

1. **Strict Prohibition of `shadow-xs` & Generic Card Slop:** Do not sprinkle arbitrary `shadow-xs`, artificial blurry box shadows, or repetitive `bg-white/95` cards across inputs, buttons, and badges. Use crisp borders (`border border-slate-300`), clean flat surfaces, or high-definition elevation.
2. **Mandatory SVGs Over Colored Dots:** Never use fake colored status dots (e.g. `<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />`) or arbitrary colored pills (e.g. `text-emerald-700`) to represent organizations, companies, or metadata. Always render precise, professional SVG icons (e.g. Lucide `Building`, `Briefcase`, `Shield`, etc.) with semantic stroke colors and sizing.



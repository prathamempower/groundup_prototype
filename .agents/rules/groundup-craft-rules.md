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

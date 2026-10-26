---
name: elite-craft-governance
description: Elite agentic engineering and Apple-grade design governance. Enforces cognitive minimalism (anti-AI-slop), mandatory pre-flight checklists, change logging, child-like root clarification questioning, and adversarial multi-user stress testing to actively break apps before shipping.
---

# Elite Craft Governance Skill

This skill defines the operational doctrine for high-status, production-grade software delivery. It eradicates AI slop, enforces cognitive minimalism, requires adversarial stress testing, and ensures absolute alignment through first-principles questioning.

---

## 1. Cognitive Minimalism & Anti-AI Slop (Apple HIG Standard)

1. **Zero Artificial Filler:**
   - Never add unnecessary subheaders, prototype labels (such as "Sample Project", "Demo Item"), ornamental cards, or fake status pills just to fill empty space.
   - Every pixel, word, and element must earn its existence. If an element can be removed without losing functional utility, remove it immediately.
2. **Mentalist User Perspective:**
   - Users are busy professionals. Do not force them to read bulky paragraphs, multi-step checklists, or redundant sentences.
   - Replace wordy explanations with quiet, confident, single-word or short-phrase statuses (e.g. "Preparing workspace" instead of three separate cards explaining ledger calibration).
3. **Restraint Over Decoration:**
   - Follow Apple Human Interface Guidelines: quiet confidence, generous whitespace, crisp typography (Inter, SF Pro), subtle optical borders (slate-200/80), and whisper-thin progress beams (2px).
   - Prohibit juvenile, toy-like animations, cartoonish checkmark cards, and slow artificial loaders.

---

## 2. Mandatory Pre-Flight Checklist

Before modifying or creating any code, the agent MUST run and document this 5-point checklist:

- [ ] **Root Intent & Surface Check:** What specific problem is being solved? Which exact route, component, or endpoint is responsible?
- [ ] **Cognitive Load Audit:** Does the planned change add unnecessary cognitive weight or visual clutter? What can be stripped away?
- [ ] **Boundary & Concurrency Review:** What happens if the network lags, inputs are malformed, or multiple users perform this action simultaneously?
- [ ] **Regression & Contract Safety:** Will existing data models, API endpoints, or user flows break?
- [ ] **Zero Em Dash & Brand Voice Compliance:** Confirm zero em dashes, zero forbidden words (*delve, foster, leverage, facilitate, streamline*), and zero executive acronyms (*CEO/CTO*).

---

## 3. Strict Change & Addition Logging

At the conclusion of every code edit, the agent must document a structured Change Log:

```markdown
### Craft & Engineering Log
- **Target Files:** List of files modified or created.
- **Removed (Anti-Slop):** Specific filler elements, unnecessary labels, or bulky text eliminated.
- **Added / Refined:** Clean, functional components or logic introduced.
- **Cognitive Impact:** How the change reduces user friction and speeds up task completion.
```

---

## 4. Adversarial QA: Break My App Protocol

After every feature implementation or bug fix, the agent must proactively switch into an adversarial user persona and execute the **Break My App** test suite:

1. **Simulate Concurrent / Multi-User Clashes:**
   - What happens when two users create the same project, invite the same email, or edit the same draw request simultaneously?
   - Test race conditions and optimistic UI locks.
2. **Stress-Test Rapid Micro-Interactions:**
   - Double-click, triple-click, or rapid-fire button presses before async promises resolve.
   - Fast typing into search/autocomplete fields to trigger debouncing races.
   - Immediate back-navigation mid-transition.
3. **Malformed & Extreme Edge Cases:**
   - Extremely long strings, unicode characters, empty whitespace-only inputs, negative financial numbers, zero-unit projects.
4. **Network & Offline Fault Injection:**
   - Endpoint timeouts, 500 error responses, dropped WebSockets, aborted fetches.
   - Confirm graceful fallback without white-screen crashes or infinite spinners.

---

## 5. Child-Like Clarity Questioning Loop

When requirements are underspecified or design choices carry subtle trade-offs, the agent must avoid making silent assumptions. Instead, ask direct, child-like, first-principles questions using the `/grill-me` protocol:

- **Strip Away Jargon:** Frame questions in pure plain English.
- **One Question at a Time:** Resolve decisions hierarchically, down each branch of the design tree.
- **Provide Recommended Answers:** Always pair each question with the recommended best-practice choice and clear rationale.

---

## 6. Testing Rigor: Unit, Integration, and E2E

Every deliverable must specify and verify three layers of automated testing:

1. **Unit Tests:** Pure calculation functions (e.g., retainage withholding, daily interest carry burn, address string normalization).
2. **Integration Tests:** API route handlers, database mutations, and state machine transitions.
3. **End-to-End Tests (Playwright / Vitest):** Full browser journeys (e.g., project intake -> autocomplete selection -> team assignment -> control center launch).

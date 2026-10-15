# GroundUp AI: Design System and Frontend Guidelines

This specification defines the visual, interaction, and component architecture standards for GroundUp AI. The design philosophy balances institutional financial clarity with modern, tactile software ergonomics.

***

## 1. Visual Language and Aesthetic Principles

* **Institutional Light Canvas:** Use an off-white, light neutral canvas (`#f8f9fa`, `bg-slate-50`, `bg-slate-100`). Prohibit pitch-black backgrounds, high-contrast dark-mode saturation, and neon palettes.
* **Refined Editorial Typography:** Primary font family is Inter for tabular numerals, metadata, and controls; Outfit for executive headers and section markers. High-legibility deep navy typography (`text-slate-900`, `text-slate-800`).
* **Harmonious Financial Accents:** 
  * Success and Funding: Deep Emerald (`#047857`, `#059669`)
  * Master Budget and Systems: Deep Navy and Slate (`#0f172a`, `#1e293b`)
  * Progress and Action: Muted Sky and Royal Blue (`#2563eb`, `#0284c7`)
  * Attention and Variance: Warm Amber (`#d97706`, `#b45309`)
  * Risk and Frozen Codes: Brick Crimson (`#b91c1c`, `#991b1b`)
* **Prohibited Visual Anti-Patterns:**
  * No generic purple AI gradients.
  * No aggressive neon borders or glow effects.
  * No excessive, blurry glassmorphism that impedes text contrast.
  * No cartoonish illustrations or game-style 3D models.
  * No claustrophobic SaaS card grids.
* **3D Iconography:** Use refined 3D-style isometric and depth tokens with restrained lighting and soft shadows. Icons must enhance instant recognition, not decorate needlessly.

***

## 2. Component Architecture and Hierarchy

* **Paradigm:** Feature-driven component architecture with atomic foundational tokens:
  * `atoms/`: Buttons, badges, inputs, micro-indicators, icons.
  * `molecules/`: Search inputs, metric stat cards, audit rows, breadcrumbs.
  * `organisms/`: Navigation header, sidebar, budget table, draw submission panel.
  * `templates/` and `screens/`: Intake wizard, command center, project overview.
* **State Management:**
  * Server-Authoritative State: Synchronize data via TanStack Query or native fetch hooks with deterministic caching.
  * Local Ephemeral State: Reserve React `useState` strictly for local UI interactions such as dropdown open/close states, input focus, and tab indices.
  * No Phantom State: Never keep financial calculations purely in uncommitted client state.
* **Interactive Element States:** Every interactive button and card must explicitly implement:
  * `:hover` with smooth micro-scale or subtle shadow lift.
  * `:focus-visible` with a crisp 2px focus ring (`ring-2 ring-slate-900 ring-offset-2`).
  * `:active` with subtle tactile depression.
  * `:disabled` with clear opacity drop (`opacity-50 cursor-not-allowed`) and `aria-disabled="true"`.

***

## 3. Styling Standards and Utility Ordering

* **Styling Engine:** Tailwind CSS v4 with semantic color definitions.
* **Utility Class Ordering:**
  1. Layout: `flex`, `grid`, `inline-flex`, `block`, `hidden`
  2. Positioning: `relative`, `absolute`, `fixed`, `top-0`, `z-10`
  3. Box Model: `w-full`, `max-w-md`, `h-10`, `p-4`, `px-6`, `py-2`, `m-2`
  4. Typography: `font-sans`, `text-sm`, `font-semibold`, `tracking-tight`, `text-slate-900`
  5. Visuals and Borders: `bg-white`, `border`, `border-slate-200`, `rounded-xl`, `shadow-sm`
  6. Interactions and Transitions: `transition-all`, `duration-150`, `hover:border-slate-400`, `focus-visible:ring-2`
* **Semantic Design Tokens:** Avoid arbitrary random hex values in inline markup. Utilize semantic palette classes (`bg-slate-50`, `border-slate-200`, `text-emerald-700`).

***

## 4. Jitter-Inspired Motion Principles

GroundUp AI uses purposeful, physics-informed micro-motion to communicate state changes and hierarchy:

* **Staggered Card Entrances:** Stagger child cards into view with a 40ms interval delay and a 200ms cubic-bezier transition (`cubic-bezier(0.16, 1, 0.3, 1)`).
* **Restrained Parallax and Scale:** Onboarding selection cards respond to mouse hover with a gentle scale up (`scale-[1.015]`) and border contrast enhancement.
* **Branch Transitions:** Progress bar transitions smoothly between questions without jarring page repaints.
* **Reduced Motion Support:** All transitions must honor user accessibility preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

***

## 5. Accessibility (a11y) and Operational Standards

* **Semantic HTML:** Use landmark elements (`<main>`, `<nav>`, `<header>`, `<section>`, `<article>`) appropriately. Never use an unsemantic `<div>` or `<span>` for an action; always use a native `<button>` element.
* **Screen Reader Affordances:** Provide explicit `aria-label` attributes on icon-only buttons, close controls, and modal dismiss triggers.
* **Keyboard Navigation:** Modal dialogs, dropdown menus, and review sheets must implement logical focus trapping, supporting `Tab`, `Shift+Tab`, and `Escape` dismissal.
* **High Contrast Ratios:** All body copy and tabular financial figures must surpass WCAG AA requirements with a minimum contrast ratio of 4.5:1 against their backgrounds (aiming for 7:1 on primary figures).

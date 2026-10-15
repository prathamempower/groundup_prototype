# GroundUp AI: Landing Page & Onboarding Integration Package

This standalone package contains the high-conversion **Landing Page** and the 8-step data-driven **Onboarding Portal** extracted directly from GroundUp AI. It is completely isolated and decoupled from the internal dashboard modules.

---

## 1. Package Contents Overview

```
├── app/
│   ├── page.tsx                     # Landing Page (Root '/') with full SEO & OpenGraph tags
│   ├── layout.tsx                   # Root HTML shell with font definitions & AppProviders
│   ├── globals.css                  # Tailwind styles, color tokens & blueprint background grid
│   ├── icon.tsx                     # Dynamic Edge favicon generator
│   ├── loading.tsx, error.tsx       # Route boundaries
│   ├── onboarding/
│   │   └── page.tsx                 # Onboarding Portal Route ('/onboarding')
│   └── api/
│       └── onboarding/              # Self-contained Next.js Route Handlers
│           ├── session/route.ts     # Session rehydration endpoint
│           ├── answer/route.ts      # Autosave step answers endpoint
│           └── complete/route.ts    # Workspace provisioning & finalization endpoint
├── components/
│   ├── landing/                     # All 22 landing components (Hero, Film, Cashflow, Stories, etc.)
│   ├── onboarding/                  # NewUserIntakePage, WorkspaceReadyScreen, GroundUpLoader
│   ├── brand/                       # SVG logos and vector brand marks
│   ├── motion-primitives/           # Kinetic typography (text-effect)
│   ├── providers/                   # TanStack QueryClient, Toast, and Tooltip providers
│   ├── layout/                      # Standalone AppShell container
│   ├── ui/                          # Essential UI primitives (chart, masked-text, skeleton, alert, toast)
│   ├── logo.tsx, reveal.tsx         # Shared core animation & brand components
│   └── LegalModal.tsx, Toast.tsx    # Compliance terms & toast notifications
├── hooks/                           # Intersection observer & scroll parallax hooks
├── lib/
│   ├── cashflow-data.ts             # Live cashflow chart dataset
│   ├── sample-documents.ts          # Sample Schedule of Values data
│   ├── validations/onboarding.ts    # Zod schemas for onboarding steps 1-8
│   ├── types/index.ts               # Canonical TypeScript interfaces
│   ├── api/                         # Frontend API abstraction
│   └── utils.ts, fonts.ts           # Styling & typography utilities
└── public/
    ├── landing/                     # Hero imagery & vector icons
    ├── videos/                      # Product film demo MP4 & video poster JPG
    └── sample-docs/                 # Sample project Excel spreadsheets
```

---

## 2. Quick Start (Running Standalone)

You can run this package immediately as a standalone Next.js application:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* **'/'** renders the full Landing Page.
* Clicking **"Start your project"** or **"Get Started"** navigates to **'/onboarding'**.
* **'/onboarding'** guides users through the 8-step intake flow with real-time field validation, draft autosaving in localStorage, and post-onboarding summary.

---

## 3. How to Integrate Into Your Existing Next.js Dashboard

If you already have an existing Next.js application with its own dashboard, follow these steps:

### Step A: Copy Files Into Your Project
1. Copy `components/landing/` and `components/onboarding/` into your `components/` directory.
2. Copy `components/motion-primitives/` and `components/brand/` into your `components/` directory.
3. Copy missing components from `components/ui/` (`chart.tsx`, `masked-text.tsx`, `rotating-word.tsx`).
4. Copy `public/landing/`, `public/videos/`, and `public/sample-docs/` into your `public/` folder.
5. Copy `lib/validations/onboarding.ts`, `lib/cashflow-data.ts`, and `lib/sample-documents.ts` into your `lib/` folder.
6. Copy the routes:
   - `app/onboarding/page.tsx` -> `your-app/app/onboarding/page.tsx`
   - `app/api/onboarding/` -> `your-app/app/api/onboarding/`

### Step B: Hooking Up Onboarding Completion to Your Dashboard
When a user completes the 8-step onboarding intake, GroundUp renders `WorkspaceReadyScreen`.

To route users directly into your own dashboard:
Open `components/onboarding/WorkspaceReadyScreen.tsx` around line 50 and update `handleLaunchDashboard`:

```tsx
const handleLaunchDashboard = () => {
  // Set your own dashboard route here:
  router.push(`/dashboard?project=${projectId}`);
};
```

Or handle it directly in `app/onboarding/page.tsx` inside `handleOnboardingComplete`:

```tsx
const handleOnboardingComplete = (projectId: string, reportData: unknown) => {
  // Save credentials or token
  // Redirect to your dashboard:
  router.push('/dashboard');
};
```

### Step C: Tailwind CSS Configuration
Merge the custom color tokens and animations from this package's `tailwind.config.ts` into your project's `tailwind.config.ts`:
* Colors: `verified`, `attention`, `card`, `app`, `surface`
* Fonts: `font-sans`, `font-mono`
* Blueprint background pattern from `app/globals.css`

---

## 4. Onboarding Steps Implemented

1. **Step 1: Work Email & Verification** (Corporate domain check, OTP entry, Google SSO mock).
2. **Step 2: Account Setup** (First name, last name, unique username availability, DOB >= 18 verification, SMS phone OTP).
3. **Step 3: Strategic Focus** (Active ground-up construction vs new venture, primary and secondary operational challenges).
4. **Step 4: Organization Details** (Entity name, company scale tier, team size choice with custom increment/decrement stepper, company website).
5. **Step 5: First Project Setup** (Choice prompt to add project or skip for now, project name, jobsite address, construction lifecycle stage, target completion date).
6. **Step 6: Project Records & Documents** (Document category chips, drag-and-drop file upload zone, sample Schedule of Values loader, skip option).
7. **Step 7: Team Access Invitations** (Invite email, RBAC roles: Developer/Owner, Finance Lead, PM, GC, Investor, skip option).
8. **Step 8: Workspace Setup & Micro-Loaders** (4 atomic setup stages, progress calibration, database completion sync).
9. **Handover: Workspace Ready Screen** (Project summary card, target budget, funding status, jump to dashboard).

---

## 5. Technical Requirements

* **Node.js:** >= 18.17.0
* **Next.js:** 14.x or 15.x (App Router)
* **React:** 18.x or 19.x
* **Key Dependencies:** `lucide-react`, `motion`, `recharts`, `zod`, `@tanstack/react-query`, `clsx`, `tailwind-merge`

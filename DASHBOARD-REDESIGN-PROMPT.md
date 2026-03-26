# PitchIQ Dashboard & Internal Pages — Total Redesign Prompt

> **Scope**: Every authenticated page EXCEPT the landing page (`/`), public deck viewer (`/deck/[shareId]`), and marketing pages (`/piq-score`). This covers: Dashboard, Create, Editor, Score, Batch Score, Settings, Billing, Credits, Workspace, Practice, Ideas, Startup Profile, and all sub-views.

> **Philosophy**: PitchIQ is an AI-native fundraising platform. The interface should feel like a **mission control for raising money** — not a SaaS admin panel. Every pixel should communicate: "This tool was built by people who understand fundraising and design better than you do, and it's about to make you look incredible."

> **CRITICAL — Version Toggle Strategy**: The new dashboard is built **alongside** the existing one, NOT as a replacement. Users can switch between "Classic" and "New" via a toggle. Both versions are fully functional at all times. This is implemented before any redesign work begins — see **PHASE -1** below.

---

## PHASE -1 — VERSION TOGGLE SYSTEM

This phase must be completed FIRST. It creates the infrastructure that lets both the old and new dashboards coexist safely. No existing code is deleted or modified — the new design is built in a parallel directory structure.

### -1.1 User Preference Model

Add a field to the User model to persist their dashboard version choice:

```prisma
// Add to schema.prisma → User model
dashboardVersion  String  @default("classic")  // "classic" | "new"
```

Run `npx prisma migrate dev --name add-dashboard-version` after adding this field.

### -1.2 API Endpoint — `src/app/api/settings/dashboard-version/route.ts`

```ts
// GET — returns current preference
// PUT — body: { version: "classic" | "new" } — updates and returns updated version
// Reads/writes the User.dashboardVersion field
// Returns: { version: "classic" | "new" }
```

This is a simple 2-method endpoint. Validate that the `version` value is either `"classic"` or `"new"`. Unauthenticated requests return 401.

### -1.3 Version Context — `src/lib/dashboard-version.tsx`

Create a React context + provider that makes the current version and toggle function available everywhere:

```tsx
"use client";
import { createContext, useContext, useState, useCallback, useTransition } from "react";

interface DashboardVersionContext {
  version: "classic" | "new";
  toggle: () => void;
  isToggling: boolean;  // true during the API call, used for loading state on the button
}

const Context = createContext<DashboardVersionContext>({
  version: "classic",
  toggle: () => {},
  isToggling: false,
});

export function DashboardVersionProvider({
  children,
  initialVersion,
}: {
  children: React.ReactNode;
  initialVersion: "classic" | "new";
}) {
  const [version, setVersion] = useState<"classic" | "new">(initialVersion);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(() => {
    const next = version === "classic" ? "new" : "classic";
    // Optimistic update — flip immediately for snappy feel
    setVersion(next);
    // Persist to server in background
    startTransition(() => {
      fetch("/api/settings/dashboard-version", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: next }),
      }).catch(() => {
        // Revert on failure
        setVersion(version);
      });
    });
  }, [version]);

  return (
    <Context.Provider value={{ version, toggle, isToggling: isPending }}>
      {children}
    </Context.Provider>
  );
}

export const useDashboardVersion = () => useContext(Context);
```

### -1.4 Provider Placement

In the root app layout (`src/app/layout.tsx` or the authenticated layout), wrap children with `DashboardVersionProvider`. Pass the user's saved preference as `initialVersion` (fetched server-side from the session/user query).

```tsx
// In the server component that wraps authenticated routes:
const user = await getCurrentUser(); // your existing auth helper
const initialVersion = user?.dashboardVersion ?? "classic";

return (
  <DashboardVersionProvider initialVersion={initialVersion}>
    {children}
  </DashboardVersionProvider>
);
```

### -1.5 Toggle Button Component — `src/components/DashboardVersionToggle.tsx`

A small, attention-grabbing but non-intrusive toggle button. Placed in the top bar / nav area.

**When on Classic view:**
```
┌──────────────────────────────────────────┐
│  ✨ Try the new dashboard  [Switch →]    │
└──────────────────────────────────────────┘
```
- Floating pill at the top of the dashboard content area (not in the nav — inside the page)
- Subtle gradient border animation (electric → violet → electric, looping slowly)
- Dismissable (X button) — but reappears next session
- "Switch →" button is the primary CTA

**When on New view:**
```
┌──────────────────────────────────────────────────┐
│  You're using the new dashboard  [Switch back]   │
└──────────────────────────────────────────────────┘
```
- Same position, but calmer styling (no gradient animation)
- "Switch back" is a ghost/text button — de-emphasized because we want them to stay
- After 5 visits on the new dashboard, this banner auto-hides (store visit count in localStorage). It remains accessible from Settings.

**Implementation:**
```tsx
"use client";
import { useDashboardVersion } from "@/lib/dashboard-version";

export function DashboardVersionToggle() {
  const { version, toggle, isToggling } = useDashboardVersion();

  if (version === "classic") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-electric/20 bg-gradient-to-r from-electric/5 via-white to-violet-50 dark:from-electric/10 dark:via-navy-900 dark:to-violet-950/20 p-3 px-4 flex items-center justify-between gap-4 animate-[gradient-shift_4s_ease-in-out_infinite]">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <p className="text-sm font-medium text-navy dark:text-white">
            A new dashboard experience is ready
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={isToggling}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric-600 transition-colors disabled:opacity-50"
        >
          {isToggling ? "Switching..." : "Try it out →"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-1 p-3 px-4 flex items-center justify-between gap-4">
      <p className="text-sm text-navy-500 dark:text-white/60">
        You&apos;re using the new dashboard
      </p>
      <button
        onClick={toggle}
        disabled={isToggling}
        className="shrink-0 text-xs text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/70 transition-colors disabled:opacity-50"
      >
        {isToggling ? "Switching..." : "Switch to classic"}
      </button>
    </div>
  );
}
```

### -1.6 Page-Level Version Routing

Each page that has a redesigned version uses the context to conditionally render. The pattern is:

```tsx
// Example: src/app/dashboard/page.tsx (server component)
import { getCurrentUser } from "@/lib/auth-helpers";
import DashboardClassic from "@/components/DashboardClient";         // existing
import DashboardNew from "@/components/v2/DashboardClient";          // new version
import DashboardVersionGate from "@/components/DashboardVersionGate";

export default async function DashboardPage() {
  // ... existing data fetching ...
  const user = await getCurrentUser();

  return (
    <DashboardVersionGate
      classicComponent={<DashboardClassic decks={decks} userName={user.name} plan={user.plan} ... />}
      newComponent={<DashboardNew decks={decks} userName={user.name} plan={user.plan} ... />}
    />
  );
}
```

**`DashboardVersionGate.tsx`** — a thin client component:
```tsx
"use client";
import { useDashboardVersion } from "@/lib/dashboard-version";

export default function DashboardVersionGate({
  classicComponent,
  newComponent,
}: {
  classicComponent: React.ReactNode;
  newComponent: React.ReactNode;
}) {
  const { version } = useDashboardVersion();
  return <>{version === "new" ? newComponent : classicComponent}</>;
}
```

### -1.7 File Structure Convention

All new components go in a `v2/` subdirectory, mirroring the existing structure:

```
src/components/
├── DashboardClient.tsx              ← existing (classic)
├── DashboardVersionGate.tsx         ← NEW (router)
├── DashboardVersionToggle.tsx       ← NEW (toggle button)
├── dashboard/
│   ├── DashboardOverview.tsx        ← existing (classic)
│   ├── DashboardDeckGrid.tsx        ← existing (classic)
│   └── ...
├── v2/
│   ├── DashboardClient.tsx          ← NEW (new dashboard)
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx    ← NEW
│   │   ├── DeckGrid.tsx            ← NEW
│   │   └── ...
│   ├── shell/
│   │   ├── Sidebar.tsx             ← NEW
│   │   ├── TopBar.tsx              ← NEW
│   │   └── CommandPalette.tsx      ← NEW
│   └── ui/
│       ├── Button.tsx              ← NEW
│       ├── Card.tsx                ← NEW
│       └── ...
└── AppNav.tsx                       ← existing (used by classic)
```

**Rules:**
- NEVER modify files in `src/components/dashboard/` or `src/components/DashboardClient.tsx` during the redesign
- NEVER delete the classic components until the new version is confirmed as the default (a future decision)
- The `v2/` directory is self-contained — it can import from `src/lib/` (shared utilities, API calls, types) but NOT from `src/components/` (classic UI components)
- New shared UI primitives (`v2/ui/`) can be used by both versions eventually, but classic is not required to adopt them

### -1.8 App Shell Coexistence

The new dashboard uses a sidebar layout (Phase 1 of the redesign). The classic uses the floating pill nav (`AppNav`). Handle this in the version gate:

- **Classic version**: Renders `AppNav` at the top (existing behavior). No sidebar.
- **New version**: Renders the new `AppShell` (sidebar + top bar). No `AppNav`.

The `DashboardVersionGate` handles this by wrapping the new component in the new shell:

```tsx
"use client";
import { useDashboardVersion } from "@/lib/dashboard-version";
import AppShellV2 from "@/components/v2/shell/AppShell";

export default function DashboardVersionGate({
  classicComponent,
  newComponent,
}: {
  classicComponent: React.ReactNode;
  newComponent: React.ReactNode;
}) {
  const { version } = useDashboardVersion();

  if (version === "new") {
    return (
      <AppShellV2>
        {newComponent}
      </AppShellV2>
    );
  }

  return <>{classicComponent}</>;
}
```

The classic component already includes `<AppNav />` inside itself, so it renders its own navigation.

### -1.9 Settings Page Integration

Add a "Dashboard Version" section to the Settings page (both classic and new versions):

```
Dashboard Experience
━━━━━━━━━━━━━━━━━━━
You're currently using the [Classic / New] dashboard.

  ○ Classic — The original PitchIQ layout
  ● New — Redesigned with sidebar navigation and enhanced visuals

  [Save Preference]
```

This ensures users can always find the toggle even if they dismiss the banner.

### -1.10 Admin Analytics (Optional)

Track which version users are on so you can measure adoption:

```ts
// In the PUT /api/settings/dashboard-version handler, log the switch:
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: "dashboard.version_switch",
    metadata: { from: currentVersion, to: newVersion },
  },
});
```

This lets you query: how many users switched to new? How many switched back? What's the retention rate on the new version?

### -1.11 Rollout Strategy

The version toggle enables a safe rollout:

1. **Phase A (Build)**: Build all new components in `v2/`. Classic remains the default. Toggle is available but not promoted.
2. **Phase B (Beta)**: Show the "Try the new dashboard" banner to all users. Default remains classic. Collect feedback and switch-back rates.
3. **Phase C (Default flip)**: Change the default to `"new"` for new signups. Existing users keep their saved preference. Show "Switch to classic" for users who haven't tried new yet.
4. **Phase D (Sunset)**: After 90%+ adoption on new, remove the classic components and the toggle system entirely. One final migration sets all users to `"new"`.

---

## PHASE 0 — DESIGN SYSTEM FOUNDATION

Before touching any page, establish the new design system. Everything else builds on this.

### 0.1 Install Dependencies

```bash
npm install framer-motion @radix-ui/react-tooltip @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-scroll-area @radix-ui/react-avatar @radix-ui/react-progress cmdk class-variance-authority clsx tailwind-merge
```

### 0.2 Utility Layer — `src/lib/cn.ts`

Create a `cn()` utility combining `clsx` + `tailwind-merge` for clean conditional class composition:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 0.3 Tailwind Config Overhaul — `tailwind.config.ts`

Keep the existing navy/electric/violet palette but add:

```
Extended:
- Spacing: Add fractional values (4.5, 13, 15, 18) for precise layout control
- Border radius: Add 'xl2' (14px), '2.5xl' (20px), '3xl' (24px) — rounder than current
- Transition timing: Add 'ease-spring' cubic-bezier(0.34, 1.56, 0.64, 1) for bouncy micro-interactions
- Box shadow: Replace flat shadows with layered compound shadows:
  - 'elevation-1': '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)'
  - 'elevation-2': '0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'
  - 'elevation-3': '0 4px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)'
  - 'glow-electric': '0 0 0 1px rgba(67,97,238,0.12), 0 4px 16px rgba(67,97,238,0.15)'
  - 'glow-violet': '0 0 0 1px rgba(139,92,246,0.12), 0 4px 16px rgba(139,92,246,0.15)'
  - 'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)'

- Backdrop blur: Add 'blur-2xl' (40px), 'blur-3xl' (64px) for deeper glass effects
- Add animation keyframes:
  - 'enter': translateY(4px) + opacity 0 → translateY(0) + opacity 1 (300ms ease-out)
  - 'exit': reverse of enter
  - 'slide-in-from-right': translateX(100%) → translateX(0)
  - 'slide-in-from-bottom': translateY(16px) + opacity 0 → origin
  - 'scale-in': scale(0.97) + opacity 0 → scale(1) + opacity 1
  - 'shimmer-sweep': background-position 200% → -200% (for skeleton loading)
  - 'progress-fill': scaleX(0) → scaleX(1)
  - 'number-tick': translateY(100%) → translateY(0) (for counting animations)
```

### 0.4 CSS Variables — `globals.css`

Add new semantic tokens to the existing CSS variable system:

```css
:root {
  /* Surface hierarchy (light) */
  --surface-0: #FFFFFF;           /* Base / page background */
  --surface-1: #F8F9FC;           /* Raised surface / cards */
  --surface-2: #F1F3F9;           /* Inset / wells */
  --surface-3: #E8ECF4;           /* Deeply nested */
  --surface-interactive: #FFFFFF;  /* Hover-ready surfaces */
  --surface-overlay: rgba(255,255,255,0.85); /* Glass panels */

  /* Borders */
  --border-default: rgba(26,26,46,0.08);
  --border-subtle: rgba(26,26,46,0.04);
  --border-emphasis: rgba(26,26,46,0.16);
  --border-interactive: rgba(67,97,238,0.3);

  /* Sidebar */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;

  /* Transition tokens */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-default: cubic-bezier(0.2, 0, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

.dark {
  --surface-0: #0C0C18;
  --surface-1: #12121F;
  --surface-2: #1A1A2E;
  --surface-3: #222236;
  --surface-interactive: #1A1A2E;
  --surface-overlay: rgba(12,12,24,0.85);

  --border-default: rgba(255,255,255,0.08);
  --border-subtle: rgba(255,255,255,0.04);
  --border-emphasis: rgba(255,255,255,0.16);
  --border-interactive: rgba(67,97,238,0.4);
}
```

### 0.5 Primitive UI Components — `src/components/ui/`

Build (or replace existing) a small set of composable primitives. Every internal page draws from these:

1. **`Button.tsx`** — Variants: `primary` (electric fill), `secondary` (navy outline), `ghost` (transparent), `danger` (red), `premium` (gradient electric→violet). Sizes: `sm`, `md`, `lg`, `icon`. All have Framer Motion `whileTap={{ scale: 0.97 }}` and `whileHover` with subtle lift. Include loading spinner state (replace label with animated dots). Keyboard-accessible with visible focus rings.

2. **`Card.tsx`** — A `surface-1` container with rounded-2xl, subtle border, and optional `interactive` prop that adds hover elevation + border-interactive transition. Variants: `default`, `glass` (frosted), `inset` (surface-2 background for nested cards).

3. **`Badge.tsx`** — Plan badges, status badges, score badges. Variants by color. Pill-shaped with dot indicator option.

4. **`Input.tsx`** / **`Textarea.tsx`** — Clean inputs with animated floating labels (label rises on focus/value). Border transitions from `border-default` to `border-interactive` on focus. Error state with shake animation.

5. **`Select.tsx`** — Radix-based with search/filter. Animated dropdown with `scale-in` entrance.

6. **`Tabs.tsx`** — Radix tabs with animated underline indicator that slides between tabs using `layoutId` (Framer Motion shared layout animation). This is critical — the sliding tab indicator is one of the highest-ROI "wow" micro-interactions.

7. **`Tooltip.tsx`** — Radix tooltip with `scale-in` + fade entrance, 200ms delay. Dark background, compact.

8. **`Avatar.tsx`** — Radix avatar with fallback initials. Subtle ring on hover. Group variant for stacked team avatars.

9. **`Progress.tsx`** — Animated fill bar with spring physics. Optional percentage label. Score-colored variant (green/amber/red).

10. **`Skeleton.tsx`** — Shimmer loading skeleton matching card shapes. NOT just gray rectangles — skeleton should approximate the real layout (title line, body lines, metric boxes).

11. **`EmptyState.tsx`** — Centered illustration + title + description + CTA. Animated entrance. Used everywhere there's no data yet. Each empty state should feel delightful, not dead.

12. **`CommandPalette.tsx`** — `cmdk`-based command palette (⌘K / Ctrl+K). This is the single highest-impact "wow" feature. Categories: Navigation (Go to Dashboard, Create Deck, Score Deck, Settings), Actions (New Deck, Find Investors, Start Practice), Recent (last 5 decks), Search (decks by title/company). Fuzzy match. Keyboard-navigable. Animated entrance with backdrop blur.

13. **`Toast.tsx`** — Bottom-right toast stack. Framer Motion `AnimatePresence` for enter/exit. Variants: success (green left border), error (red), info (electric), loading (with spinner). Auto-dismiss with progress bar.

14. **`Modal.tsx`** — Radix dialog with backdrop blur, `scale-in` content animation. Trap focus. Escape to close. Mobile: slide up from bottom as a sheet.

15. **`Kbd.tsx`** — Keyboard shortcut hint component. Renders like `⌘K` with subtle border. Used inside command palette and tooltips to teach shortcuts.

---

## PHASE 1 — APP SHELL & NAVIGATION

**The single biggest structural change.** Replace the floating pill navbar with a proper app shell: persistent sidebar + top bar.

### 1.1 Layout Architecture

Create `src/app/(app)/layout.tsx` — a route group wrapping all authenticated pages. This layout renders the app shell:

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (260px)  │  Content Area                     │
│                  │  ┌──────────────────────────────┐ │
│  Logo            │  │  Top Bar (context-aware)     │ │
│  ─────────────   │  ├──────────────────────────────┤ │
│  Navigation      │  │                              │ │
│  • Dashboard     │  │  Page Content                │ │
│  • My Decks      │  │                              │ │
│  • Create        │  │                              │ │
│  • Score         │  │                              │ │
│  • Ideas         │  │                              │ │
│  ─────────────   │  │                              │ │
│  Fundraise       │  │                              │ │
│  • Investors     │  │                              │ │
│  • CRM           │  │                              │ │
│  • Practice      │  │                              │ │
│  ─────────────   │  │                              │ │
│  Workspace       │  │                              │ │
│  • Team          │  │                              │ │
│  • Settings      │  │                              │ │
│  ─────────────   │  │                              │ │
│                  │  │                              │ │
│  [User Avatar]   │  │                              │ │
│  Plan Badge      │  └──────────────────────────────┘ │
│  Credits: 42     │                                   │
└──────────────────────────────────────────────────────┘
```

### 1.2 Sidebar Component — `src/components/shell/Sidebar.tsx`

**Behavior:**
- Default: expanded (260px) on desktop (≥1280px), collapsed (72px icons only) on medium screens (1024-1279px), hidden on mobile (<1024px)
- Toggle: User can collapse/expand on desktop. Collapses to icon-only with tooltips showing labels.
- Mobile: Slides in from left as an overlay with backdrop blur. Swipe-to-close gesture.
- State persisted to localStorage

**Design:**
- Background: `surface-1` with right border (`border-default`)
- Dark mode: `surface-1` (which maps to #12121F) — NOT fully black
- Navigation items: 44px height, rounded-xl, 12px horizontal padding
  - Default: transparent background, `text-navy-500` (light) / `text-white/60` (dark)
  - Hover: `surface-2` background, text darkens
  - Active: `electric/8` background tint, `text-electric`, left 2px accent bar (electric) — animated in with `layoutId` so the indicator slides between items
  - Icon: 20px Lucide icons, always visible
  - Label: 14px medium weight, hidden when collapsed
- Section dividers: Labeled separators ("Main", "Fundraise", "Workspace") in 11px uppercase tracking-widest, `text-navy-400`

**Navigation Structure:**
```
MAIN
├── Dashboard        (LayoutDashboard icon)
├── My Decks         (Layers icon)
├── Create Deck      (Plus icon) — highlighted with electric dot
├── Score Deck       (Target icon)
└── Ideas            (Lightbulb icon)

FUNDRAISE
├── Investor Match   (Search icon)      — Growth+ badge
├── Investor CRM     (Users icon)       — Growth+ badge
├── Practice         (Mic icon)         — Growth+ badge
└── A/B Tests        (Split icon)       — Growth+ badge

WORKSPACE
├── Team             (Building icon)
└── Settings         (Settings icon)
```

**Bottom section (pinned):**
- User avatar + name (truncated) + plan badge
- Click opens a popover: View Profile, Billing, API Keys, Custom Domain, Theme Toggle, Sign Out
- Credit balance pill: "42 credits" with sparkle icon, clickable → credits page
- When on starter plan: subtle "Upgrade" CTA with gradient border animation

### 1.3 Top Bar Component — `src/components/shell/TopBar.tsx`

A thin (56px) horizontal bar above the content area:

**Left side:**
- Breadcrumb trail: `Dashboard / My Decks / Acme Corp Pitch` — with clickable segments
- On mobile: hamburger menu button (opens sidebar overlay)

**Right side:**
- Command palette trigger: Search icon + "Search..." text + `⌘K` badge. Clicking opens CommandPalette.
- Notification bell (move from current AppNav)
- Quick-create button: "+" icon, opens dropdown with: New Deck, Score Deck, New Idea

**Design:**
- Background: transparent (content scrolls underneath)
- When scrolled: transition to `surface-overlay` with `backdrop-blur-xl` and bottom border `border-subtle`
- Sticky: `position: sticky; top: 0; z-index: 40`

### 1.4 Command Palette — `src/components/shell/CommandPalette.tsx`

Triggered by `⌘K` (Mac) / `Ctrl+K` (Windows) globally, or clicking the search bar in top bar.

**Behavior:**
- Opens centered modal with backdrop blur
- Input auto-focused with "Type a command or search..." placeholder
- Fuzzy search across: navigation pages, recent decks (by title/company), actions
- Arrow key navigation, Enter to select, Escape to close
- Recent searches section at top (persisted)

**Sections:**
```
NAVIGATION
  Dashboard                    ⌘D
  Create Deck                  ⌘N
  Score Deck                   ⌘U
  Settings                     ⌘,

ACTIONS
  Find Matching Investors      ⌘I
  Start Pitch Practice         ⌘P
  Export Current Deck           ⌘E

RECENT DECKS
  Acme Corp Series A Pitch     72 PIQ
  My SaaS Startup              85 PIQ
  ...
```

**Implementation:** Use the `cmdk` library. Register keyboard shortcut in the app shell layout via `useEffect`. Each item has an icon, label, optional right-side badge (keyboard shortcut or PIQ score), and an `onSelect` handler that calls `router.push()` or triggers an action.

---

## PHASE 2 — DASHBOARD REIMAGINATION

The current dashboard is a vertical stack of full-width sections. Replace with a **spatial, card-based layout** that feels like a command center.

### 2.1 Dashboard Layout

Replace the single-column `space-y-6` layout with a responsive grid:

```
Desktop (≥1280px):
┌──────────────────────────────────────────────────────┐
│ Welcome + Plan Badge + Quick Stats (3 metrics)       │
├─────────────────────┬────────────────────────────────┤
│                     │                                │
│  My Decks           │  Activity / Analytics          │
│  (scrollable grid)  │  (chart + feed)                │
│                     │                                │
├─────────────────────┴────────────────────────────────┤
│ Quick Actions Bar (horizontal)                        │
├──────────┬──────────┬──────────┬─────────────────────┤
│ Investor │ Fundraise│ Practice │ PAYG Status         │
│ Match    │ Tracker  │ Sessions │                     │
└──────────┴──────────┴──────────┴─────────────────────┘

Mobile: Everything stacks vertically, single column
```

### 2.2 Welcome Header Redesign

Current: "Hey {name}" text + plan badge.
New: A richer greeting that contextualizes the user's fundraising journey.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Good morning, David                                │
│  Your decks had 24 views this week — 3x last week  │ ← dynamic insight
│                                                     │
│  [PIQ 72 ▴] avg score   [156] total views   [5/10] decks used │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**The dynamic insight line** is key. It should show the most relevant piece of information:
- If views are up: "Your decks had X views this week — Yx last week"
- If a deck scored high: "Your latest deck scored 85 — top 10% on PitchIQ"
- If no decks: "Create your first pitch deck to get started"
- If no views: "Share your deck link to start getting views"
- If investor match available: "3 new investor matches since last week"

**Stat pills** use the new animated number component — when the dashboard loads, numbers count up from 0 to their value over 600ms with `ease-out-expo`. Each pill is a mini card with an icon, label, and value. Clickable — navigates to the relevant section.

### 2.3 Deck Grid Redesign

Current: Simple cards with title + score + views.
New: Rich deck cards that feel like living documents.

**Deck Card Design:**
```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │   Slide 1 Thumbnail            │  │  ← Actual rendered first slide
│  │   (16:9 aspect ratio)          │  │     as a miniature preview
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  Acme Corp Series A               │
│  SaaS · Seed · $500K                │  ← Industry + Stage + Target
│                                      │
│  ┌──────┐  ┌──────────────────┐    │
│  │ 72   │  │ ████████░░ 156 👁 │    │  ← PIQ score circle + views bar
│  │ PIQ  │  │                  │    │
│  └──────┘  └──────────────────┘    │
│                                      │
│  Updated 2h ago                      │
│                                      │
│  [Edit] [Share] [•••]               │  ← Action row, visible on hover
└──────────────────────────────────────┘
```

**Interactions:**
- Hover: Card lifts (translateY -2px), shadow deepens, action row fades in
- Click anywhere on card: Opens deck viewer
- Edit button: Opens editor
- Share button: Copies share link with toast confirmation
- ••• menu: Duplicate, Create Variant, Export, Delete
- The PIQ score circle uses the existing score-color system and has a subtle pulse animation if score is above 80

**Grid:** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` with `gap-5`. Sort dropdown: Recent, Highest Score, Most Views. Filter by: industry, stage.

**Empty State (no decks):**
A centered card with:
- Animated illustration (a simple SVG deck icon with a sparkle animation)
- "Create your first pitch deck"
- "PitchIQ's AI will analyze your company and build an investor-ready deck in minutes"
- Primary CTA: "Create Deck" button
- Secondary: "Or score an existing deck" link

### 2.4 Activity Panel

Right side of the deck grid. Two tabs with the sliding indicator animation:

**Tab 1: Analytics**
- Line chart (Recharts) showing daily views over the last 30 days
- Hover shows tooltip with exact date + count
- Below chart: "Top performing deck" card with deck name + views + PIQ score

**Tab 2: Activity Feed**
- Vertical timeline with small icons per event type:
  - Eye icon (navy-400) — "Someone viewed Acme Corp Pitch" + time
  - Plus icon (electric) — "You created a new deck" + time
  - Target icon (violet) — "You scored a deck: 72 PIQ" + time
  - Users icon (emerald) — "New investor match: Sequoia Capital" + time
- Each item: icon + text + relative timestamp ("2h ago")
- Max 10 items, "View all" link

### 2.5 Quick Actions Bar

A horizontal row of action cards. Each card is compact (not a full CTA banner):

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ✨ Create    │ │ 🎯 Score     │ │ 🔍 Find      │ │ 💡 Ideas     │
│    Deck      │ │    Deck      │ │    Investors  │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

Each card: `surface-1` background, icon + label. Hover: background transitions to `electric/5` with `glow-electric` shadow. Click navigates. Plan-gated items show a lock icon and "Growth+" badge instead of the regular icon.

### 2.6 Feature Widgets (Lower Dashboard)

The current dashboard vertically stacks ALL features (Investor Match, CRM, Fundraise Tracker, Practice, Batch Jobs, Custom Domain, API Keys). Most users don't need all of these visible at once.

**New approach:** Show only 3-4 feature widgets based on the user's plan and activity. Each is a compact card (not full-width sections):

- **Starter plan:** Show "Investor Match" (with upgrade CTA), "Practice" (with upgrade CTA), "Credits" (if has credits)
- **Pro plan:** Show "Investor Match" (upgrade CTA), "Practice" (upgrade CTA), "PAYG Status"
- **Growth plan:** Show "Investor Match" (with match count), "CRM Pipeline" (mini kanban), "Practice" (recent session), "Fundraise Tracker" (progress bar)
- **Enterprise:** Show all relevant widgets in a 2x2 grid

Each widget is a `Card` with:
- Header: icon + title + "View all →" link
- Body: Compact summary (1-3 data points)
- If plan-gated: frosted overlay with "Upgrade to Growth" button (the actual content is blurred behind the overlay so users can see what they're missing)

### 2.7 Upgrade Banner

Current: Full-width gradient banner on Starter plan.
New: A persistent but unobtrusive **sidebar bottom card** (inside the sidebar, above the user section):

```
┌──────────────────┐
│  ✨ Go Pro        │
│  Unlock coaching, │
│  exports & more   │
│  [See Plans]      │
└──────────────────┘
```

Subtle gradient border animation (the border color slowly shifts electric → violet → electric). NOT a banner that pushes content down. The sidebar placement means it's always visible but never blocks work.

---

## PHASE 3 — CREATE DECK PAGE

### 3.1 Wizard Redesign

Current: Multi-step form.
New: A **single-page progressive form** with sections that expand/collapse. No page navigation between steps — smooth scroll with a sticky progress indicator.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Create Your Pitch Deck                              │
│  ────────────────────────────────────                │
│                                                      │
│  ① Company ─── ② Details ─── ③ Story ─── ④ Design   │  ← Sticky progress bar
│  ●              ○              ○            ○         │    Filled dots for completed
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Company Basics                               │   │
│  │  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │ Company Name│  │ Industry ▼  │            │   │
│  │  └─────────────┘  └─────────────┘            │   │
│  │  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │ Stage ▼     │  │ Location ▼  │            │   │
│  │  └─────────────┘  └─────────────┘            │   │
│  │                              [Continue →]     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │  ← Collapsed, opens when
│  │  Details                                  ▾   │   │    Company is filled
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Your Story                               ▾   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Design Preferences                       ▾   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key UX improvements:**
- **Auto-fill magic**: After entering company name, show a "✨ Auto-fill with AI" button. Clicking it uses the existing `/api/ideas/autofill` endpoint to populate fields. Show a shimmer loading state on each field as it fills in (staggered, 100ms apart). This is the first "wow" moment — the user types their company name and watches the form fill itself.
- **Inline validation**: Fields validate as the user types (debounced 500ms). Green checkmark appears next to valid fields.
- **Smart defaults**: Pre-fill investor type based on stage (Seed → Angel, Series A → VC). Pre-fill funding target ranges based on stage.
- **Right-side live preview**: On desktop (≥1280px), show a mini deck preview on the right that updates in real-time as the user fills in fields. Even before generation — show a wireframe mockup with the company name, problem statement, etc. populating placeholder slides. This gives users immediate feedback that their input is going somewhere.

### 3.2 Template Browser

Move from a separate section to a **toggle at the top**: "Start from scratch" | "Start from template". Template browser shows a 3-column grid of template cards with:
- Mini slide thumbnail
- Template name ("SaaS Startup", "Biotech Series A", "Consumer App")
- Archetype badge ("Disruptor", "Data Story", etc.)
- Click: auto-fills form fields from template

### 3.3 Generation Experience

Current: `GenerationProgress` component.
New: A **full-page generation experience** that makes the wait feel valuable:

When user clicks "Generate Deck", the page transitions (Framer Motion `AnimatePresence`) to a centered generation view:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              Building Your Pitch Deck                │
│                                                      │
│   ✓ Analyzed company DNA                    3s       │
│   ✓ Designed narrative arc                  5s       │
│   ✓ Generated visual system                2s       │
│   ● Creating slides...                     ███░░    │
│   ○ Coherence review                                │
│   ○ Image enrichment                                │
│                                                      │
│   ┌────────────────────────────────────────┐        │
│   │  💡 Did you know?                      │        │
│   │  VCs spend an average of 3 minutes     │        │
│   │  per deck. PitchIQ optimizes your      │        │
│   │  first 3 slides for maximum impact.    │        │
│   └────────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Each phase gets a checkmark with completion time when done
- Active phase has a pulsing dot + progress bar
- Rotating "Did you know?" tips cycle every 8 seconds (fundraising tips, PitchIQ features)
- On completion: 1-second pause, then smooth transition to the deck viewer/editor with a confetti-like particle burst (subtle — 20 small electric-colored dots that fade out)

---

## PHASE 4 — SCORE PAGE

### 4.1 Upload Experience

Current: Drag-and-drop zone.
New: Keep the drop zone but make it more inviting:

- Large dashed border container (rounded-2xl)
- Animated upload icon (gentle float animation)
- "Drop your deck here or click to browse"
- File type pills below: "PDF" "PPTX" — showing supported formats
- On drag over: border becomes solid electric, background pulses `electric/5`
- On drop: file name appears with size, upload progress bar with percentage
- Recent scores section below: last 3 scored decks with scores, clickable to re-view

### 4.2 Score Results Redesign

Current: Radar chart + dimension list.
New: A **score dashboard** that feels like receiving a professional evaluation:

```
┌──────────────────────────────────────────────────────┐
│  PIQ Score Results                                   │
│                                                      │
│  ┌────────────────────────┐  ┌─────────────────────┐│
│  │                        │  │ Overall Score        ││
│  │    Radar Chart         │  │                      ││
│  │    (animated draw-in)  │  │    72                ││
│  │                        │  │    ████████░░        ││
│  │                        │  │    "Strong deck"     ││
│  └────────────────────────┘  │                      ││
│                               │ Grade: B+           ││
│                               └─────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Dimension Breakdown                              ││
│  │                                                  ││
│  │ Narrative    ████████████████░░░░  82  A-       ││
│  │ Market       ██████████████░░░░░░  71  B        ││
│  │ Different.   ████████████░░░░░░░░  64  C+       ││ ← Lowest dims highlighted
│  │ Financials   █████████████████░░░  88  A        ││    with amber background
│  │ Team         ████████████████░░░░  79  B+       ││
│  │ The Ask      ██████████████░░░░░░  72  B        ││
│  │ Design       █████████░░░░░░░░░░░  52  C        ││ ← Flagged as focus area
│  │ Credibility  ███████████████░░░░░  75  B        ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ AI Recommendations                               ││
│  │                                                  ││
│  │ 🎯 Focus Area: Design (52/100)                  ││
│  │ Your slide layouts lack visual hierarchy...      ││
│  │                                                  ││
│  │ 💡 Quick Win: Differentiation (64/100)          ││
│  │ Add a competitive comparison slide...           ││
│  │                                                  ││
│  │ [Improve This Deck →]  [Create New From Score]  ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Animations:**
- Overall score: Number counts up from 0 to final value (800ms, ease-out-expo)
- Progress bars: Fill from left to their value (staggered, 100ms delay per bar, 600ms each)
- Radar chart: Lines draw in from center outward (800ms)
- Recommendations: Fade in after scores finish animating (400ms delay)
- Grade letter: Scale-in with spring animation

**CTA:** "Improve This Deck" button links to smart refinement. "Create New From Score" auto-populates the create form with extracted content.

---

## PHASE 5 — EDITOR

The editor is the most complex page. Focus on polish rather than restructure.

### 5.1 Editor Shell Improvements

- **Sidebar (left):** Keep existing structure but apply new design system. Slide thumbnails should be actual mini-renders (not just text). Active slide: `glow-electric` shadow + electric left border.
- **Toolbar (top):** Reduce visual noise. Group actions: [Save status auto-save indicator] | [Undo/Redo] | [Theme dropdown] | [AI panels toggle group] | [Export button]. Save indicator: green dot + "Saved" text that fades in/out. Changes detected: amber dot + "Saving..." with spinner.
- **Properties panel (right):** Collapsible. Sections with disclosure triangles. Apply new Input/Select primitives.
- **Canvas:** Add subtle grid dots background (toggleable). Improve block selection: electric dashed border + corner resize handles.

### 5.2 AI Panel Redesign

The AI panels (Coach, Investor Lens, Simulator) slide in from the right. Apply new design:

- Panel container: 380px wide, `surface-1` background, slide-in-from-right animation (300ms)
- Panel header: Title + close button + "powered by AI" badge
- Content: Keep existing functionality but apply new Card/Badge/Progress primitives
- Coach feedback: Score badge (colored), dimension bars, text feedback in cards
- Loading state: Skeleton shimmer matching the expected content layout

### 5.3 Block Interaction Polish

- On hover over a block: Show subtle toolbar above the block (move, duplicate, delete, AI rewrite)
- On select: Electric border, resize handles appear with spring animation
- Drag: Ghost preview at 60% opacity, drop zones highlight
- New block: "+" button between blocks, opens a categorized block picker overlay

---

## PHASE 6 — SETTINGS, BILLING & CREDITS

### 6.1 Settings Page

Replace with a tabbed layout using the new Tabs component:

**Tabs:** Profile | Branding | Notifications | API Keys | Custom Domain

Each tab is a clean form section using new Input/Select primitives. Save button at bottom of each section (not a global save).

### 6.2 Billing Page

**Current plan card:**
```
┌──────────────────────────────────────────────────────┐
│  Current Plan: Growth                                │
│  $79/month · Renews April 15                         │
│                                                      │
│  ██████████████████░░░░░░  8 of 25 decks used       │
│                                                      │
│  [Manage Subscription]  [View Invoices]              │
└──────────────────────────────────────────────────────┘
```

Below: Plan comparison cards (horizontal scroll on mobile) with the current plan highlighted. Each card uses the plan's color accent.

### 6.3 Credits Page

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Credit Balance│  │  Lifetime      │  │  Active Pass   │
│                │  │                │  │                │
│     42         │  │    120         │  │  Growth        │
│   credits      │  │  credits used  │  │  Expires 4d    │
└────────────────┘  └────────────────┘  └────────────────┘

Transaction History (table with new design)
┌────────┬──────────┬──────────┬──────────┬──────────┐
│ Type   │ Action   │ Amount   │ Balance  │ Date     │
├────────┼──────────┼──────────┼──────────┼──────────┤
│ 🟢 +25 │ Purchase │ $12.00   │ 42       │ 2h ago   │
│ 🔴 -5  │ Deck Gen │          │ 17       │ 1d ago   │
│ 🟢 +50 │ Purchase │ $20.00   │ 22       │ 3d ago   │
└────────┴──────────┴──────────┴──────────┴──────────┘
```

Buy more section: Credit pack cards + Period pass cards side by side.

---

## PHASE 7 — MICRO-INTERACTIONS & POLISH

This phase is about the details that make the interface feel alive.

### 7.1 Page Transitions

Wrap the content area in `AnimatePresence` with `mode="wait"`. On page navigation:
- Outgoing page: fade out + slight slide up (200ms)
- Incoming page: fade in + slight slide up from below (300ms)
- This should be subtle — not a full-page transition, just the content area within the app shell

### 7.2 Skeleton Loading States

Every page must have a skeleton state that matches its layout. When data is loading:
- Cards: Gray rectangles with shimmer animation matching card dimensions
- Text: Lines at 60-80% width with shimmer
- Charts: Rectangular placeholder with shimmer
- The skeleton should feel intentional and fast — max 200ms before showing, and the real content fades in on top

### 7.3 Number Animations

Any numeric value that changes (PIQ scores, view counts, credit balances) should animate:
- Use a `AnimatedNumber` component that counts from old → new value
- Duration: 600ms for large numbers, 400ms for small
- Easing: `ease-out-expo` (fast start, slow end)

### 7.4 Toast Notifications

Replace any `alert()` calls or inline success messages with the Toast system:
- "Deck created successfully" — success variant
- "Link copied to clipboard" — info variant
- "Failed to save" — error variant with retry action
- Stack from bottom-right, max 3 visible, auto-dismiss after 5s

### 7.5 Hover Micro-interactions

- Buttons: `whileTap={{ scale: 0.97 }}` + `whileHover={{ y: -1 }}` via Framer Motion
- Cards: elevation transition on hover (elevation-1 → elevation-2)
- Links: color transition 150ms
- Icons in sidebar: subtle scale(1.05) on hover
- Plan-gated features: hover shows tooltip with "Upgrade to Growth to unlock"

### 7.6 Focus Management

- Tab navigation: visible focus rings on all interactive elements (2px electric outline, 2px offset)
- After actions (save, delete, create): focus moves to a logical next element
- Modals: trap focus, return focus on close
- Skip link: "Skip to main content" on Tab key press

### 7.7 Responsive Breakpoints

Ensure all redesigned pages work at:
- Mobile: 375px (iPhone SE)
- Mobile large: 428px (iPhone Pro Max)
- Tablet: 768px (iPad)
- Desktop: 1280px
- Wide: 1536px+

Mobile-specific behaviors:
- Sidebar: hidden, accessible via hamburger
- Top bar: simplified (just hamburger + notifications)
- Command palette: full-screen on mobile
- Cards: stack single-column
- Tables: horizontal scroll or switch to card layout
- Modals: slide up from bottom as sheets

---

## PHASE 8 — DARK MODE REFINEMENT

The current dark mode works but needs refinement to match the new design system.

### 8.1 Surface Colors

Use the surface hierarchy defined in Phase 0 (`surface-0` through `surface-3`). Dark mode should NOT be "white → black" — it should be navy-tinted:
- `surface-0`: #0C0C18 (deepest background)
- `surface-1`: #12121F (cards, sidebar)
- `surface-2`: #1A1A2E (inset surfaces, input backgrounds)
- `surface-3`: #222236 (deeply nested)

### 8.2 Border Opacity

Dark mode borders: `rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.16)` on emphasis. Never pure white borders.

### 8.3 Glow Effects

In dark mode, the electric glow effects become more prominent:
- Active sidebar item: stronger `glow-electric` shadow
- Primary buttons: add subtle `0 0 24px rgba(67,97,238,0.2)` glow
- PIQ score badges: glow matching score color

### 8.4 Text Hierarchy

- Primary text: `#E8E8ED` (not pure white)
- Secondary text: `rgba(255,255,255,0.6)`
- Tertiary text: `rgba(255,255,255,0.4)`
- Never use pure `#FFFFFF` for body text in dark mode

---

## PHASE 9 — EMPTY STATES & ONBOARDING

### 9.1 First-Run Dashboard

When a new user signs in with zero decks:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Welcome to PitchIQ, David                          │
│                                                      │
│  Let's get your fundraising started.                 │
│  Pick how you'd like to begin:                       │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ 🚀           │  │ 📄           │  │ 💡          ││
│  │ Create a     │  │ Score an     │  │ Brainstorm  ││
│  │ Pitch Deck   │  │ Existing Deck│  │ Ideas       ││
│  │              │  │              │  │             ││
│  │ Build from   │  │ Upload your  │  │ Not sure    ││
│  │ scratch with │  │ deck and get │  │ yet? Let AI ││
│  │ AI guidance  │  │ a PIQ score  │  │ help you    ││
│  │              │  │              │  │ brainstorm  ││
│  │ [Start →]    │  │ [Upload →]   │  │ [Explore →] ││
│  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │  Complete your Startup Profile to unlock        ││
│  │  investor matching                    [Set Up →] ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

Each onboarding card has a hover effect and a clear CTA. The startup profile banner is a persistent nudge until completed.

### 9.2 Empty States for Every Section

Create unique empty states for:
- **My Decks**: Illustration + "Create your first deck"
- **Investor CRM**: "Add your first investor contact"
- **Practice Sessions**: "Pick a deck to practice with"
- **Activity Feed**: "Activity will appear here as you create and share decks"
- **Analytics**: "Share your deck to start seeing analytics"

Each empty state has: icon/illustration, title, 1-sentence description, primary CTA button.

---

## PHASE 10 — VERIFICATION & QA

### 10.1 Visual Regression Checks

For each redesigned page:
- Screenshot at 375px, 768px, 1280px, 1536px widths
- Screenshot in light mode and dark mode
- Verify no overlapping elements, truncated text, or broken layouts
- Verify all interactive elements have hover states
- Verify all focus rings are visible

### 10.2 Performance Checks

- No layout shift (CLS) on page load — skeletons must match final dimensions
- First Contentful Paint < 1.5s for dashboard
- Total JS bundle for app shell < 100KB gzipped
- Framer Motion: lazy-load `motion` components to avoid adding to initial bundle

### 10.3 Accessibility Audit

- Tab through every page — verify logical focus order
- Screen reader test: all images have alt text, all icons have aria-labels, all sections have headings
- Color contrast: all text meets WCAG AA (4.5:1 ratio)
- Reduced motion: `prefers-reduced-motion` disables all animations, falls back to instant state changes

### 10.4 Feature Parity

Verify that EVERY feature from the current dashboard is accessible in the new design:
- [ ] Deck CRUD (create, view, edit, delete)
- [ ] PIQ scoring and results
- [ ] Plan upgrade flow
- [ ] Credit purchase and status
- [ ] Period pass purchase and status
- [ ] Investor matching
- [ ] Investor CRM
- [ ] Fundraise tracker
- [ ] Pitch practice
- [ ] A/B testing
- [ ] Batch scoring
- [ ] Custom domains
- [ ] API keys
- [ ] Workspace management
- [ ] Settings (profile, branding)
- [ ] Billing management
- [ ] Notifications
- [ ] Theme toggle (light/dark)
- [ ] Export (PDF, PPTX, Social)
- [ ] Smart refinement
- [ ] Idea generator
- [ ] GitHub repo import

---

## IMPLEMENTATION ORDER

Execute in this order to maintain a working application at each step. The classic dashboard is NEVER broken — users can always switch back.

1. **Phase -1** — Version toggle system (schema, context, gate, toggle button, `v2/` directory)
2. **Phase 0** — Design system foundation in `v2/ui/` (no impact on classic)
3. **Phase 1** — App shell + sidebar + command palette in `v2/shell/` (only renders when version = "new")
4. **Phase 2** — Dashboard in `v2/DashboardClient.tsx` + `v2/dashboard/` (gated behind version toggle)
5. **Phase 7** — Micro-interactions + toast + skeletons (in `v2/` only)
6. **Phase 3** — Create page (v2 version)
7. **Phase 4** — Score page (v2 version)
8. **Phase 5** — Editor polish (v2 version)
9. **Phase 6** — Settings, billing, credits (v2 versions)
10. **Phase 8** — Dark mode refinement (v2 pass)
11. **Phase 9** — Empty states + onboarding (v2)
12. **Phase 10** — Verification + adoption tracking

Each phase should be a separate branch + PR. The classic version is untouched throughout. Once adoption metrics confirm the new version is preferred (Phase D of rollout), classic components can be removed in a cleanup PR.

---

## FILES TO CREATE OR MODIFY

### Phase -1 — Version Toggle (NEW files)
```
prisma/migrations/XXXX_add_dashboard_version/    — auto-generated by Prisma
src/lib/dashboard-version.tsx                     — context + provider + hook
src/components/DashboardVersionGate.tsx           — conditional renderer
src/components/DashboardVersionToggle.tsx         — toggle banner component
src/app/api/settings/dashboard-version/route.ts   — GET/PUT preference endpoint
```

### Phase -1 — Version Toggle (MODIFY — minimal, safe changes)
```
prisma/schema.prisma                              — add dashboardVersion field to User
src/app/layout.tsx (or authenticated layout)      — wrap with DashboardVersionProvider
src/app/dashboard/page.tsx                        — add DashboardVersionGate wrapper
src/app/settings/page.tsx                         — add version preference UI section
```

### Phase 0–9 — All New Design (NEW files in v2/ — zero impact on classic)
```
src/components/v2/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Tabs.tsx
│   ├── Tooltip.tsx
│   ├── Avatar.tsx
│   ├── Progress.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── Toast.tsx
│   ├── Modal.tsx
│   └── Kbd.tsx
├── shell/
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── CommandPalette.tsx
│   └── MobileMenu.tsx
├── shared/
│   ├── AnimatedNumber.tsx
│   └── PageTransition.tsx
├── DashboardClient.tsx
├── dashboard/
│   ├── DashboardOverview.tsx
│   ├── DeckGrid.tsx
│   ├── DeckCard.tsx
│   ├── QuickActions.tsx
│   ├── ActivityPanel.tsx
│   ├── FeatureWidgets.tsx
│   ├── InvestorMatch.tsx
│   ├── InvestorCRM.tsx
│   ├── FundraiseTracker.tsx
│   ├── PitchPractice.tsx
│   ├── PaygStatus.tsx
│   └── WelcomeHeader.tsx
├── CreateDeckClient.tsx
├── ScorePageClient.tsx
├── SettingsClient.tsx
├── BillingClient.tsx
├── CreditsClient.tsx
└── editor/
    ├── EditorShell.tsx
    ├── EditorToolbar.tsx
    └── EditorSidebar.tsx
```

### Shared files to MODIFY (additive only — extends existing, doesn't change classic)
```
tailwind.config.ts    — add new tokens (shadows, animations, spacing) — additive only
src/app/globals.css   — add CSS variables for surface/border tokens — additive only
src/lib/cn.ts         — new utility file (no conflict)
```

### Files NEVER modified during redesign (classic preserved)
```
src/components/DashboardClient.tsx         — untouched
src/components/dashboard/*                 — untouched
src/components/AppNav.tsx                  — untouched (still used by classic + landing)
src/components/ScorePageClient.tsx         — untouched
src/components/DeckForm.tsx                — untouched
src/components/editor/*                    — untouched
src/components/SettingsClient.tsx          — untouched
src/components/BillingClient.tsx           — untouched
```

### Future cleanup (only after Phase D — sunset of classic)
```
DELETE src/components/DashboardClient.tsx
DELETE src/components/dashboard/
DELETE src/components/DashboardVersionGate.tsx
DELETE src/components/DashboardVersionToggle.tsx
DELETE src/lib/dashboard-version.tsx
MOVE   src/components/v2/* → src/components/   (flatten)
REMOVE User.dashboardVersion field
```

---

*This prompt is designed for Claude Code. Feed it phase by phase, not all at once. Start with Phase -1 (version toggle) — it's small and self-contained. Then do Phase 0 + Phase 1 together, then proceed sequentially. Each phase should take 1-3 sessions depending on complexity. The classic dashboard remains fully functional and untouched throughout the entire process.*

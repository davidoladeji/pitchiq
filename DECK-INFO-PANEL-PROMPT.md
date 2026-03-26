# Claude Code Prompt: Deck Info Panel — Show Form Inputs

> Paste this into Claude Code in **Act mode**. Do not ask questions — implement everything described below.

---

## Context

You are working on PitchIQ (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL app. When users create a pitch deck, they fill out a multi-step form (`DeckForm.tsx`) with: company name, industry, stage, funding target, investor type, problem, solution, key metrics, and team info. These fields are stored on the `Deck` model in the database.

**The problem**: After the deck is generated, users can NEVER see these original form answers again. The deck viewer (`DeckViewerClient.tsx`) only shows slides. The editor (`EditorShell.tsx`) only shows slide editing. The dashboard grid (`DashboardDeckGrid.tsx`) only shows title and score. The original inputs that shaped the entire deck are invisible.

**The fix**: Add a "Deck Info" panel that shows the original form inputs, allows editing them, and lets users regenerate the deck with updated inputs.

---

## What to Build

### 1. Deck Info Panel Component

Create `src/components/DeckInfoPanel.tsx` — a slide-over panel (right side) or collapsible section that shows all form inputs for a deck.

**Display fields (organized in sections):**

**Company**
- Company Name
- Industry
- Stage (with badge styling: pre-seed, seed, series-a, etc.)
- Founded Year (if available)

**The Pitch**
- Problem (multi-line text)
- Solution (multi-line text)

**Traction**
- Key Metrics (multi-line text)
- Team Info (multi-line text)

**Fundraising**
- Funding Target
- Investor Type (with icon: vc/angel/accelerator)
- Deal Structure (if available)

**Generation Settings** (if `generationMeta` exists on the deck)
- Narrative Archetype (e.g., "Traction Machine")
- Visual Personality (e.g., "Corporate Premium")
- Slide Count
- Generation date

**Design**
- Theme
- Brand Color (if set)
- Brand Font (if set)

Each field should be:
- Displayed as label + value
- Editable inline (click to edit, blur to save)
- Auto-save on change via `PATCH /api/decks/[shareId]`
- Empty fields show "Not provided" in muted text

**Styling**: Use the existing dark theme, Tailwind, Lucide icons. The panel should feel like a settings/info sidebar — compact, scannable, not a form.

### 2. Integration Points

**A. Deck Viewer Page** (`DeckViewerClient.tsx`)
- Add an "Info" button (Lucide `Info` or `FileText` icon) in the top bar next to existing buttons
- Clicking it opens the DeckInfoPanel as a slide-over from the right
- Panel overlays the slide view (doesn't push content)

**B. Editor Page** (`EditorShell.tsx` / `EditorToolbar.tsx`)
- Add a "Deck Info" tab or button in the editor sidebar or toolbar
- When clicked, shows the DeckInfoPanel in the sidebar area
- This lets users reference their original problem/solution while editing slides

**C. Dashboard Deck Grid** (`DashboardDeckGrid.tsx`)
- Add a small info icon or "..." menu on each deck card
- Clicking shows a quick-view popover with: industry, stage, funding target, investor type
- Full panel opens on "View Details" click

### 3. API Updates

**Update `GET /api/decks/[shareId]`** to include all form input fields in the response (some may already be included — verify and add any missing ones):
- `companyName`, `industry`, `stage`, `fundingTarget`, `investorType`
- `problem`, `solution`, `keyMetrics`, `teamInfo`
- `source` (generated/uploaded/refined)
- `generationMeta` (if exists)
- `businessModel`, `revenueModel`, `customerType` (if these fields exist on the model)

**Update `PATCH /api/decks/[shareId]`** (or create if it doesn't exist) to allow updating these fields:
- Accept partial updates for any form input field
- Validate field lengths (same validation as DeckForm)
- Return the updated deck

### 4. Regenerate from Updated Inputs

Add a "Regenerate Deck" button at the bottom of the DeckInfoPanel:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Changed your inputs?

Regenerate your deck with updated
company info, problem, or solution.

[🔄 Regenerate Deck]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

When clicked:
1. Show a confirmation: "This will create a new version of your deck using your updated inputs. Your current deck will be preserved."
2. POST to `/api/decks` with the updated fields from the current deck (essentially re-running generation with edited inputs)
3. The new deck gets linked to the original (use `refinedFromId` if that field exists, or just redirect to the new deck)
4. Redirect to the new deck's editor

### 5. Creation Form Pre-fill from Existing Deck

There's already a `/api/decks/[shareId]/extracted-content` endpoint. Make sure the "Duplicate" or "Create Similar" action on deck cards uses this to pre-fill the creation form. Add a "Duplicate & Edit" button to the DeckInfoPanel that navigates to `/create?from={shareId}`.

---

## Implementation Notes

- **Do NOT ask questions** — implement directly
- **Run `npm run build`** to verify no TypeScript errors
- **Use existing UI patterns**: Tailwind, Lucide icons, dark theme, existing panel/slide-over patterns from the codebase
- **The panel must be responsive** — on mobile, it should be a full-screen overlay; on desktop, a right-side slide-over
- **Auto-save should be debounced** (500ms) to avoid excessive API calls while typing
- **Empty/null fields** should show "Not provided" placeholder, not be hidden — showing what's missing encourages users to add more info (which improves deck quality)

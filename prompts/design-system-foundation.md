# Implement the design system foundation

## Goal
Wire Shepherd's design system (`design/DESIGN-SYSTEM.md`, extracted from `design/style-guide.jpg`) into the actual Next.js app: design tokens, fonts, and the base reusable UI primitives every future feature screen (attendance, membership, schedule, CMS review, etc.) will be built on top of. This is foundation work only — no feature pages, no auth, no data models.

## Skills / docs read
- `design/DESIGN-SYSTEM.md` (source of truth for tokens/components)
- `design/style-guide.jpg` and `design/style-guide.html` (visual reference; the HTML references a `design-system.css` that doesn't exist in the repo — it's mockup-tool output, not usable directly)
- `AGENTS.md` §3 (UI work), §6 (tech stack), §14 (checks)

## Code inspected
- Fresh `create-next-app` scaffold: App Router, TypeScript, Tailwind **v4** (`@import "tailwindcss"` + `@theme inline` CSS-first config in `app/globals.css` — there is no `tailwind.config.js`). `DESIGN-SYSTEM.md` §18 gives tokens as a `tailwind.config.js` excerpt, but that's the wrong config shape for this project — I'll translate the same tokens into Tailwind v4's `@theme` CSS syntax instead.
- `app/layout.tsx` currently loads Geist/Geist Mono via `next/font/google` — needs to become Inter (UI) + Newsreader (display), per DESIGN-SYSTEM.md §3.1.
- `app/page.tsx` is the unmodified Next.js starter page (Next logo, "Get started by editing..." card). Not part of the design system; will be swapped for a minimal placeholder so root `/` doesn't render Next's default template against the new tokens. The real public homepage is separate, later-scoped work (AGENTS.md §1 item 1).
- No `components/` directory exists yet. No icon library installed.

## Key finding
Tailwind's **default spacing scale already matches** DESIGN-SYSTEM.md §4 exactly (`space-1`=4px … `space-16`=64px map 1:1 to Tailwind's `1`..`16` spacing steps). No custom spacing tokens needed — components just use standard Tailwind spacing utilities (`p-5`, `gap-4`, etc.).

## Decisions / assumptions
1. **Tailwind v4 `@theme` in `globals.css`**, not a JS config — matches how this project is actually set up.
2. **Fonts**: Inter (sans, weights 400/500/600/700/800) + Newsreader (serif, weight 500) via `next/font/google`, replacing Geist. Exposed as `--font-sans` / `--font-serif` theme vars.
3. **Icons**: `lucide-react` (new dependency) — outline style is the closest match to DESIGN-SYSTEM.md §7's spec (stroke icons, `currentColor`); stroke width overridden to `1.7` to match. DESIGN-SYSTEM.md itself names Lucide as the recommended library.
4. **Radius**: override Tailwind's default `--radius-sm/md/lg` to 9px/14px/20px (so `rounded-lg` becomes the system's signature card radius everywhere, matching §5's "if in doubt, use this one"). Pills use Tailwind's existing `rounded-full` rather than inventing a separate `pill` token — visually equivalent (999px vs 9999px).
5. **Shadows**: add `--shadow-card` / `--shadow-pop` as custom theme shadow tokens → `shadow-card` / `shadow-pop` utilities.
6. **No dark mode.** The current scaffold's `prefers-color-scheme: dark` block is removed — DESIGN-SYSTEM.md defines one light palette only; a proper church-site dark mode isn't spec'd and shouldn't be invented.
7. **Component location**: `components/ui/` at the project root (idiomatic for App Router, and keeps primitives out of `app/`).
8. **Verification page**: a real route, `app/design-system/page.tsx`, rendering every primitive live (mirrors `style-guide.jpg`'s sections) built from the actual components — not raw HTML like the mockup's `style-guide.html`. This gives something to visually check in a browser now, since no feature pages exist yet to host these components, and doubles as a living reference for later feature prompts.
9. **Table mobile pattern**: implemented with CSS only (Tailwind breakpoints + `data-label` attributes read via `content: attr(data-label)` in a small CSS rule), not JS — matches §12.2's stated approach and avoids a hydration-dependent layout switch.

## Components to build (`components/ui/`)
- `Button` — `variant`: primary / secondary / ghost; `size`: default / sm; `block` boolean. Pill radius, icon+label gap 8px.
- `Badge` (pill/status tag) — `status`: success / warning / danger / info / neutral.
- `Avatar` — 30px initials circle, tint background.
- `Card` + `CardHead` — surface, `shadow-card`, `rounded-lg`, 22px padding (16px mobile); head = title/subtitle left, action right.
- `KpiCard` — `variant`: dark / light; label + Newsreader value (tabular-nums) + trend footnote.
- `Field` (label + input/select/textarea wrapper) and `Input` — matches §11.
- `Table` — desktop real `<table>`, mobile stacked label/value rows via CSS, per §12.
- `Sidebar` — 236px/76px collapse states, active-item highlighting, icon+label nav items, footer-pinned Settings/Help. Client component (holds collapse state).
- `BottomNav` — mobile fixed bottom tab bar, 4–5 items.
- A small `icons.ts` mapping the icon set from DESIGN-SYSTEM.md §7 / the mockup (dashboard, attendance, headcount, members, zones, schedule, content, gatherings, settings, home, book, download, flag, mail, search, bell, check, plus) to `lucide-react` icons, pre-set to `strokeWidth={1.7}`.

## Files touched
- `app/globals.css` — full token rewrite (`@theme` block: colors, radius, shadows; drop Geist vars and dark-mode block)
- `app/layout.tsx` — swap Geist → Inter/Newsreader, update `<html>` font vars, update page metadata (title/description away from "Create Next App" defaults)
- `app/page.tsx` — replace starter content with a minimal placeholder (plain text + link to `/design-system`)
- `app/design-system/page.tsx` — new showcase route
- `components/ui/*.tsx` — new primitives listed above
- `components/ui/icons.ts` — new icon map
- `package.json` — add `lucide-react`

## Requirements
- Every token in DESIGN-SYSTEM.md §2 (color), §5 (radius), §6 (shadow) is available as a Tailwind utility or CSS var — no hardcoded hex values inside component files.
- Newsreader is used **only** where §3.1 allows it (h1/h2, KPI values, brand wordmark) — everything else stays Inter. Enforce this by only exposing the serif font on specific components (`KpiCard` value, heading components), not as a general utility developers might reach for by accident.
- Numeric values use `tabular-nums`.
- Buttons: pill radius always, exactly one primary usage demonstrated per region in the showcase page (not a hard runtime constraint — that's a per-screen authoring discipline noted for future prompts).
- Table mobile breakpoint switches to stacked rows with no visible grid, per §12.2.
- Sidebar supports both expanded and collapsed states and both are shown in the showcase page.
- Mobile-first: showcase page and every component checked at a ~390px viewport, not just desktop.

## Security / access-control considerations
None — this is presentational-only, no auth, no data fetching, no server code. Explicitly out of scope for this prompt: Clerk, Prisma, Sanity, any real feature route.

## Acceptance criteria
- `app/design-system/page.tsx` renders all sections (color, typography, spacing/radius, elevation, buttons, badges, KPI cards, forms, table incl. mobile behavior, icons, sidebar expanded+collapsed, bottom nav) and visually matches `design/style-guide.jpg`.
- No component hardcodes a color/radius/shadow value that has a token.
- `npm run lint` and `npx tsc --noEmit` pass.
- `npm run build` succeeds.

## Checks to run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev`, then manually verify in a browser

## Manual test steps
1. `npm run dev`, open `http://localhost:3000/` → placeholder loads, links to `/design-system`.
2. Open `/design-system` at a desktop width (~1280px) → compare against `design/style-guide.jpg` section by section (color swatches, type scale, spacing/radius, shadows, buttons, KPI cards, form fields, table, icon grid, sidebar).
3. Resize to a mobile width (~390px) → confirm: section padding shrinks, the table collapses to stacked label/value rows with no horizontal scroll/grid, sidebar area still readable (or swaps to the bottom-nav demo).
4. Toggle the sidebar's collapse button → confirm width animates between 236px and 76px and labels hide/show correctly.
5. Inspect a KPI value and a page heading → confirm Newsreader is applied; inspect body text/buttons/labels → confirm Inter, not Newsreader.

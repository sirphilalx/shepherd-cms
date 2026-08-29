# Implementation prompt — Sermons search & filters (name / author / date)

## Goal
Extend `/sermons` from the single "All series" control to a small, restrained filter toolbar:

- **Search by name** — a text box matching the sermon title (also speaker + series, so the box
  alone is useful), case-insensitive substring.
- **Filter by author** — a Speaker select.
- **Filter by date** — a Year select (distinct years from the sermon `date`, newest first).
- Keep the existing **Series** select.
- All four are URL-driven (`?q=`, `?series=`, `?speaker=`, `?year=`), server-filtered,
  shareable/bookmarkable, and combine with AND. A "Clear all" resets to `/sermons`.

No new page/route. Detail page untouched.

## Skills / docs read
- `design/DESIGN-SYSTEM.md` — §3 type scale, §5 radius (search bar + pills = `rounded-full`;
  inputs otherwise 10px), §7 icons (Lucide, stroke, ~14–16px), §11 forms (inputs
  `border-border-strong bg-surface`, real `<label>`/`aria-label`, no placeholder-as-label),
  §16 responsive ("mobile is a different layout, not a shrunk one"), §17 sentence-case copy,
  plain empty states.
- AGENTS.md §3 (mobile-first; when there's no design reference, keep it clean and restrained;
  reuse existing components/Tailwind patterns), §12 ("chronological, newest first, with
  filters for series/speaker once there's enough content to need them"), §14 (checks).

## Code / config inspected
- **`app/(site)/sermons/page.tsx`** — current: reads `series` from `searchParams`, derives
  `allSeries`, filters, renders `<SeriesFilter>` + the card grid. `export const dynamic =
  "force-dynamic"`. `PageProps<"/sermons">` gives `searchParams: Promise<…>`.
- **`components/site/SeriesFilter.tsx`** — `"use client"` native `<select>` styled as a pill
  (`appearance-none rounded-full border border-border-strong bg-surface py-[7px] pl-[14px]
  pr-9 text-[12.5px] font-semibold` + absolutely-positioned `ChevronDown`), `router.push`
  to `/sermons?series=…`. Only used by this page → will be folded into the new toolbar and
  deleted.
- **`components/ui/Field.tsx`** — `Input` recipe (`rounded-[10px] border border-border-strong
  bg-surface px-3 py-[10px] text-[13px] placeholder:text-ink-faint focus:ring-2
  focus:ring-primary/30`). Reused/adapted for the search box (as a pill).
- **`components/site/SermonCard.tsx`**, **`components/site/format.ts`**, **`Container`** — unchanged.
- **`sanity/lib/queries.ts` / `publicContent.ts`** — `getPublishedSermons()` already returns
  `title`, `speaker`, `series`, `date`, `slug` for every published sermon; enough to filter
  client-of-server-side. No new query. Body text is **not** fetched (see D5).
- **Icons available**: `Search`, `X`, `ChevronDown`, `Calendar`, `User` (checked in
  `lucide-react`).
- Seed data: 13 published sermons, speakers `Michael Alexander`, `David Coleman`,
  `James Whitfield`, `Robert Nguyen`; series `Back to the Bible`, `The New Testament Church`,
  `Gospel Meeting 2026`, or none; `date` values across Jun–Sep 2026 (one 2026-09-23).

## Key decisions

### D1 — One `SermonFilters` client component, four URL params, server does the filtering
New `components/site/SermonFilters.tsx` (`"use client"`) renders the search input + three
pill `<select>`s (Series / Speaker / Year) + a "Clear all" button. It only reads its current
values from props and **writes to the URL**; it never fetches. `app/(site)/sermons/page.tsx`
(server component) reads `q` / `series` / `speaker` / `year` from `searchParams`, builds the
option lists from the **full** published set, applies all active filters (AND), and renders
the toolbar + a result count + the grid. `SeriesFilter.tsx` is deleted (folded in).

### D2 — URL writes: `router.replace`, `scroll: false`
Text input is **debounced 300ms** then `router.replace(\`/sermons?…\`)`; selects and "Clear
all" call `router.replace` immediately. `replace` (not `push`) so rapid filtering doesn't
flood history — the page is a single back-step. Query string built with `URLSearchParams`
(only non-empty params included; empty → key omitted, so "Clear all" → bare `/sermons`).
Local input state is kept in sync with the `q` prop (so "Clear all" empties the box).

### D3 — Match semantics
- `q`: trimmed, lower-cased; matches if it is a substring of `title` **or** `speaker` **or**
  `series` (lower-cased). Empty → ignored.
- `series`, `speaker`: exact string equality. `year`: `new Date(date).getFullYear() ===
  Number(year)`.
- Combine with **AND**. Order stays `date desc` (already the query order).

### D4 — Option lists come from the full published list, sorted
`series` and `speaker` options: `[...new Set(...)]` filtered to truthy, `localeCompare` sorted.
`year` options: distinct `getFullYear()` values, **descending**. A select whose list would be
empty (e.g. no sermon has a series) is not rendered. Selecting the first option (`value=""` /
"All …") clears that param.

### D5 — Search covers metadata only, not the Portable Text body (for now)
The list query doesn't fetch `body`, and pulling every sermon's full body into the list page
just to substring-search it is wasteful. Title + speaker + series covers the "name / author"
ask. A follow-up could add server-side GROQ text search (`*[... && (title match $q || …)]`).
Flagged in the report.

### D6 — Toolbar layout (no design reference → restrained)
Under the existing header (`h1` + subtitle), a `mt-6` block:
- **Search input** — pill (`rounded-full border border-border-strong bg-surface`), `Search`
  icon left (`pl-9`), a clear `X` button on the right when non-empty, `type="search"`,
  `text-[13px]`, `aria-label="Search sermons"`. Full width on mobile; `sm:max-w-xs` on desktop.
- **Selects row** — `flex flex-wrap gap-2` of the three pills (reusing the exact
  `SeriesFilter` pill styling via a small internal `PillSelect`), each with an `aria-label`
  ("Filter by series/speaker/year"). Wraps under the search box on mobile; sits beside it on
  `sm:` (`sm:flex-row sm:items-center sm:justify-between` on the toolbar wrapper).
- **"Clear all"** — a ghost text `<button>` (`text-[12.5px] font-semibold text-ink-muted
  hover:text-ink`), shown only when any of the four params is active.
- **Result count** — `mt-4 text-[12.5px] text-ink-faint`: `"13 sermons"` when unfiltered,
  `"Showing 3 of 13"` when filtered.

### D7 — Empty state
When filters match nothing: `"No sermons match those filters."` + a "Clear all filters"
button (same handler as the toolbar's). Keeps the toolbar visible so the user can adjust.

## Files to touch
- **New** `components/site/SermonFilters.tsx` — `"use client"`. Props: `{ q, series, speaker,
  year }` current values + `{ allSeries, allSpeakers, allYears }` option lists. Internal
  `PillSelect` + debounced search input + Clear all. `useRouter` from `next/navigation`.
- **Delete** `components/site/SeriesFilter.tsx`.
- **Edit** `app/(site)/sermons/page.tsx` — read the 4 params (coerce to `string | null`);
  build option lists; `filterSermons()` (local pure helper); render `<SermonFilters>` +
  result count + grid + updated empty state. Keep `dynamic = "force-dynamic"` and the
  `metadata`.
- No schema, query, config, or dependency changes.

## Requirements
- Restrained, matches the design system: pill search bar + pill selects, tokens only, no new
  colors/radii/shadows, sentence-case copy, plain empty state.
- **Mobile-first:** at 360px the toolbar stacks (search full-width, selects wrap, clear + count
  below), no horizontal scroll; selects and input are ≥ 40px tall (thumb-friendly).
- Every control has a visible label or `aria-label`; the search `X` is a real `<button>` with
  `aria-label="Clear search"`.
- All filtering is **server-side** in the page component; `SermonFilters` imports nothing from
  `sanity/lib/*` and holds no sermon data beyond the option-string arrays.
- Deep links apply on first load: `/sermons?speaker=Michael%20Alexander&year=2026` returns
  exactly that subset server-rendered.
- `q` is never interpolated into GROQ (it's applied in JS to the already-fetched list).
- No `any`. Params validated (`year` must parse to a number that appears in `allYears`, else
  ignored; `series`/`speaker` must be in their option list, else ignored — so a junk param
  can't produce a confusing empty page).
- Order stays newest-first.

## Security / access-control considerations
- `/sermons` stays public and published-only — no new fetch path; `getPublishedSermons()`
  already hard-filters `status == "published"` under `perspective: "published"`.
- `SermonFilters` is a client component but receives only public option strings (series names,
  speaker names, years) — nothing sensitive, nothing non-published.
- User-supplied `q` / params are used only for in-memory string comparison and to build a
  same-origin URL via `URLSearchParams` — no `dangerouslySetInnerHTML`, no GROQ interpolation,
  no external requests.
- No Clerk / Postgres / admin / draft surface touched.

## Acceptance criteria
1. `/sermons` shows a search box + Series + Speaker + Year selects under the header; with no
   filters it lists all 13 sermons, newest first, and shows "13 sermons".
2. Typing "grace" filters to sermons whose title/speaker/series contains it (debounced ~300ms),
   the URL becomes `/sermons?q=grace`, and reloading that URL shows the same result.
3. Speaker = "Michael Alexander" → only his sermons; add Year = "2026" → AND-combined; each
   choice is reflected in the URL and applied on a fresh load.
4. "Clear all" appears once any filter is set and returns to `/sermons` (all 13, box empty,
   selects reset).
5. A filter combination with no matches shows "No sermons match those filters." + a working
   "Clear all filters" button; the toolbar stays visible.
6. Option lists always show every published series/speaker/year regardless of the active
   filter; a junk `?year=1999` / `?speaker=Nobody` is ignored (not an empty page).
7. Mobile (≤ 400px): toolbar stacks, no horizontal scroll. Desktop: search left, selects right.
8. `npx tsc --noEmit`, `npm run lint`, `npm run build` pass. No client component imports
   `sanity/lib/*`.

## Checks to run (report real output)
- `npx tsc --noEmit`; `npm run lint`; `npm run build`.
- `npm run dev`, logged out:
  - `curl -s 'localhost:3000/sermons?q=grace' | grep -c 'href="/sermons/'`
  - `curl -s 'localhost:3000/sermons?speaker=Michael%20Alexander' | grep -c 'href="/sermons/'`
  - `curl -s 'localhost:3000/sermons?speaker=Michael%20Alexander&year=2026' | grep -c 'href="/sermons/'`
  - `curl -s 'localhost:3000/sermons?year=1999' | grep -oE 'No sermons match|[0-9]+ sermons'`
  - `curl -s 'localhost:3000/sermons?series=Nobody' ` → still lists sermons (junk ignored)
- DevTools at 360 / 768 / 1280 on `/sermons` — no horizontal scrollbar; toolbar reflows.

## Manual test steps
1. `npm run dev`; open `http://localhost:3000/sermons` logged out.
2. Type "sing" in the box → list narrows to "Why We Sing Without Instruments" after ~300ms;
   URL shows `?q=sing`; hit reload → still filtered; click the `X` → back to 13.
3. Series = "Back to the Bible" → 5 results; add Speaker = "Michael Alexander" → fewer;
   add Year = "2026" → AND result; the count reads "Showing N of 13"; URL carries all three.
4. "Clear all" → `/sermons`, box empty, selects at "All …", 13 sermons.
5. Set Speaker = "Robert Nguyen" + Year = "2026" but also type "grace" → "No sermons match
   those filters." + "Clear all filters" works.
6. Load `/sermons?speaker=Michael%20Alexander&year=2026` directly → correct subset SSR'd
   (view source shows the filtered cards, not all 13).
7. Load `/sermons?year=1999` → all 13 shown (junk param ignored), count "13 sermons".
8. Narrow to 360px → search full-width, selects wrapped, no sideways scroll.
9. `npx tsc --noEmit && npm run lint && npm run build` — clean.

# Implementation prompt — Library page + homepage wiring + one‑click downloads

## Goal
Build the public **`/library`** page to the desktop mockup (`design/library-desktop.jpg`),
mobile‑first, reusing the sermon page's patterns exactly:

1. **`/library`** — published library files as a card grid, newest first, with the **same
   search + filter toolbar** as `/sermons` (URL‑driven search box + pill `<select>`s + "Clear
   all" + result count), adapted to library facets (ministry/category, file type).
2. Each card is a **one‑click download** — clicking the card (and its "Download" button)
   downloads that file with its original filename.
3. **Homepage "From the library"** section switches from hardcoded data to the **3 newest**
   library files from Sanity, and its cards download on click too.

No detail page (the mockup has none). No schema, GROQ, type, config, or dependency changes —
`PUBLISHED_LIBRARY_ITEMS_QUERY` / `getPublishedLibraryItems()` already return everything needed.

## Skills / docs read
- `design/DESIGN-SYSTEM.md` — §2 tokens, §3 type (Newsreader only for `h1`/card titles), §4
  spacing (4px base), §5 radius (`rounded-lg` cards, pill buttons/selects/search), §6 shadows
  (`shadow-card` / `shadow-pop`), §8 buttons (one primary per view, pills, icon‑first,
  secondary = bordered), §10 cards, §16 responsive ("mobile is a different layout, not a
  shrunk one"), §17 sentence‑case copy / plain empty states.
- `AGENTS.md` §3 (reproduce the reference exactly; reuse existing components/Tailwind
  patterns; mobile‑first), §7 (library items: title, description, category/ministry tag, one
  or more file assets; **default public**), §8 (`LibraryItem` = title, description, category,
  `files[]` file assets, workflow status), §12 ("library browsable by category/ministry, with
  a clear file type and size shown before download… downloads are direct links to the stored
  asset — no login wall unless asked"; degrade gracefully on empty fields), §13 ("File assets
  (PDF/PPT) need real file‑type and size handling"), §14 (checks).
- `prompts/sermons-pages.md` + `prompts/sermons-search-filter.md` — the established
  list‑page + URL‑driven filter‑toolbar pattern this page mirrors.

## Code / config inspected
- **`app/(site)/sermons/page.tsx`** — the template: `export const dynamic = "force-dynamic"`,
  `await searchParams`, build option lists from the full published set, validate params
  against those lists (junk param ignored), filter in JS (small N), render
  header (`h1` + subtitle) → `<SermonFilters>` → count line → card grid → empty state.
- **`components/site/SermonFilters.tsx`** — `"use client"`; debounced (300ms) search input
  writing `?q=`, pill `<select>`s writing their param, "Clear all", `router.replace(…, {scroll:
  false})`, `URLSearchParams` (empty key omitted). Contains a local `PillSelect` — **to be
  extracted** so `/library` can reuse it verbatim.
- **`components/site/SermonCard.tsx`** — card idiom: `group flex h-full flex-col
  overflow-hidden rounded-lg bg-surface shadow-card transition-shadow hover:shadow-pop`,
  `aspect-[16/9]` band, `bg-gradient-to-br from-tint to-tint-strong` placeholder, `p-5` body,
  `eyebrow` label, `font-serif` title, meta row.
- **`components/site/buttons.ts`** — `btnBase` / `btnPrimary` / `btnSecondary` / `pillLink` /
  `eyebrow` recipes. **`components/site/format.ts`** — `formatDate` only.
- **`components/site/Section.tsx`** — `<Container>` (`max-w-[1180px] px-5 md:px-8`),
  `<Section title subtitle action>`.
- **`components/site/SiteHeader.tsx`** — nav already has `Library` (`/library`); `isActive`
  uses `startsWith`, so the nav item lights up. No header change.
- **`app/(site)/page.tsx`** — `HomePage` is a **non‑async** server component with static
  `next/image` imports. Has a hardcoded `type LibraryItem` + `libraryItems` array (3 entries)
  and a "From the library" `<Section>` whose cards are `<Link href="/library">` with a
  `bg-tint` band + centered `FileText` icon, `eyebrow` category, `font-serif` filename,
  blurb, and a `type · size` meta row. Also a local copy of the button recipes.
- **`sanity/lib/queries.ts`** — `PUBLISHED_LIBRARY_ITEMS_QUERY`: `*[_type == "libraryItem" &&
  status == "published"] | order(_createdAt desc)` returning `_id, title, description,
  category, files[]{_key, title, "asset": asset->{_id, url, originalFilename, extension,
  mimeType, size}}, status`. Newest‑first is already the query order.
- **`sanity/lib/publicContent.ts`** — `getPublishedLibraryItems(): Promise<PublishedLibraryItem[]>`,
  server‑only, published‑only, via `sanityFetch` (public dataset, no token).
- **`sanity/lib/types.ts`** — `PublishedLibraryItem { title; description; category; files:
  LibraryFile[] | null }`, `LibraryFile { _key; title?; asset: { _id; url; originalFilename?;
  extension?; mimeType?; size? } | null }`. Sufficient as‑is — **no type changes**.
- **`next.config.ts`** — `images.remotePatterns` already allows `cdn.sanity.io` (only needed
  for `next/image`; downloads are plain `<a>`).
- **`studio/scripts/seed.ts`** — 13 published `libraryItem`s, categories: `Bible Class` (5),
  `Evangelism` (3), `Youth` (2), `Family` (1), `Leadership` (1), `Worship` (1). Several items
  have **2 files**; **every seeded file is a PDF** (`uploadPdf`). Real multi‑sentence
  `description`s. Assets carry real `size` bytes and `extension: "pdf"`.

## Design read (`design/library-desktop.jpg`)
Identical structure to `sermons-desktop.jpg`:
- Header — serif **"Library"** (~30px) + muted subtitle **"Teaching notes, slides and
  handouts — free to download."** on the left; a bordered pill **"All ministries ›"** on the
  right.
- Card grid, **5 across** on wide desktop. Card = pale‑green gradient band → uppercase green
  category eyebrow (`FOUNDATION CLASS`, `TEACHING MINISTRY`, `CHILDREN'S MINISTRY`, `CHOIR`,
  `YOUTH MINISTRY`) → serif **filename** title incl. extension (`Foundation Class Wk 6
  Notes.pdf`, may wrap two lines) → a description line → a bottom rule with **file type**
  (`PDF` / `PPT`) left and **size** (`1.4 MB`) right.
- The full‑width 6th card is read as an **orphan‑row artifact** of the old mock renderer
  stretching an incomplete last row (same call as `sermons-pages.md` D5) — **not** a
  "featured" treatment.

## Key decisions

### D1 — One card per *file* (flatten `files[]`), titled by filename
The mock's card titles are filenames **with extensions** and each card shows exactly **one**
type + one size — i.e. a card is a single downloadable file, not a `libraryItem`. So the page
flattens every published item's `files[]` into a list of file rows, preserving query order
(`_createdAt desc`, then file‑array order). A row is:
```ts
type LibraryFileRow = {
  key: string;          // `${item._id}:${file._key}`
  category: string;      // item.category
  filename: string;      // file.asset.originalFilename ?? file.title ?? item.title
  description: string;    // item.description  (see D2)
  typeLabel: string;      // fileTypeLabel(ext, mime) → "PDF" | "PPT" | …
  sizeLabel: string;      // formatBytes(size)      → "1.4 MB"
  downloadUrl: string;    // `${asset.url}?dl=${encodeURIComponent(filename)}`
};
```
Files whose `asset` or `asset.url` is missing are skipped. With the current seed this yields
~20 rows across the 13 items.

### D2 — Description uses the real `item.description`, line‑clamped to 2 lines
The mock repeats the single sentence "Download for personal or group study." on every card —
read as lo‑fi filler, not a data field. `description` is a **required** schema field with
real content in the seed, and DESIGN‑SYSTEM.md §17 forbids inventing placeholder copy, so the
card shows the genuine description with `line-clamp-2` (matching the mock's 2‑line height).
*(If the reviewer wants the literal mock line instead, swap the one string.)*

### D3 — One‑click download via Sanity's `?dl=` param; whole card + a "Download" button
Each card is an `<a href={downloadUrl} download>`. `downloadUrl` appends
`?dl=<encoded original filename>` to the asset URL — Sanity's documented way to force
`Content-Disposition: attachment` with the right filename (the bare `download` attribute is
ignored cross‑origin from `cdn.sanity.io`, so `?dl=` is what actually makes it download). The
card also renders a full‑width **secondary** "Download" pill (`btnSecondary`, `Download`
icon) as a `<span>` (visual affordance only — it can't be a nested `<button>`/`<a>` inside the
card anchor). This satisfies the explicit "download button" ask while a click anywhere on the
card still downloads. No `target="_blank"`; `rel` not needed for a same‑tab download.

### D4 — Same toolbar as `/sermons`, library facets: Search + Ministry + File type
New `components/site/LibraryFilters.tsx` (`"use client"`), a near‑copy of `SermonFilters`:
- **Search** — pill input, `Search` icon left, clear `X` right, `type="search"`,
  `aria-label="Search the library"`, debounced 300ms → `?q=`. Matches (case‑insensitive
  substring) against `filename` **or** `description` **or** `category`.
- **Ministry select** — `<PillSelect placeholder="All ministries" aria-label="Filter by
  ministry">` of the distinct categories (`localeCompare` sorted) → `?category=` (exact match).
  Label text "All ministries" matches the mock.
- **File type select** — `<PillSelect placeholder="All file types" aria-label="Filter by file
  type">` of the distinct `typeLabel`s → `?type=` (exact match). **Rendered only when there
  are ≥ 2 distinct types** (mirrors `sermons-search-filter.md` D4; with the all‑PDF seed it
  stays hidden until a PPT/other is added).
- **"Clear all"** — ghost text button, shown when any param is active → `router.replace("/library")`.
- URL writes use `router.replace(…, { scroll: false })` + `URLSearchParams` (empty key
  omitted, so "Clear all" → bare `/library`); local search state kept in sync with the `q`
  prop (same prop‑derived‑state pattern as `SermonFilters`).
The page (server component) reads `q` / `category` / `type` from `await searchParams`,
validates `category` ∈ its option list and `type` ∈ its option list (junk param ignored, no
confusing empty page), applies all active filters with **AND**, and renders the toolbar + a
count line + the grid.

### D5 — Extract `PillSelect` into its own module, reused by both filter toolbars
`SermonFilters`' internal `PillSelect` is moved to **`components/site/PillSelect.tsx`**
(exported), and `SermonFilters` is edited to import it (deleting its local copy — identical
markup, so behaviour is unchanged). `LibraryFilters` imports the same component. This is the
only edit to sermon code; `tsc` / `lint` / `build` cover it.

### D6 — Uniform card grid, no "featured" card
`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` — same as `/sermons`.
The mock's full‑width last card is treated as an incomplete‑last‑row artifact (D5 of
`sermons-pages.md`). Easy to add a featured‑latest treatment later if wanted.

### D7 — Card band: flat gradient, no icon (match the mock)
`aspect-[16/9]` band, `bg-gradient-to-br from-tint to-tint-strong`, `aria-hidden`, no icon —
`library-desktop.jpg` shows a plain pale‑green band. (The homepage teaser keeps its existing
`FileText`‑in‑`bg-tint` band, which matches `home-desktop.jpg`; the two references differ, so
each page follows its own.)

### D8 — Rendering: `export const dynamic = "force-dynamic"` on `/library`
Matches `/sermons` and its rationale ("publishing in the Studio shows without a rebuild").
`metadata`: `title = "Library — The Church of Christ, Evueta"`, description from the subtitle.

### D9 — Homepage: wire "From the library" to real data, cards download on click
`app/(site)/page.tsx` becomes an **async** server component with `export const dynamic =
"force-dynamic"`. The hardcoded `type LibraryItem` + `libraryItems` array are removed; instead
`getPublishedLibraryItems()` is fetched, flattened with the **same** helper as `/library`, and
`.slice(0, 3)` drives the existing "From the library" cards (markup, band, icon, classes
unchanged). Each teaser card changes from `<Link href="/library">` to `<a
href={row.downloadUrl} download>`; the "Browse library" pill still links to `/library`. If the
flattened list is empty the whole "From the library" `<Section>` is not rendered (degrade
gracefully, §12). No other part of the homepage is touched.

### D10 — Shared helpers in `components/site/library.ts`
- `formatBytes(bytes: number): string` — `< 1_000_000` → `"<n> KB"` (rounded); else
  `"<n.n> MB"` (`toFixed(1)`). Decimal base, matches the mock's "900 KB" / "1.4 MB" style.
- `fileTypeLabel(ext?: string | null, mime?: string | null): string` — `pdf→"PDF"`,
  `ppt|pptx→"PPT"`, `doc|docx→"DOC"`, `xls|xlsx→"XLS"`, `key→"KEY"`, else
  `ext?.toUpperCase() ?? "FILE"` (fall back to `mime` sniff only if `ext` absent).
- `downloadHref(url: string, filename: string): string` → `` `${url}?dl=${encodeURIComponent(filename)}` ``.
- `flattenLibraryFiles(items: PublishedLibraryItem[]): LibraryFileRow[]` — the shared flatten
  used by both the page and the homepage.

## Files to touch
- **New** `app/(site)/library/page.tsx` — server component; `dynamic = "force-dynamic"`;
  `metadata`; fetch + flatten + option lists + param validation + AND filter + count +
  `<LibraryFilters>` + grid of `<LibraryCard>` + empty state.
- **New** `components/site/LibraryCard.tsx` — server component; props `{ row: LibraryFileRow }`;
  `<a href download>` card (band → eyebrow → serif filename `break-words` → `line-clamp-2`
  description → `type · size` meta row → full‑width `btnSecondary` "Download" span).
- **New** `components/site/LibraryFilters.tsx` — `"use client"`; props `{ q, category, type,
  allCategories, allTypes }`; search + `PillSelect`s + Clear all; writes `?q/category/type`.
- **New** `components/site/PillSelect.tsx` — extracted from `SermonFilters` (exported).
- **New** `components/site/library.ts` — `formatBytes`, `fileTypeLabel`, `downloadHref`,
  `flattenLibraryFiles`, and the `LibraryFileRow` type.
- **Edit** `components/site/SermonFilters.tsx` — import `PillSelect` from the new module;
  remove the local copy. No behaviour change.
- **Edit** `app/(site)/page.tsx` — `async` + `dynamic = "force-dynamic"`; drop the hardcoded
  library array/type; fetch + flatten + `slice(0,3)`; teaser cards become `<a … download>`;
  hide the section when empty. Nothing else changed.
- **No** changes to schema, `queries.ts`, `publicContent.ts`, `types.ts`, `next.config.ts`,
  `package.json`, or the seed.

## Requirements
- Matches the mockup: layout, 4px‑multiple spacing, Newsreader only for the `h1` and card
  titles, tokens only (no new colors/radii/shadows), `rounded-lg` cards + pill controls,
  `shadow-card` (+ `shadow-pop` on hover). Sentence‑case copy; plain empty state.
- **Mobile‑first:** 1‑column grid on phones; header stacks (title/subtitle then toolbar);
  toolbar stacks (search full‑width, selects wrap, Clear + count below); no horizontal scroll
  at 360px; every control and the card/Download target ≥ 40px tall.
- Reuses `Container`, the card idiom, `buttons.ts` recipes, `PillSelect`, `cn` — no new visual
  language.
- All filtering is **server‑side** in the page component; `LibraryFilters` imports nothing
  from `sanity/lib/*` and holds only the option‑string arrays + current values.
- Deep links apply on first load: `/library?category=Bible%20Class&q=study` is server‑rendered
  filtered.
- `q` / params are used only for in‑memory string comparison and to build a same‑origin URL
  via `URLSearchParams` — no GROQ interpolation (no new query at all), no
  `dangerouslySetInnerHTML`.
- No `any`. Rows keyed by `` `${item._id}:${file._key}` ``. One `<h1>` per page. Decorative
  band is `aria-hidden`; the card `<a>` gets `aria-label={`Download ${filename}`}`.
- Icons: Lucide, stroke, ~14–16px (`Search`, `X`, `ChevronDown`, `Download`).

## Security / access‑control considerations
- `/library` is **public / ungated** by design (`AGENTS.md` §7 "default to public", §12 "no
  login wall unless asked"). It only ever reads `status == "published"` content —
  `getPublishedLibraryItems()` hard‑filters that under `perspective: "published"`. This task
  adds **no new fetch path**.
- Download links point at `cdn.sanity.io` file assets, which are world‑readable on the public
  dataset by design; `?dl=` only adds a `Content-Disposition` header — no token, no query
  injection.
- `LibraryFilters` is a client component but receives only public option strings (category
  names, file‑type labels) — nothing sensitive, nothing non‑published.
- No Clerk, Postgres, draft/in‑review, or admin surface touched. The homepage change swaps a
  hardcoded array for the same published‑only helper.

## Acceptance criteria
1. `/library` (logged out) renders serif "Library" + the subtitle + an "All ministries"
   select, then a card grid of **every published file** (~20 with the current seed), newest
   item first, 1 col on a phone / up to 5 across on wide desktop. Each card: gradient band,
   uppercase category, serif filename (extension included, wraps if long), 2‑line description,
   a `TYPE · SIZE` rule, and a full‑width "Download" button.
2. Clicking a card **or** its "Download" button downloads the file; the saved file keeps its
   original name and extension (`Content-Disposition: attachment` via `?dl=`).
3. The search box filters by filename/description/category (debounced ~300ms), writing `?q=`;
   reloading that URL shows the same result. "All ministries" → `?category=…` narrows to that
   category; "All ministries" (empty) clears it. Filters AND‑combine; a count line reads
   `"N files"` unfiltered / `"Showing M of N"` filtered.
4. "Clear all" appears when any filter is set and returns to `/library` (all files, box
   empty, selects reset). A no‑match combination shows "No files match those filters." + a
   working "Clear all filters" link; the toolbar stays visible.
5. Junk params (`?category=Nobody`, `?type=ZIP`) are ignored — the full grid still renders,
   not an empty page. The File‑type select is absent while all files share one type.
6. Home page "From the library" shows the **3 newest** library files (real filenames /
   categories / sizes from Sanity); each card downloads on click; "Browse library" still
   links to `/library`. With no published library items the section is omitted.
7. Mobile ≤ 400px: toolbar and header stack, no horizontal scroll. Desktop ≥ 1180px:
   multi‑column grid matching the mock's rhythm.
8. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass. No client component imports
   `sanity/lib/*`; no `status != "published"` path reachable from `/library` or `/`.

## Checks to run (report real output)
- Repo root: `npx tsc --noEmit`; `npm run lint`; `npm run build`.
- `npm run dev`, logged out:
  - `curl -s localhost:3000/library | grep -c '?dl='` → ~20 (one per file).
  - `curl -s 'localhost:3000/library?category=Bible%20Class' | grep -c '?dl='` → only that
    category's files.
  - `curl -s 'localhost:3000/library?q=evangelism' | grep -oE 'No files match|Showing [0-9]+ of [0-9]+|[0-9]+ files'`.
  - `curl -s 'localhost:3000/library?category=Nobody' | grep -oE '[0-9]+ files'` → full count
    (junk ignored).
  - `curl -s localhost:3000/ | grep -c 'cdn.sanity.io/files'` → 3 (homepage teaser).
  - Pick one file URL from the page, then
    `curl -sI "<asset-url>?dl=test.pdf" | grep -i 'content-disposition'` → `attachment`.
- `grep -RnE "sanity/lib" components/site/LibraryFilters.tsx components/site/PillSelect.tsx` →
  no matches.
- DevTools at 360 / 768 / 1280 on `/library` and `/` — no horizontal scrollbar; toolbar
  reflows.

## Manual test steps
1. `npm run dev`; open `http://localhost:3000/library` logged out.
2. Confirm: serif "Library" + subtitle + "All ministries" pill; a grid of file cards, newest
   item first, 1 col at phone width, up to 5 across wide; each card = gradient band +
   `CATEGORY` + serif filename + 2‑line description + `PDF · 1.4 MB` rule + "Download" button;
   hover raises the card.
3. Click a card → the PDF downloads with its real filename. Click another card's "Download"
   button → same.
4. Type "study" in the search box → grid narrows after ~300ms, URL shows `?q=study`; reload →
   still filtered; click `X` → back to the full grid.
5. "All ministries" → "Evangelism" → only Evangelism files; URL `?category=Evangelism`; add
   `q=slides` → AND result; count reads "Showing N of M". "Clear all" → `/library`, full grid.
6. Load `/library?category=Bible%20Class` directly → SSR'd filtered (view source shows only
   those cards). Load `/library?category=Nobody` → full grid (junk ignored).
7. Set search + ministry so nothing matches → "No files match those filters." + "Clear all
   filters" works; toolbar still visible.
8. Open the homepage → "From the library" shows 3 real newest files; clicking one downloads;
   "Browse library" → `/library`.
9. Throttle to 360px on `/library` and `/` — no sideways scroll; toolbar stacked.
10. `npx tsc --noEmit && npm run lint && npm run build` — all clean.

## Needs your attention (flag in the final report)
- **All seeded library files are PDFs**, so the mock's "PPT" type and the File‑type filter
  won't be visible until a non‑PDF is added (schema + code already handle it). Add one via the
  Studio or a seed tweak as a separate request if you want it in the demo.
- Multi‑file items (e.g. "Personal Evangelism…") appear as **one card per file**, sharing the
  parent's description (D1/D2). Say if you'd rather have one card per item instead.

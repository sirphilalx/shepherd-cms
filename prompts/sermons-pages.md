# Implementation prompt — Sermons list + sermon detail pages

## Goal
Build the two public sermon pages to the provided desktop mockups
(`design/sermons-desktop.jpg`, `design/sermon-detail-desktop.jpg`), mobile-first, wired to the
Sanity read layer:

1. **`/sermons`** — published sermons as a card grid, newest first, with a **series filter**
   ("All series" control, top-right).
2. **`/sermons/[slug]`** — a single sermon: series eyebrow, title, speaker · date, hero image
   (or placeholder), Portable Text body, and a media link button when the sermon has one.

## Skills / docs read
- `design/DESIGN-SYSTEM.md` — §2 color tokens, §3 type scale (Newsreader only for h1/h2/card
  titles), §4 spacing (4px base), §5 radius (`rounded-lg` = 20px for cards, pills for buttons),
  §6 two-layer shadows (`shadow-card` / `shadow-pop`), §8 buttons (one primary per view,
  pills, icon-first), §10 cards, §16 responsive rules ("mobile is a different layout, not a
  shrunk one"), §17 sentence-case copy / plain empty states.
- AGENTS.md §3 (mobile-first, reproduce references exactly, reuse existing components/Tailwind
  patterns), §7–8 (sermon fields: title, slug, date, speaker, series?, coverImage?, Portable
  Text body, mediaUrl?, ministry?), §12 (sermon blog chronological newest-first, filters for
  series/speaker, "do not build a custom media player — embed or link", degrade gracefully on
  empty fields), §14 (checks).
- `sanity-best-practices` → `references/portable-text.md` (rendering with `@portabletext/react`,
  custom components per block style).

## Code / config inspected
- **`app/(site)/layout.tsx`** — `<SiteHeader/> <main class="flex-1"> <SiteFooter/>`. Root
  `app/layout.tsx` mounts `<SanityLive/>` and the Inter / Newsreader `next/font` vars.
- **`app/(site)/sermons/page.tsx`** — current minimal list (`getPublishedSermons()`,
  `export const dynamic = "force-dynamic"`, inline `formatDate` in `en-GB`). Will be replaced.
- **`app/(site)/page.tsx`** — home page: establishes the exact card idiom I should reuse —
  `flex flex-col overflow-hidden rounded-lg bg-surface shadow-card` + image band
  (`aspect-[16/10]` / fixed-height `bg-tint` placeholder) + `p-5` body + eyebrow
  (`text-[11px] font-semibold uppercase tracking-[0.08em] text-accent`) + `font-serif` title +
  `text-ink-muted` sub + a `flex items-center justify-between border-t border-border pt-3
  text-[11.5px] text-ink-faint` meta row. Also `btnPrimary` / `btnSecondary` / `pillLink`
  string recipes and the "This Sunday" block, which is essentially the sermon-detail hero
  pattern (eyebrow · serif title · "Speaker · date" · body · primary + secondary buttons).
- **`components/site/Section.tsx`** — `<Container>` (`mx-auto w-full max-w-[1180px] px-5
  md:px-8`) and `<Section title subtitle action>` (serif h2 + subtitle left, one action right).
- **`components/site/SiteHeader.tsx`** — `isActive("/sermons")` already lights the nav item for
  both routes (`pathname.startsWith(href)`).
- **`components/ui/cn.ts`** — `cn()` class merger.
- **`sanity/lib/queries.ts`** — `PUBLISHED_SERMONS_QUERY` returns `{_id, _type, title, slug,
  date, speaker, series, ministry, mediaUrl, coverImage{...,"alt":alt, asset}, status}` ordered
  `date desc`; `PUBLISHED_SERMON_BY_SLUG_QUERY` adds `body`. Params are `$slug` (safe).
- **`sanity/lib/publicContent.ts`** — `getPublishedSermons()`, `getPublishedSermon(slug)` —
  server-only, published-only, via `sanityFetch`. Types in `sanity/lib/types.ts`
  (`PublishedSermonListItem`, `PublishedSermon` with `body?: unknown[] | null`).
- **`sanity/lib/image.ts`** — `urlFor(source)` (`@sanity/image-url`). `@sanity/image-url` and
  `@portabletext/react@6.2.0` + `@portabletext/types@4.0.2` are in `node_modules` (transitive)
  but **not** in `package.json` — must be added since we import them directly.
- **`next.config.ts`** — empty. No `images.remotePatterns` → `next/image` with a
  `cdn.sanity.io` src will 404 until added.
- **`app/globals.css`** — Tailwind v4 `@theme` tokens: `bg`, `surface`, `primary`,
  `primary-hover`, `tint`, `tint-strong`, `accent`, `ink` / `ink-muted` / `ink-faint`,
  `border` / `border-strong`, `shadow-card` / `shadow-pop`, `--radius-lg: 20px`,
  `font-serif` / `font-sans`.
- **Seed data** (`studio/scripts/seed.ts`) — 13 published sermons, series
  `Back to the Bible` / `The New Testament Church` / `Gospel Meeting 2026` / none, speakers
  `Michael Alexander` etc., Portable Text bodies with `normal` / `h2` / `blockquote` blocks,
  **no `coverImage`, no `mediaUrl` on any sermon**.

## Design read (from the two JPGs)
**List (`sermons-desktop.jpg`):** page header — serif "Sermons" (~30px) + muted subtitle
"Teachings from our unified services, newest first." on the left; a bordered pill
"All series ⌄" on the right. Below: a card grid, **5 across** on wide desktop. Card = rounded
image band (light-green placeholder) → uppercase green series label ("GRACE SERIES",
"FRUIT OF THE SPIRIT", "STANDALONE") → serif title (~18px, may wrap two lines) → muted speaker
→ a bottom row with the date on the left. The mockup shows a 6th card spanning full width on
its own row — read as an **orphan-row artifact** of the mock having 6 items in a 5-col grid,
**not** a "featured" treatment (see D5).

**Detail (`sermon-detail-desktop.jpg`):** a single centered column (~720px). Uppercase green
series label → serif title (~38px) → one muted meta line "Speaker · Date" → a wide rounded
**dark-green** hero block → body paragraphs in muted ink → a row of buttons: a dark primary
and a bordered secondary. Same `<SiteHeader>` / `<SiteFooter>` as every public page.

## Key decisions

### D1 — Reuse the home-page card/hero idiom verbatim
No new visual language. Card = the exact classes from `app/(site)/page.tsx`'s Upcoming /
Library cards. Hero + button row on the detail page = the "This Sunday" block's structure.
Button styles = the existing `btnBase` / `btnPrimary` / `btnSecondary` recipes, lifted into a
tiny shared module so both pages and the home page could converge later (this task only adds
the module and uses it in the new pages; home page left untouched).

### D2 — `duration` ("· 32 min") is omitted everywhere
The schema (AGENTS.md §8) has **no duration field**. The mockups show "32 min" on every card
and in the detail meta line; there is nothing to populate it from. Cards show only the date;
the detail meta line reads "Speaker · Date". Flagged in the report — add a `duration` field as
a separate scoped request if the church tracks it.

### D3 — "Download notes" button is omitted; the media button is conditional
The detail mock shows a primary "Download notes" and a secondary "Watch on YouTube". The
schema has **no sermon→notes relation** (library files are their own documents with no link),
so "Download notes" has no data source and is omitted. The remaining button is driven by
`mediaUrl` (§8 "optional linked audio/video", §12 "link, don't build a player"): rendered only
when set, as the single **primary** pill, label by host — `youtube.com`/`youtu.be` →
"Watch on YouTube", `vimeo.com` → "Watch on Vimeo", else "Watch or listen" — `Play` icon,
`target="_blank" rel="noopener noreferrer"`. When `mediaUrl` is absent the button row is not
rendered at all.

### D4 — Cover image with graceful placeholder (§12)
`coverImage` present → `next/image` (`fill`, `object-cover`, `sizes`) via
`urlFor(coverImage).url()`, `alt` from `coverImage.alt` (fallback: the sermon title).
Absent → a CSS gradient block: `bg-gradient-to-br from-tint to-tint-strong` on list cards,
`from-primary to-accent` on the detail hero (matches the mock's light vs. dark image areas).
`next.config.ts` gets `images.remotePatterns` for `cdn.sanity.io`.

### D5 — Uniform card grid, no special "featured" card
`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`. The mock's full-width
6th card is treated as an incomplete-last-row artifact, not a feature. Flagged; easy to add a
featured-latest treatment later if the user wants it.

### D6 — Series filter via `?series=` (server-filtered), native `<select>` control
The list page (server component) reads `searchParams.series` (Next 16: `await searchParams`),
filters the already-fetched list in JS (small N), and passes the distinct series list +
current value to a `"use client"` `<SeriesFilter>`. The control is a native `<select>`
(most thumb-friendly filter on mobile) styled as the bordered pill from the mock
(`appearance-none`, `rounded-full border border-border-strong bg-surface`, `pr-9` +
absolutely-positioned `ChevronDown`), `aria-label="Filter sermons by series"`, first option
"All series" (`value=""`). `onChange` → `router.push({ pathname: "/sermons", query })` (object
form, typed-routes-safe). Sermons with no series are grouped under a "Standalone" label in the
card eyebrow but the filter only lists real series values (+ "All series").

### D7 — Portable Text renderer
New `components/site/PortableText.tsx` exporting a configured `<SermonBody value={...} />`
wrapper around `@portabletext/react`'s `PortableText` with `sermonBodyComponents`:
- `block.normal` → `<p>` 14px, `leading-[1.8]`, `text-ink-muted`, `mt-4` between paragraphs.
- `block.h2` → `<h2>` `mt-8 font-serif text-[22px] text-ink`.
- `block.h3` → `<h3>` `mt-6 font-serif text-[18px] text-ink`.
- `block.blockquote` → `<blockquote>` `mt-6 border-l-2 border-tint-strong pl-4 italic
  text-ink-muted`.
- `marks.link` → `<a class="text-primary underline" target=_blank rel=noopener>` (external),
  in-app links plain.
- `marks.strong` / `marks.em` → `<strong>` / `<em>`.
- `list bullet/number` + `listItem` → `<ul class="mt-4 list-disc pl-5">` / `<ol ... list-decimal>`
  with `text-ink-muted` items.
- `types.image` → `next/image` `width={1400} height={788}` `className="mt-6 h-auto w-full
  rounded-lg"`, `alt` from the block's `alt` (fallback `""`), src `urlFor(value).width(1400).url()`.
Body value cast to `PortableTextBlock[]` from `@portabletext/types`.

### D8 — Rendering strategy: keep `export const dynamic = "force-dynamic"` on both pages
Matches the existing list page's established choice and its comment ("publishing in the Studio
is reflected without a rebuild"). No `generateStaticParams`. Unknown slug → `notFound()`.
`generateMetadata` on the detail page: `title = "<sermon title> — Sermons"`, `description`
from `toPlainText(body).slice(0, 155)` (fallback to a generic line).

### D9 — Small seed touch-up: `mediaUrl` on a few sermons
So the detail media button is actually visible in the demo, add a plausible
`https://www.youtube.com/watch?v=…` `mediaUrl` to ~4 of the 13 seed sermons in
`studio/scripts/seed.ts` and re-run `npm run seed`. Clearly-fictional demo data per
DESIGN-SYSTEM.md §17. Noted in `prompts/seed-sample-content.md`.

## Files to touch
- **New** `app/(site)/sermons/[slug]/page.tsx` — detail page + `generateMetadata` + `notFound()`.
- **Rewrite** `app/(site)/sermons/page.tsx` — header (serif h1 + subtitle + `<SeriesFilter>`),
  `?series=` filtering, card grid, empty states.
- **New** `components/site/SermonCard.tsx` — one card (server component; props = a
  `PublishedSermonListItem`). Links to `/sermons/${slug}`.
- **New** `components/site/SeriesFilter.tsx` — `"use client"` native `<select>` pill.
- **New** `components/site/PortableText.tsx` — `<SermonBody>` + `sermonBodyComponents`.
- **New** `components/site/format.ts` — `formatDate(iso) → "Aug 30, 2026"` (`en-US`,
  `{month:"short", day:"numeric", year:"numeric"}`), shared by both pages/card.
- **New** `components/site/buttons.ts` — export `btnBase`, `btnPrimary`, `btnSecondary`,
  `pillLink`, `eyebrow` (moved from the inline recipes in `app/(site)/page.tsx`; page.tsx not
  modified in this task — it keeps its own copy — the module is the future single source).
  *(If the reviewer prefers, skip this module and inline the recipes in the two new files.)*
- **Edit** `next.config.ts` — `images: { remotePatterns: [{ protocol: "https", hostname:
  "cdn.sanity.io" }] }`.
- **Edit** `package.json` — add `@portabletext/react` `^6.2.0` and `@portabletext/types`
  `^4.0.2` to `dependencies`.
- **Edit** `studio/scripts/seed.ts` — `mediaUrl` on ~4 sermons (D9); re-run the seed.
- **Edit** `prompts/seed-sample-content.md` — one line noting the `mediaUrl` addition.

## Requirements
- Matches the mockups: layout, spacing (4px multiples), type (Newsreader only for the page
  h1 and card/section titles per §3), color tokens, `rounded-lg` cards + pill buttons,
  `shadow-card`. Sentence-case copy; plain empty states.
- **Mobile-first:** list grid is 1 column on phones; the header stacks (title/subtitle then
  filter); detail column is full-width with `px-5`, buttons stack full-width
  (`flex-col sm:flex-row`, `max-sm:w-full`); no horizontal scroll at 360px; tap targets ≥ 40px.
- Reuses existing components/recipes (Container, card idiom, button recipes, `cn`, `eyebrow`);
  no new colors, radii, or shadows.
- Server components fetch through the existing `getPublishedSermons()` /
  `getPublishedSermon()` — no new query, no client-side Sanity access, published-only.
- `getPublishedSermon` slug comes from the route param (never trusted string interpolation
  into GROQ — the existing helper already parametrises `$slug`).
- Unknown / unpublished slug → `notFound()` (renders the app's 404).
- No `any`. Portable Text value typed `PortableTextBlock[]`. Lists keyed by `_key`.
- Icons: Lucide, stroke, size ~14–16 (`ChevronDown`, `Play`) per §7.
- a11y: `<select>` has a label; every `next/image` has meaningful `alt` (title fallback);
  decorative gradient placeholders are `aria-hidden`; one `<h1>` per page; buttons are real
  `<a>`/`<button>`.

## Security / access-control considerations
- Both routes are **public** (ungated) by design (AGENTS.md §12) — they must only ever read
  `status == "published"` content, which the existing helpers guarantee (hard filter +
  `perspective: "published"`). This task adds no new fetch path.
- `mediaUrl` is rendered as an outbound link with `rel="noopener noreferrer"` and
  `target="_blank"`; it is validated as `http(s)` by the schema. No embedding of third-party
  iframes/scripts (§12 "link, don't build a player").
- No Clerk, Postgres, draft/review, or admin surface touched.
- `next/image` remote pattern is scoped to `cdn.sanity.io` only.

## Acceptance criteria
1. `/sermons` (logged out) lists the 13 seeded sermons as cards, newest first
   ("The Pattern of New Testament Worship" / the future-dated gospel-meeting sermon at the
   top per `date desc`), each showing series (or "Standalone"), title, speaker, formatted date,
   and a placeholder image band; each card links to `/sermons/<slug>`.
2. The "All series" control lists the distinct seeded series; choosing one navigates to
   `/sermons?series=<value>` and the grid shows only that series; "All series" clears it.
   Deep-linking `/sermons?series=Back%20to%20the%20Bible` works on first load (server-filtered).
3. `/sermons/<slug>` renders series eyebrow, serif title, "Speaker · Date", a dark-green
   placeholder hero, and the Portable Text body with visibly distinct `h2` headings and
   `blockquote` scripture styling.
4. A sermon with `mediaUrl` shows one primary "Watch on YouTube" button opening the URL in a
   new tab; a sermon without `mediaUrl` shows no button row.
5. `/sermons/does-not-exist` renders the 404 page (not a crash, not an empty shell).
6. Mobile (≤ 400px): list is a single column, header stacked, detail buttons full-width and
   stacked, no horizontal overflow. Desktop (≥ 1180px): multi-column card grid matching the
   mock's rhythm.
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
8. `grep` shows no client component importing `sanity/lib/*` and no `status != "published"`
   reachable from these routes.

## Checks to run (report real output)
- `npm install` (picks up the two `@portabletext/*` deps).
- `cd studio && npm run seed` (D9) — confirm 13 sermons, ~4 with `mediaUrl`.
- repo root: `npx tsc --noEmit`; `npm run lint`; `npm run build`.
- `npm run dev`, then logged out:
  - `curl -s localhost:3000/sermons | grep -c 'href="/sermons/'` → ≥ 13.
  - `curl -s 'localhost:3000/sermons?series=Back%20to%20the%20Bible'` → only that series.
  - open `/sermons/the-pattern-of-new-testament-worship` → body + hero render.
  - `curl -s -o /dev/null -w '%{http_code}' localhost:3000/sermons/nope` → `404`.
- Responsive: DevTools at 360 / 768 / 1280 on both pages — no horizontal scrollbar.

## Manual test steps
1. `npm install && cd studio && npm run seed && cd ..` then `npm run dev`.
2. Logged out, open `http://localhost:3000/sermons`. Confirm: 13 cards, newest first, 1 col on
   a phone width, up to 5 across on a wide window; each card = image band + "SERIES" + serif
   title + speaker + date; hover raises the card (`shadow-pop`).
3. Use "All series" → pick "The New Testament Church" → URL becomes `/sermons?series=The%20New%20Testament%20Church`,
   grid filters; reload the URL directly → still filtered; pick "All series" → back to 13.
4. Click a card → `/sermons/<slug>`. Confirm series eyebrow, big serif title, "Speaker · Date",
   dark-green hero, body with a styled `h2` and an indented italic `blockquote`.
5. Open a sermon that got a `mediaUrl` (e.g. one of the D9 four) → a single dark "Watch on
   YouTube" button opens YouTube in a new tab. Open one without → no button row.
6. Visit `/sermons/not-a-real-slug` → the 404 page.
7. Throttle to a 360px viewport on both pages — no sideways scroll; detail buttons are
   full-width stacked.
8. `npx tsc --noEmit && npm run lint && npm run build` — all clean.

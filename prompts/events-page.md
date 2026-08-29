# Implementation prompt — Public events page + homepage "Upcoming" wired to real data

## Goal
1. **`/events`** — a new public page listing published, upcoming events (date today or later),
   soonest first, built to `design/events-desktop.jpg`, mobile-first, wired to the existing
   Sanity read layer.
2. **Homepage `Upcoming` section** — replace the hardcoded `events` array in
   `app/(site)/page.tsx` with the **first 3** upcoming events from the same read layer,
   rendered with the shared card. "All events" link already points at `/events`.

"Newest 3" is read as **the next 3 upcoming events** (soonest `startsAt` first) — that is what
the existing `UPCOMING_EVENTS_QUERY` already orders by, and what a homepage "Upcoming" strip
means. Flagged in the report in case the church wants "most recently added" instead.

## Skills / docs read
- AGENTS.md §3 (mobile-first; reproduce provided references exactly; reuse existing
  components / Tailwind patterns), §8 (Event fields: title, description, startsAt, endsAt?,
  location, image?, ministry?, workflow status), §12 ("events page shows only `published`
  events with a date today or later, soonest first… past events age out automatically — no
  RSVP/ticketing"), §13 (be explicit about the timezone a gathering's date is rendered in;
  "published" + date filter belong in the same server-side query — never a client-side date
  compare), §14 (checks).
- `prompts/sermons-pages.md` + `prompts/library-page.md` — the established idiom for a public
  list page in this repo (Container + serif h1 + muted subtitle, card grid, plain empty state,
  server component reading through `sanity/lib/publicContent`, no client-side Sanity access).
- `design/DESIGN-SYSTEM.md` (via the sermon/library prompts) — color tokens, Newsreader for
  h1/card titles only, 4px spacing, `rounded-lg` cards, `shadow-card`/`shadow-pop`,
  sentence-case copy, plain empty states.

## Code / config inspected
- **`sanity/lib/queries.ts`** — `UPCOMING_EVENTS_QUERY` already exists and is correct:
  `*[_type == "event" && status == "published" && coalesce(endsAt, startsAt) >= now()]
  | order(startsAt asc)` returning `{_id, _type, title, description, location, startsAt,
  endsAt, ministry, image{...,"alt":alt, asset}, status}`. **No query change needed.**
- **`sanity/lib/publicContent.ts`** — `getUpcomingEvents(): Promise<UpcomingEvent[]>` already
  exists (server-only, published-only, via `sanityFetch`). **No read-layer change needed.**
- **`sanity/lib/types.ts`** — `UpcomingEvent` already defined: `title: string`,
  `description: string`, `location: string`, `startsAt: string`, `endsAt?: string | null`,
  `ministry?: string | null`, `image?: SanityImageRef | null`, `status: 'published'`.
- **`app/(site)/page.tsx`** — the `Upcoming` `<Section>` currently maps a local
  `EventItem[] events` constant: card = `article.flex flex-col overflow-hidden rounded-lg
  bg-surface shadow-card` → fixed-height `h-[132px] bg-tint` icon band (`Calendar`) → `p-5`
  body: `eyebrow` date → `font-serif text-[18px]` title → `text-[13px] text-ink-muted` blurb
  → footer `flex items-center justify-between border-t border-border pt-3 text-[11.5px]
  text-ink-faint` with `location` left / `ministry` right. `Section` action is a `pillLink`
  to `/events`. `Calendar` from lucide-react is imported and used **only** here.
- **`components/site/LibraryCard.tsx`** — the current best card reference: image band is
  `aspect-[16/9]` with `bg-gradient-to-br from-tint to-tint-strong` when there is no image,
  `aria-hidden`; body `flex flex-1 flex-col p-5`; `line-clamp-2` on the description.
- **`components/site/SermonCard.tsx`** — shows the `next/image` cover pattern:
  `urlFor(img).width(640).height(360).fit("crop").url()`, `fill`, `object-cover`, `sizes`,
  `alt` from `image.alt || title`, wrapped in `relative aspect-[16/9] bg-tint`.
- **`components/site/Section.tsx`** — `<Container>` (`mx-auto w-full max-w-[1180px] px-5
  md:px-8`); `<Section title subtitle action>`.
- **`components/site/buttons.ts`** — `eyebrow` (`text-[11px] font-semibold uppercase
  tracking-[0.08em] text-accent` — note **`uppercase`** is baked in), `pillLink`.
- **`components/site/format.ts`** — `formatDate(iso)` → `"Aug 30, 2026"` (`en-US`,
  `{month:"short", day:"numeric", year:"numeric"}`, **no `timeZone`**). Good for a single date
  with a year; the events card needs a range + no year, so a small dedicated helper is added.
- **`components/site/SiteHeader.tsx`** — nav **already** has `{ label: "Events", href:
  "/events" }`; `isActive` uses `pathname.startsWith("/events")`. **No header change.**
- **`next.config.ts`** — `images.remotePatterns` already allows `cdn.sanity.io`. **No change.**
- **`app/(site)/sermons/page.tsx` / `library/page.tsx`** — neither sets `export const
  dynamic`; both rely on `sanityFetch` (live.ts) for caching/revalidation. The events page
  follows the same convention (no `dynamic`/`revalidate` export).
- **`studio/scripts/seed.ts`** — 14 seeded events (`seed-event-*`), all `status:"published"`,
  **none with an image**, `startsAt` with explicit `+01:00` offsets, spanning 2026-07-14 →
  2027-01-18. Several are multi-day (`endsAt` on a later date: VBS, gospel-meeting nights are
  single-day, Winter Youth Retreat 2027-01-16→18). With today = 2026-08-29, 13 of 14 are
  upcoming (the July VBS has aged out). **No seed change needed** — good coverage as-is.

## Design read (`design/events-desktop.jpg`)
Standard site header. Page body inside the normal container:
- Serif **"Upcoming events"** h1 (~26–30px), then a muted subtitle
  **"Soonest first — past events are archived automatically."**
- A **3-across** card grid (equal-height cards, `gap-4`), 1 column on mobile.
- Card: a rounded **light-green image/placeholder band** (~16/9) → body with an uppercase
  green **date eyebrow** (`SEPT 12–13`, `SEPT 20`, `OCT 5` — range collapses to a single day
  when start == end, no year shown) → serif **title** (~18px) → 1–2 lines of muted
  **description** → a top-bordered footer row: **location** left, **ministry** right, small
  faint text.
- No per-event detail link, no RSVP, no time-of-day shown on the card (matches §12 / the
  mockup). Footer band, same as the homepage `Upcoming` cards today.

## Key decisions

### D1 — One shared `EventCard`, reused by the page and the homepage
New `components/site/EventCard.tsx` (server component; prop: a single `UpcomingEvent`).
Built from the **LibraryCard idiom** so the events page and homepage match and the homepage's
hand-rolled card markup collapses into it:
- Root `article` (not a link — no event detail route): `flex h-full flex-col overflow-hidden
  rounded-lg bg-surface shadow-card`. No hover-raise (nothing to click).
- Image band `relative aspect-[16/9]`: if `event.image?.asset` →
  `next/image` (`urlFor(event.image).width(640).height(360).fit("crop").url()`, `fill`,
  `object-cover`, `sizes="(min-width: 768px) 360px, 100vw"`, `alt = event.image.alt ||
  event.title`); else `bg-gradient-to-br from-tint to-tint-strong`, `aria-hidden`.
- Body `flex flex-1 flex-col p-5`: `<p className={eyebrow}>{formatEventDateRange(...)}</p>`
  → `<h3 className="mt-2 font-serif text-[18px] leading-[1.25] text-ink">` → description
  `<p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-[1.6] text-ink-muted">` →
  footer `<div className="mt-4 flex items-center justify-between border-t border-border pt-3
  text-[11.5px] text-ink-faint">` with `<span>{event.location}</span>` and, when set,
  `<span>{event.ministry}</span>` (omit the ministry span entirely when null — keep the
  location left-aligned).

### D2 — `formatEventDateRange` in a new `components/site/events.ts`
`export function formatEventDateRange(startsAt: string, endsAt?: string | null): string`
- All parts rendered with a **fixed display timezone** `EVENT_TZ = "Africa/Lagos"` (UTC+1,
  matching the seed offsets and the church locale referenced on the homepage) via
  `toLocaleDateString("en-US", { timeZone: EVENT_TZ, ... })`. This is the deliberate answer to
  AGENTS §13's "be explicit about the timezone" — a 19:00+01:00 event must not drift a day
  based on the server's clock. Exported as a named const so it's swappable in one place.
- Month rendered with `month: "short"` (`"Sep"`, `"Oct"`); day with `day: "numeric"`.
  **No year** (matches the mockup). Output is normal case — the `eyebrow` class applies
  `uppercase`, and the page's other usage also uppercases (see D5).
- Range logic on the **calendar day in `EVENT_TZ`**:
  - no `endsAt`, or same Y/M/D as start → `"Sep 20"`.
  - same month & year, later day → `"Sep 12–13"` (en-dash, no repeated month).
  - different month (or year) → `"Sep 30 – Oct 2"` (en-dash padded with spaces).
- Pure string logic, no locale-list parsing; safe to unit-reason about.

### D3 — `/events` page = the sermons/library page skeleton, minus filters
New `app/(site)/events/page.tsx`, `async` server component:
- `export const metadata` (static — no params): `title: "Events — The Church of Christ,
  Evueta"`, `description: "Upcoming services, gospel meetings, classes and fellowships at The
  Church of Christ, Evueta."`
- `const events = await getUpcomingEvents();`
- `<Container className="py-12 md:py-16">` → header block (serif `h1` "Upcoming events" using
  the exact classes from the sermons/library `h1`: `font-serif text-[26px] leading-[1.15]
  tracking-[-0.01em] text-ink md:text-[30px]`) + subtitle `<p className="mt-1 text-[13px]
  text-ink-muted">Soonest first — past events are archived automatically.</p>`.
- Body:
  - `events.length === 0` → plain empty state (matches §17 / sibling pages):
    `<p className="mt-10 text-[14px] text-ink-muted">No upcoming events right now. Check back
    soon.</p>`.
  - else → `<ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">` of
    `<li key={event._id}><EventCard event={event} /></li>`.
- No `?filter` params, no client component, no count line (the sibling pages' count line is
  tied to their filters; there are none here). No `export const dynamic`.

### D4 — Homepage: swap static array for the read layer, reuse `EventCard`
In `app/(site)/page.tsx`:
- Delete the `EventItem` type and the `events` constant.
- In `HomePage()` add `const upcomingEvents = (await getUpcomingEvents()).slice(0, 3);`
  alongside the existing `libraryFiles` fetch.
- The `Upcoming` `<Section>`:
  - Wrap it in `upcomingEvents.length > 0 && ( … )` — same "hide when empty" treatment the
    `From the library` section already uses (don't render an empty strip on the homepage).
  - Replace the `.map` body with `upcomingEvents.map((event) => <EventCard key={event._id}
    event={event} />)` inside the existing `grid grid-cols-1 gap-4 md:grid-cols-3`.
  - Update the now-inaccurate subtitle `"What's on across the church this month."` →
    `"What's coming up across the church."` (the list isn't month-scoped).
  - Keep the `action` `pillLink` to `/events` ("All events").
- Remove `Calendar` from the `lucide-react` import (its only use was the old card's icon band;
  `EventCard`'s empty state is a gradient, matching `LibraryCard`). Leave every other homepage
  section untouched.

### D5 — Where the eyebrow/date is used outside a class with `uppercase`
Only place is `EventCard`, whose `eyebrow` class already uppercases. `formatEventDateRange`
therefore returns normal case and does no `.toUpperCase()` itself (keeps it presentation-free).

## Files to touch
- **New** `app/(site)/events/page.tsx` — server component + static `metadata`; header, grid,
  empty state.
- **New** `components/site/EventCard.tsx` — shared card (server component; prop
  `event: UpcomingEvent`).
- **New** `components/site/events.ts` — `EVENT_TZ` const + `formatEventDateRange()`.
- **Edit** `app/(site)/page.tsx` — fetch `getUpcomingEvents()`, slice 3, render via
  `EventCard`, hide section when empty, drop `EventItem`/`events`/`Calendar`, tweak subtitle.

No changes to: Sanity schema, `sanity/lib/*` (query + helper already exist), `next.config.ts`,
`package.json`, `SiteHeader.tsx`, `studio/scripts/seed.ts`.

## Requirements
- Matches `design/events-desktop.jpg`: 3-up equal-height cards, light-green placeholder band,
  uppercase green date eyebrow, serif title, muted description, bordered location/ministry
  footer; Newsreader only for the `h1` and card titles; 4px-multiple spacing; `rounded-lg`
  cards; `shadow-card`; sentence-case copy; plain empty state.
- **Mobile-first:** 1 column on phones, `md:grid-cols-3` from `768px`; header stacks
  naturally; no horizontal scroll at 360px; card text wraps (`line-clamp-3` on description,
  long titles wrap).
- Reuses `Container`, `eyebrow`, the LibraryCard markup idiom, `urlFor`, `cn`; introduces no
  new color/radius/shadow tokens.
- Server components only; data comes solely from `getUpcomingEvents()` — no new query, no
  client-side Sanity access, published-only, date filter stays in GROQ (`>= now()`).
- No `any`. `UpcomingEvent` used as-is. List items keyed by `_id`.
- `next/image` only for a real `event.image.asset`; decorative gradient placeholder is
  `aria-hidden`. One `<h1>` on the page.
- Timezone for every rendered event date is `EVENT_TZ` (`Africa/Lagos`), not the server's.

## Security / access-control considerations
- `/events` is **public / ungated** by design (AGENTS §12). It reads only
  `status == "published"` content — enforced by `UPCOMING_EVENTS_QUERY` (literal
  `status == "published"`) and the public client's `perspective: "published"` (double-enforced,
  per §13). This task adds no new fetch path and no tokened/admin/draft access.
- The "today or later" rule lives in the **server GROQ** (`coalesce(endsAt, startsAt) >=
  now()`), never a client-side date comparison (§13). The homepage `.slice(0, 3)` is applied
  server-side on already-filtered, already-ordered data.
- No Clerk, Postgres, portal, directory, or admin surface touched. No outbound links, no
  third-party embeds, no user input parsed (no query params).
- `next/image` remote host stays scoped to `cdn.sanity.io` (already configured).

## Acceptance criteria
1. `/events` (logged out) lists every published event with `coalesce(endsAt, startsAt) >=
   now()`, soonest first — with the current seed + today 2026-08-29 that's 13 events, starting
   with "Area-Wide Youth Devotional" (2026-09-04); the past "Summer VBS 2026" (July) does not
   appear.
2. Each card shows: placeholder band, uppercase date (single day `SEP 4`; same-month range
   `NOV 25`… single-day; the 2027 Winter Youth Retreat as `JAN 16–18`), serif title,
   ≤3-line description, and a footer with location left and ministry right (ministry-less
   events — e.g. "Senior Saints Fellowship Luncheon" — show only the location, no empty right
   span).
3. Multi-day, cross-month spans render as `MON D – MON D`; same-month as `MON D–D`; single-day
   (start == end or no end) as `MON D`. All computed in `Africa/Lagos`.
4. Homepage `Upcoming` section shows exactly the first 3 of the same list, same card, "All
   events" pill → `/events`. If there were zero upcoming events the whole section is absent
   (no empty strip).
5. `/events` with no upcoming events (verify by reasoning / temporary clock change, not a
   seed edit) shows "No upcoming events right now. Check back soon." and no grid.
6. Mobile ≤400px: single column, no horizontal overflow, on both `/events` and the homepage.
   Desktop ≥768px: 3-up grid.
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
8. `grep` confirms no client component imports `sanity/lib/*` for this feature and no
   `status != "published"` path is reachable from `/events`.

## Checks to run (report real output)
- Repo root: `npx tsc --noEmit`; `npm run lint`; `npm run build`.
- `npm run dev`, logged out:
  - `curl -s localhost:3000/events | grep -c 'border-t border-border'` → 13 (one footer row
    per card) — or count card titles.
  - `curl -s -o /dev/null -w '%{http_code}' localhost:3000/events` → `200`.
  - `curl -s localhost:3000/ | grep -c 'All events'` → `1`, and the homepage shows 3 event
    cards with real seeded titles (not "Youth Conference 2026" / the old static copy).
- Responsive: DevTools at 360 / 768 / 1280 on `/events` and `/` — no horizontal scrollbar,
  grid goes 1→3 up at 768.
- Sanity Studio unaffected (no schema touch) — no Studio redeploy needed for this task.

## Manual test steps
1. `npm run dev`. Logged out, open `http://localhost:3000/events`.
2. Confirm: serif "Upcoming events" + subtitle; a 3-up card grid (1-up on a phone width);
   first card is the soonest **future** event; the July VBS is absent.
3. Check date formats: a single-day event reads `SEP 4`; the Winter Youth Retreat
   (2026-01-16→18… 2027) reads `JAN 16–18`; confirm none show a year and none are off by a
   day versus their `startsAt` wall-clock time.
4. Find "Senior Saints Fellowship Luncheon" (no ministry) — footer shows only the location,
   right side empty, layout not broken.
5. Open `http://localhost:3000/` — the `Upcoming` section shows the **same first 3** events
   as the top of `/events`, identical card style, and "All events" links to `/events`.
6. Throttle to 360px on both pages — no sideways scroll; cards stack; text clamps.
7. `npx tsc --noEmit && npm run lint && npm run build` — all clean; paste output.

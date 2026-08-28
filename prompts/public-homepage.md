# Implementation prompt — Public homepage

## Goal
Build the public, ungated homepage for the church website, matching `design/home-desktop.jpg`
and `design/home-mobile.jpg` exactly, and fully responsive between the two. This is the first
public page; set up the shared public header/footer so later public pages (sermons, library,
events, schedule, about) reuse them.

## Skills / docs read
- `AGENTS.md` + `design/DESIGN-SYSTEM.md` — full read. Tokens already live in `app/globals.css`
  (`@theme`) and components in `components/ui/*`.
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` — `next/image`, local
  images via `public/`, static import gives intrinsic size + blur, `fill` for full-bleed.
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — App Router
  pages/layouts, route groups, `LayoutProps`/`PageProps` global helpers, `next/link`.

## Code inspected
- `app/layout.tsx` — root layout: Inter (`--font-inter`/`font-sans`) + Newsreader
  (`--font-newsreader`/`font-serif`), `<body class="min-h-full flex flex-col font-sans">`.
- `app/page.tsx` — current placeholder at `/` (links to `/design-system`). Will be replaced.
- `app/globals.css` — Tailwind v4 `@theme` tokens: `bg`, `surface`, `primary`(+`-hover`),
  `tint`(+`-strong`), `accent`, `ink`(+`-muted`/`-faint`), `border`(+`-strong`), status pairs,
  `--radius-sm/md/lg` (9/14/20), `--shadow-card`, `--shadow-pop`.
- `components/ui/Button.tsx` — `<button>` only (primary/secondary/ghost, pill, `sm` size). Not a
  link; homepage CTAs are links, so style `next/link` with the same class recipe (same pattern
  the current `app/page.tsx` already uses).
- `components/ui/Card.tsx`, `cn.ts`, `icons.tsx` — `Icon` set is admin-focused; import the extra
  glyphs straight from `lucide-react` (verified present: `Menu`, `X`, `ChevronRight`, `Users`,
  `Music2`, `Radio`, `HandHelping`, `Baby`, `GraduationCap`, `Download`, `Play`, `MapPin`,
  `Calendar`, `FileText`, `Clock`, `BookOpen`).
- `public/` — usable assets: `The Church of Christ.png` (1080²logo, transparent),
  `IMG_6809.jpg` / `IMG_6838.jpg` / `IMG_6842.jpg` (1980×3520 worship photos). `*.HEIC` files
  are not web-renderable — left untouched, not referenced.

## Decisions & assumptions
- **Brand name = "The Church of Christ", locality "Evueta"**, taken from the mockup (AGENTS.md
  §1 says rename the "Shepherd" working title to the church's preferred name). Update the site
  header/footer and `app/layout.tsx` `metadata` accordingly. Component filenames/props that say
  "Shepherd" in `components/ui` are left as-is (out of scope).
- **All homepage copy is static**, transcribed from the mockup, held as typed `const` arrays at
  the top of `app/(site)/page.tsx`. No CMS/DB wiring — sermons, events, and library items are
  Sanity content types (AGENTS.md §8) that don't exist yet. This page swaps to GROQ fetches when
  the Studio schema lands; structure the data consts so that swap is a drop-in. Flagged in the
  report as example content to replace before launch (DESIGN-SYSTEM.md §17).
- **Rename the 4 asset files** to web-friendly names (no spaces) so they can be `import`ed:
  `The Church of Christ.png`→`logo.png`, `IMG_6809.jpg`→`worship-congregation.jpg`,
  `IMG_6838.jpg`→`worship-singing.jpg`, `IMG_6842.jpg`→`worship-portrait.jpg`. `git mv`
  (they're currently untracked, so plain `mv`).
- **Route group `app/(site)/`** holds the public shell: `layout.tsx` (header + `{children}` +
  footer) and `page.tsx` (`/`). `app/page.tsx` is deleted (its `/` route moves into the group).
  `/design-system` stays top-level on the root layout, unchanged.
- Nav links point at real future paths (`/sermons`, `/library`, `/events`, `/schedule`,
  `/about`); "Member Login" → `/portal`. None of those routes exist yet — that's expected; they
  404 until built. Home = `/`.
- Event/library card thumbnails in the mockup are flat `--tint` blocks with a small icon (no
  photo) — reproduce exactly. The "This Sunday" card image uses `worship-congregation.jpg`.
- Hero, the zones band, and the visit-CTA band use `worship-singing.jpg`,
  `worship-portrait.jpg`, and `worship-congregation.jpg` respectively, each under a dark
  overlay for text contrast.
- Header is a client component (mobile menu `useState`); everything else is a server component.
- Icons: outline, `strokeWidth={1.7}`, `currentColor` (DESIGN-SYSTEM.md §7).

## Files to touch
- `app/layout.tsx` — update `metadata` (title/description) to the church name. (root layout
  otherwise unchanged; keeps `flex flex-col` so footer sits at the bottom).
- `app/page.tsx` — **delete**.
- `app/(site)/layout.tsx` — **new**. Renders `<SiteHeader/>`, `<main class="flex-1">{children}</main>`, `<SiteFooter/>`.
- `app/(site)/page.tsx` — **new**. Homepage composition + static data consts.
- `components/site/SiteHeader.tsx` — **new**, `"use client"`. Logo lockup, centered nav, Member
  Login pill; mobile: logo + hamburger toggling a full-width menu panel.
- `components/site/SiteFooter.tsx` — **new**. Copyright left, service-time line right.
- `components/site/Section.tsx` — **new**. Small helper: eyebrow-less section wrapper with
  serif `h2`, optional subtitle, optional right-aligned action slot, consistent vertical rhythm.
- `public/` — rename 4 files as above.
- No `next.config.ts` change (local images only; no `images.remotePatterns` needed).

## Requirements — layout & sections (top to bottom, per mockup)
1. **Header** (sticky, `bg-bg/90` + `backdrop-blur`, `border-b border-border`): left = circular
   `logo.png` (~34px) + "The Church of Christ" (Inter 600, ~15px) with "EVUETA" eyebrow
   (10px, `0.14em` tracking, `ink-faint`) beneath. Center–right = text links Home / Sermons /
   Library / Events / Schedule / About (13.5px; active = `primary` weight 600 — Home active on
   `/`). Far right = "Member Login" primary pill. **< md**: hide nav + button, show hamburger
   (`Menu`/`X`); tapping opens a stacked menu panel (links + full-width Member Login button)
   under the bar.
2. **Hero** (`worship-singing.jpg`, `object-cover`, dark left-to-right gradient overlay
   `from-black/70`; `min-h-[560px] md:min-h-[80vh]` cap ~`720px`; content bottom-aligned in the
   container): eyebrow "The Church of Christ, Evueta" (`accent`/white, uppercase, tracked);
   serif `h1` "A church family, gathered every week." (white, `text-[28px] md:text-[46px]`,
   `leading-[1.1]`); paragraph "Join us Sundays at 8am & 10am, Wednesdays at 5:30pm, and find
   your zone's fellowship in your neighbourhood." (`white/85`, max-w ~`34rem`); buttons row:
   "Plan your visit" (primary pill link → `/visit`) + "Watch latest sermon" (white/`surface`
   secondary pill link → `/sermons`, `Play` icon). Buttons stack full-width < sm.
3. **Service times** — `Section` h2 "Service times". Grid `grid-cols-1 sm:grid-cols-2
   lg:grid-cols-4`, gap 4. Each card (`bg-surface rounded-lg shadow-card p-5`): uppercase label
   (`accent`, 11px, tracked) / serif value (~20px) / `ink-muted` sub-line:
   - SUNDAY · "8:00 & 10:00am" · Main auditorium
   - WEDNESDAY · "5:30pm" · Main auditorium
   - LAST THURSDAY · "6:00pm · Prayer meeting" · Main auditorium
   - 2ND SUNDAY · "Zonal fellowships" · Across all 5 zones
4. **This Sunday** — `Section` h2 "This Sunday", subtitle "Continue the series with us, live or
   from the sermon library.", action = "All sermons" secondary pill link (`ChevronRight`) →
   `/sermons`. One `bg-surface rounded-lg shadow-card overflow-hidden` card, inner grid
   `lg:grid-cols-2`: left = `worship-congregation.jpg` (`aspect-[16/10]`, `object-cover`);
   right = padding ~`p-6 md:p-8`: eyebrow "GRACE SERIES" (`accent`), serif h3 "Walking in
   Grace" (~22px), meta "Pastor J. Amadi · Aug 30, 2026 · 32 min" (`ink-muted` 12.5px),
   paragraph "What it means to live daily out of grace rather than performance — three
   practical shifts in prayer, relationships, and how we handle failure.", buttons:
   "Download notes" (primary, `Download` icon → `/library`) + "Watch on YouTube" (secondary →
   `/sermons`). Stacks (image on top) < lg.
5. **Zones band** — full-bleed section, `worship-portrait.jpg` right-anchored under a
   `primary`/black overlay (`bg-primary/85` blended), `rounded-lg` inner or full-bleed per
   mockup (full-bleed, no radius). Container-padded content, max-w ~`32rem`: serif h3 "One
   church family, five zones strong." (white, ~24px) + paragraph "Every member belongs to a
   zone close to home, gathering for fellowship beyond Sunday and cared for by a zonal leader
   who knows their name." (`white/80`). Vertical padding `py-14 md:py-20`.
6. **Find your place** — `Section` h2 "Find your place", subtitle "Six ways to get plugged in
   beyond a Sunday seat." Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, gap 4. Six cards
   (`bg-surface rounded-lg shadow-card p-5`), each: `tint` icon chip (36px rounded, `primary`
   icon) / title (Inter 600 ~15px) / description (`ink-muted` 13px) / "Learn more"
   (`primary` 600, 12.5px, `ChevronRight`) link → `/ministries/<slug>`:
   - Youth Ministry (`Users`) — "Ages 13–25 · worship, discipleship, and community every Friday."
   - Choir (`Music2`) — "Weekly rehearsals and leading worship across all unified services."
   - Media & Production (`Radio`) — "Sound, livestream and photography for every gathering."
   - Ushering Unit (`HandHelping`) — "Welcoming faces and steady hands at every service and event."
   - Children's Ministry (`Baby`) — "Age-graded classes so kids grow in faith alongside the adults."
   - Foundation Class (`GraduationCap`) — "A six-week on-ramp into faith and church life for new believers."
7. **Upcoming** — `Section` h2 "Upcoming", subtitle "What's on across the church this month.",
   action = "All events" secondary pill link → `/events`. Grid `grid-cols-1 md:grid-cols-3`,
   gap 4. Event card (`bg-surface rounded-lg shadow-card overflow-hidden`): top `tint` block
   `h-[132px]` with centered `Calendar` icon (`primary/40`); body `p-5`: date eyebrow
   (`accent`, 11px tracked) / serif h3 (~18px) / description (`ink-muted` 13px) / footer row
   (`border-t border-border pt-3 mt-4`, 11.5px `ink-faint`): location left, ministry right:
   - "SEPT 12–13" · Youth Conference 2026 · "Two days of worship, workshops and fellowship for ages 13–25." · Main auditorium / Youth Ministry
   - "SEPT 20" · Choir Rehearsal Retreat · "A day set apart for the choir ahead of the Q4 season." · Fellowship Hall / Choir
   - "OCT 5" · Foundation Class Graduation · "Celebrating this quarter's new believers." · Main auditorium / Foundation Class
8. **From the library** — `Section` h2 "From the library", subtitle "Recent notes and slides,
   free to download.", action = "Browse library" secondary pill link → `/library`. Grid
   `grid-cols-1 md:grid-cols-3`, gap 4. File card like the event card but top `tint` block has
   a `FileText` icon; body: category eyebrow (`accent`) / title = filename (Inter 600 ~14px,
   break-words) / description (`ink-muted` 13px) / footer row: file type left, size right:
   - FOUNDATION CLASS · "Foundation Class Wk 6 Notes.pdf" · "Session six handouts for new believers." · PDF / 1.4 MB
   - TEACHING MINISTRY · "Walking in Grace Slides.pptx" · "This week's teaching slides." · PPT / 3.8 MB
   - CHILDREN'S MINISTRY · "David & Goliath Lesson Series.pdf" · "This quarter's children's class series." · PDF / 2.0 MB
   Cards link to `/library`.
9. **Visit CTA band** — full-bleed, `worship-congregation.jpg` under dark overlay, `py-16
   md:py-24`. Container content max-w ~`34rem`: serif h3 "New here? We'd love to meet you."
   (white ~26px) + paragraph "Fill in a two-minute form and a member of our welcome team will
   save you a seat and walk you in — right here at our Evueta building." (`white/80`) +
   "Plan your visit" white/`surface` pill link → `/visit`.
10. **Footer** (`border-t border-border`, `py-8`, container): flex `col gap-2 md:row
    md:items-center md:justify-between`, 12.5px `ink-muted`. Left "© 2026 The Church of Christ,
    Evueta". Right "Evueta · Sundays 8am & 10am, Wednesdays 5:30pm".

## Shared conventions
- Container: `mx-auto w-full max-w-[1180px] px-5 md:px-8`.
- Section vertical rhythm: `py-12 md:py-16` (DESIGN-SYSTEM.md §4/§16: 40–64 desktop, ~24 mobile).
- Section head (`Section.tsx`): serif `h2` `text-[21px] md:text-[26px] text-ink`
  `tracking-[-0.01em]`; subtitle `mt-1 text-[13px] text-ink-muted`; optional action right-aligned
  on the same baseline (`flex items-start justify-between gap-4`, wraps under on `< sm`).
- CTA-link recipe (primary): `inline-flex items-center justify-center gap-2 rounded-full
  bg-primary px-[18px] py-[10px] text-[13.5px] font-semibold text-white hover:bg-primary-hover`.
  Secondary: `... bg-surface text-ink border border-border-strong hover:bg-bg`. On dark bands
  use `bg-white text-primary`.
- All `next/image`: static `import`, `sizes` set per breakpoint; full-bleed images use `fill`
  + a positioned parent; `priority` only on the hero.
- Sentence case everywhere; eyebrows/labels are the only uppercase (DESIGN-SYSTEM.md §17).
- No `any`; typed data consts (`ServiceTime`, `Ministry`, `EventItem`, `LibraryItem`, `NavLink`).

## Security / access control
- Public, ungated page — no auth, no Clerk, no DB/Sanity reads (none wired yet). Nothing
  sensitive rendered. The member directory and portal are explicitly **not** linked beyond the
  generic "Member Login" → `/portal` entry point (AGENTS.md §5, §12). No sitemap/robots work in
  this task.
- No user input, no forms submitted (the "Plan your visit" CTA is a link to a future `/visit`
  route, not an inline form).

## Acceptance criteria
- Desktop (`≥1180px`) matches `home-desktop.jpg`: section order, 4-up service times, 2-col
  This-Sunday card, 4-up ministries (6 items → 4 + 2), 3-up events and library, two full-bleed
  photo bands, centered header nav.
- Mobile (`375–414px`) matches `home-mobile.jpg`: single-column stack, hamburger menu that
  opens/closes, hero text at 28px, all grids collapsed to 1 col, bands and cards readable with
  ~20–24px side padding, no horizontal scroll at 320px.
- Tokens only — no raw hex, no new colors, no second accent hue (DESIGN-SYSTEM.md §2.5).
- Newsreader only on `h1`/`h2`/`h3` and the wordmark; Inter everywhere else (§3.3).
- Keyboard: hamburger is a real `<button aria-expanded aria-controls>`; menu closes on link
  activation; visible focus rings retained.
- Images have meaningful `alt`; decorative tint-block icons are `aria-hidden`.
- `app/page.tsx` removed; `/` renders the new homepage via the `(site)` group;
  `/design-system` still renders.

## Checks to run (report real output)
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (routes + layout changed)
- `npm run dev` — load `/` at 1440px and at 390px (DevTools), verify against both JPGs, toggle
  the mobile menu, confirm no console errors and no horizontal scrollbar at 320/375/414px.

## Manual test steps
1. `npm run dev`, open `http://localhost:3000/`.
2. Desktop 1440px: compare each section top-to-bottom with `design/home-desktop.jpg`.
3. Resize to 390px: compare with `design/home-mobile.jpg`; open/close the hamburger menu; tap a
   nav link and confirm the menu closes.
4. Check 320px width — no horizontal scroll.
5. Tab through the header — focus visible on links, logo, hamburger, Member Login.
6. Visit `/design-system` — still renders on the root layout.
7. Confirm nav links resolve to `/sermons` etc. (expected 404 until built) and `/` is marked
   active in the header.

# Prompt: Fix slow rendering on the public site

## Goal

Public pages (home, sermons, sermon detail, library) render slowly on every
navigation. Restore fast rendering without losing "content shows right after it
is published in the Studio".

## Skills / docs read

- `AGENTS.md` §5, §6, §12 — public read layer is `next-sanity` + `sanityFetch`
  against the public dataset; published content is meant to be cached/CDN-served.
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
  — route segment config; `force-dynamic` == every `fetch` forced to
  `{ cache: 'no-store', next: { revalidate: 0 } }` + per-request dynamic render.
  (`cacheComponents` is NOT enabled in `next.config.ts`, so the "previous model"
  applies.)
- `node_modules/next-sanity/dist/live/conditions/react-server/index.js` —
  `sanityFetch()` already sets `next: { revalidate: false, tags: [...] }` and
  `useCdn`. It is cached indefinitely and revalidated by tag via the
  `<SanityLive />` sync action (already mounted in `app/layout.tsx`) or
  `revalidateTag`. So publishing in the Studio already invalidates these pages
  without `force-dynamic` and without a rebuild.

## Code inspected

- `app/(site)/page.tsx:122`, `app/(site)/sermons/page.tsx:11`,
  `app/(site)/sermons/[slug]/page.tsx:15`, `app/(site)/library/page.tsx:11` —
  all four export `export const dynamic = "force-dynamic"`. Comments in the diff
  call it a stopgap ("real page will use tag-based revalidation instead").
- `app/layout.tsx` — `<SanityLive />` already rendered in the root layout, so
  tag revalidation on publish is already wired.
- `sanity/lib/live.ts` / `client.ts` — public client, `useCdn: true`,
  `perspective: 'published'`, `browserToken: false`. Correct already.
- `public/worship-singing.jpg` / `worship-portrait.jpg` /
  `worship-congregation.jpg` — 1.2–1.6 MB each, 1980×3520 source, all rendered
  as height-cropped `<Image fill>` backgrounds on the homepage.
- `public/logo.png` — 604 KB, 1080×1080, rendered at 36×36 in `SiteHeader`.
- `public/IMG_5579.HEIC`, `IMG_6722.HEIC`, `IMG_6751.HEIC` — ~7 MB total,
  untracked, referenced nowhere (`grep` clean). `next/image` cannot process
  HEIC.

## Root cause

`dynamic = "force-dynamic"` opts every content page out of the full route cache
AND out of the Next data cache, so each navigation blocks on a fresh Sanity
round-trip and a fresh server render. It was added only so newly published
content appears without a rebuild — but `sanityFetch` + `<SanityLive />` already
do that via tag revalidation. Oversized `/public` images and dead HEIC files add
image-optimization and scan overhead on top (worst in `next dev`).

## Decisions / assumptions

- Remove `dynamic = "force-dynamic"` from all four pages; add nothing in its
  place. `sanityFetch`'s tag cache + `<SanityLive />` handle freshness. The
  homepage becomes fully static + tag-revalidated; the sermons/library pages
  stay dynamic only because they read `searchParams`, but their Sanity fetch is
  now served from the data cache instead of a per-request round-trip.
- No Sanity webhook / `revalidate` route is needed — `<SanityLive />` already
  covers on-publish invalidation. (A webhook can be a later, separate task if we
  want revalidation independent of an open page.)
- Recompress the three worship JPGs in place to max 1800px long edge, quality
  ~70 (originals are recoverable from git commit `3b3676d`). Recompress
  `logo.png` to 144×144.
- Move the three `.HEIC` files out of `public/` into `design/source-photos/`
  (untracked, not served, not scanned) rather than deleting the user's photos.

## Files to touch

- `app/(site)/page.tsx` — delete the `export const dynamic` line + its comment.
- `app/(site)/sermons/page.tsx` — same.
- `app/(site)/sermons/[slug]/page.tsx` — same.
- `app/(site)/library/page.tsx` — same.
- `public/worship-singing.jpg`, `public/worship-portrait.jpg`,
  `public/worship-congregation.jpg`, `public/logo.png` — recompressed in place
  via `sips`.
- `public/IMG_5579.HEIC`, `public/IMG_6722.HEIC`, `public/IMG_6751.HEIC` —
  moved to `design/source-photos/`.

## Out of scope

- Cache Components / `'use cache'` migration.
- Sanity webhook revalidation route.
- Any change to the admin/tokened read path or access control.
- Converting the sermon/library list filtering to server-side GROQ (fine at
  current scale now that the fetch is cached).

## Requirements

- No page keeps `force-dynamic`.
- Publishing a sermon/library item in the Studio still reflects on the site
  without a rebuild (via `<SanityLive />` tag revalidation).
- No Sanity token reaches the browser (unchanged).
- Public pages return the same markup/content as before.

## Security / access control

- No change to gating. Only public, already-published content paths are touched.
- `browserToken: false` and the server-only `publicContent.ts` layer are
  untouched.

## Acceptance criteria

1. `grep -rn "force-dynamic" app/` returns nothing.
2. `next build` shows the homepage as static (`○`/prerendered) and
   sermons/library as dynamic (`ƒ`) — but building succeeds and is not slower.
3. Each recompressed image in `public/` is < 350 KB; `logo.png` < 30 KB.
4. `public/` contains no `.HEIC` files; the three files exist under
   `design/source-photos/`.
5. Homepage and sermons/library/detail pages render visually identical.

## Checks to run (web workspace)

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run dev`, then load `/`, `/sermons`, `/sermons/[a real slug]`,
  `/library` — confirm fast navigation and unchanged appearance.

## Manual test

1. `npm run dev`.
2. Visit `/`, `/sermons`, `/library` — repeat navigations should be near-instant
   (no per-request Sanity wait).
3. In the Studio, publish or edit a published sermon; within a few seconds the
   `/sermons` list updates without restarting `next dev`.
4. View source / network: confirm worship images now download at the smaller
   size and the logo is small.

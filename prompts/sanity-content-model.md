# Implementation prompt — Sanity content model + standalone Studio + server-only read layer

## Goal
Stand up the CMS half of Shepherd per AGENTS.md §8 (Content / Sanity) and §10 (approval
workflow):

1. **Four Sanity document types** — `sermonPost`, `libraryItem`, `announcement`, `event` — with
   exactly the fields listed in §8, all sharing one workflow `status`
   (`draft | in_review | published | rejected`) + a `reviewNote`.
2. **A standalone Studio workspace** (`studio/`), dev-facing only: schema + a basic desk
   structure with a filtered "Review queue" pane. No Presentation tool, no custom review UI —
   day-to-day review happens in the Shepherd admin panel later, against the read layer below.
3. **A server-only read layer** in the Next.js app:
   - a Sanity client whose token never reaches the browser,
   - public fetch helpers that **hard-filter `status == "published"`** (and run under
     `perspective: "published"` so native drafts are invisible too),
   - **one** shared review-queue fetch helper that returns all four types, plus a single-item
     helper — both token-gated and only importable from server code / role-gated routes.

This deviates from AGENTS.md §5 "do not embed the Studio": the repo shipped with an embedded
Studio scaffold, and the user chose (question panel, 2026-08-29) to **move to a standalone
workspace**. The Next.js app stays at the repo root (not moved into `web/`); `studio/` is a
sibling folder.

## Skills / docs read
- `sanity-best-practices` SKILL.md + `references/schema.md`, `references/groq.md`,
  `references/nextjs.md`, `references/studio-structure.md`.
- AGENTS.md §5 (structure / boundaries), §6 (stack — no public dataset, no client-side token,
  no embedded Studio), §8 (the data model), §10 (approval workflow), §12–13 (behaviour /
  gotchas — "published is the single source of truth", "draft content must never be fetched
  into a public page"), §14 (checks).

## Code / config inspected
- **Embedded Studio scaffold** (all untracked): root `sanity.config.ts` + `sanity.cli.ts`,
  `app/studio/[[...tool]]/page.tsx`, `sanity/schemaTypes/index.ts` (empty `types: []`),
  `sanity/structure.ts` (default `documentTypeListItems`), `sanity/env.ts`
  (`apiVersion` default `2026-08-29`, `dataset`, `projectId` from `NEXT_PUBLIC_SANITY_*`),
  `sanity/lib/client.ts` (`useCdn: true`, **no token, no perspective**), `sanity/lib/live.ts`
  (`defineLive({ client })`, no token), `sanity/lib/image.ts`.
- `app/layout.tsx` — root layout, `ClerkProvider` wrapping `{children}`; **no `<SanityLive/>`**.
- `app/(site)/layout.tsx` + `page.tsx` — public shell; homepage content is hard-coded consts
  (out of scope to wire here; `prompts/public-homepage.md` already flags the later swap).
- `proxy.ts` — Next 16 renamed `middleware`→`proxy`; `clerkMiddleware()` with **no route
  matcher protection**, so every route (incl. `/api/*`) is public unless a page opts in. A
  logged-out request reaches `/sermons` and `/api/dev/*`.
- `package.json` — `next 16.3.3`, `react 19.2.8`, `next-sanity ^13.3.3`, `sanity ^5.31.2`,
  `@sanity/vision ^5.31.2`, `styled-components ^6.5.3`, `@sanity/image-url ^2.1.1`.
  **`next-sanity@13` peerDeps require `sanity` AND `styled-components`** → keep both; only
  `@sanity/vision` is embedded-Studio-only and can leave the web app.
- `node_modules`: `server-only@0.0.1`, `groq`, `@sanity/icons@3.8.0`, `@portabletext/react@6.2.0`
  all present. No `@portabletext/types` package → body fields typed as `unknown[]` for now.
- `tsconfig.json` — `paths: { "@/*": ["./*"] }`; `include` globs `**/*.ts(x)`/`**/*.mts` with
  only `node_modules` excluded → **`studio/` must be added to `exclude`** or web `tsc` will try
  to compile it. Same for `eslint.config.mjs` `globalIgnores` (`npm run lint` = bare `eslint`).
- `.gitignore` — ignores `.env*` and `/node_modules` (root only) → add `studio/node_modules`,
  `studio/dist`, `studio/.sanity`.
- `.env.local` — has `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, Clerk keys.
  **No Sanity read token yet.**

## Key design decisions

### D1 — Private dataset ⇒ every read is server-side + tokened
AGENTS.md §6 forbids a public dataset, so even *published* documents need a token to read.
Therefore **all** Sanity reads happen in server code with a token that is:
- named `SANITY_API_READ_TOKEN` (no `NEXT_PUBLIC_` prefix),
- read only inside modules that start with `import "server-only"`,
- never passed as `browserToken` to `defineLive`.
A Sanity **Viewer** token (can read drafts) is required for the review-queue helpers; the same
token is fine for the public client.

### D2 — Two layers of "only published reaches the public"
1. Public client runs with `perspective: "published"` → native Sanity drafts are never returned.
2. Every public GROQ query literally contains `status == "published"` (belt + suspenders, and
   the §13 rule that "published" is never inferred from anything but the workflow field).

Contributors work on native Sanity drafts carrying `status` ∈ {`draft`,`in_review`,`rejected`};
an approver publishes the document *and* sets `status: "published"`. Announcements may be set
straight to `published` — that's a permission/UI concern for the admin panel, the schema still
offers all four states.

### D3 — Keep `defineLive` for the public path
It's the skill's recommended default and gives caching/revalidation for free. Configure it with
`serverToken` only (no `browserToken`); live browser updates degrade to no-op on a private
dataset — acceptable and documented. Public helpers call `sanityFetch`; the review-queue
helpers call the admin client directly with `{ next: { revalidate: 0 } }` (review data must be
fresh).

### D4 — Ministries / speakers are plain string labels here
`ministry` (owning ministry) and `speaker` are modelled as `string`, **not** Sanity references:
ministries and members live in Postgres (§8), referenced across systems by Clerk user id, and
none of those types exist yet. Flag in the report as a deliberate seam to revisit when the
Postgres layer lands.

### D5 — Body field shapes
- `sermonPost.body` → Portable Text (`array` of `block` + inline `image`).
- `announcement.body`, `event.description` → plain `text` (§7 "announcements are short";
  keeps the model minimal). Revisit if the church needs rich text there.

### D6 — No TypeGen yet
Cross-workspace TypeGen (schema in `studio/`, queries in the web app) is fiddly; for a minimal
first cut the read layer ships hand-written types in `sanity/lib/types.ts`. Note TypeGen as a
follow-up once the schema stabilises.

### D7 — Verifiability surface
Two small additions so the acceptance criteria are actually checkable now, before the admin
panel and real content pages exist:
- `app/(site)/sermons/page.tsx` — a **minimal real** public list (title, date, speaker) via the
  published helper. No Portable Text rendering, links are placeholders. This is also a genuine
  next step, not throwaway.
- `app/api/dev/content-selfcheck/route.ts` — **dev-only** (returns 404 when
  `NODE_ENV === "production"`). Calls every public helper + the review-queue helper, asserts
  every public item's `status === "published"` (500 otherwise), and returns
  `{ public: {…counts}, reviewQueue: { total, byType } }`. Deletable once the admin panel
  exercises the helpers for real.

## Files to touch

### New — `studio/` standalone workspace
- `studio/package.json` — `sanity ^5.31.2`, `@sanity/vision ^5.31.2`, `@sanity/icons ^3.8.0`,
  `styled-components ^6.5.3`, `react`/`react-dom 19.2.8`, `typescript ^5`, `@types/react ^19`.
  Scripts: `dev` (`sanity dev`), `build` (`sanity build`), `deploy` (`sanity deploy`),
  `schema:deploy` (`sanity schema deploy`), `typegen` (`sanity schema extract && sanity typegen generate`).
- `studio/sanity.config.ts` — `defineConfig({ name: "shepherd", title: "Shepherd Content",
  projectId, dataset, schema, plugins: [structureTool({ structure }), visionTool()] })`,
  ids from `process.env.SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET`.
- `studio/sanity.cli.ts` — `defineCliConfig({ api: { projectId, dataset }, autoUpdates: true })`.
- `studio/schemaTypes/index.ts` — registers the four types.
- `studio/schemaTypes/shared/workflow.ts` — `WORKFLOW_STATUSES` + `workflowFields`
  (`status` radio, `initialValue: "draft"`, required; `reviewNote` `text`, in a `workflow`
  field group, `hidden` unless `status === "rejected"`, custom validation requiring a note when
  rejected).
- `studio/schemaTypes/sermonPost.ts` — `title` (req), `slug` (source `title`, req),
  `date` (`datetime`, req), `speaker` (`string`, req — see D4), `series` (`string`, opt),
  `coverImage` (`image`, `hotspot`, nested `alt` string), `body` (Portable Text: `block` +
  `image` w/ `alt`), `mediaUrl` (`url`, opt — "linked audio/video"), `ministry` (`string`,
  opt — see D4), `...workflowFields`. `DocumentTextIcon`. Preview: speaker · date · status.
- `studio/schemaTypes/libraryItem.ts` — `title` (req), `description` (`text`, req),
  `category` (`string`, req — "category/ministry tag"), `files` (`array` of `file` members,
  `options.storeOriginalFilename`, optional per-file `title`; `validation` min 1),
  `...workflowFields`. Comment noting the frontend reads
  `files[]{ ..., asset->{ originalFilename, extension, mimeType, size, url } }`.
- `studio/schemaTypes/announcement.ts` — `title` (req), `body` (`text`, req),
  `image` (`image`, opt, `alt`), `expiresAt` (`datetime`, opt), `...workflowFields`.
- `studio/schemaTypes/event.ts` — `title` (req), `description` (`text`, req),
  `startsAt` (`datetime`, req), `endsAt` (`datetime`, opt, cross-field validation: after
  `startsAt`), `location` (`string`, req — "text is enough"), `image` (`image`, opt, `alt`),
  `ministry` (`string`, opt — see D4), `...workflowFields`.
- `studio/structure.ts` — `S.list().title("Shepherd content").items([ reviewQueue,
  S.divider(), Sermons, Library, Announcements, Events ])` where `reviewQueue` is
  `S.documentList().title("Awaiting review / not published").filter('_type in $types &&
  status != "published"').params({ types: [...] }).defaultOrdering([{ field: "_updatedAt",
  direction: "desc" }])`.
- `studio/tsconfig.json`, `studio/.gitignore` (`node_modules`, `dist`, `.sanity`, `.env*`),
  `studio/README.md` (run `npm i` then `npm run dev` → :3333; env vars).
- `studio/.env.example` — `SANITY_STUDIO_PROJECT_ID=`, `SANITY_STUDIO_DATASET=`.

### Delete (moved into `studio/` or embedded-only)
- `app/studio/` (whole dir), root `sanity.config.ts`, root `sanity.cli.ts`.
- `sanity/schemaTypes/`, `sanity/structure.ts`.

### Web app — read layer (`sanity/`)
- `sanity/env.ts` — unchanged (stays browser-safe: only `projectId`/`dataset`/`apiVersion`).
- `sanity/lib/token.ts` — **new**. `import "server-only"`; export
  `readToken = assertValue(process.env.SANITY_API_READ_TOKEN, …)`.
- `sanity/lib/client.ts` — rework: base client, **no token**, `perspective: "published"`,
  `useCdn: true`, `stega: false`. Safe to import anywhere (no secret). Only consumer is
  `live.ts`.
- `sanity/lib/live.ts` — rework: `import "server-only"`;
  `defineLive({ client, serverToken: readToken })` (no `browserToken`).
- `sanity/lib/adminClient.ts` — **new**. `import "server-only"`;
  `createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "drafts",
  token: readToken, stega: false })`.
- `sanity/lib/queries.ts` — **new**. `defineQuery` exports, every public one containing
  `status == "published"`:
  - `PUBLISHED_SERMONS_QUERY` (order `date desc`), `PUBLISHED_SERMON_BY_SLUG_QUERY`
  - `PUBLISHED_LIBRARY_ITEMS_QUERY`
  - `PUBLISHED_ANNOUNCEMENTS_QUERY` — `status == "published" && (!defined(expiresAt) ||
    expiresAt > now())`
  - `UPCOMING_EVENTS_QUERY` — `status == "published" && coalesce(endsAt, startsAt) >= now()`,
    order `startsAt asc`
  - `REVIEW_QUEUE_QUERY` — the single shared one:
    `*[_type in ["sermonPost","libraryItem","announcement","event"] && status != "published"]
    | order(_updatedAt desc){ _id, _type, _updatedAt, status, reviewNote, title,
    "slug": slug.current }`
  - `REVIEW_ITEM_BY_ID_QUERY` — `*[_id == $id][0]{ …per-type projection… }`
- `sanity/lib/types.ts` — **new**. `WorkflowStatus`, `ContentType`, `PublishedSermon`,
  `PublishedLibraryItem`, `PublishedAnnouncement`, `UpcomingEvent`, `ReviewQueueItem`,
  `ReviewItem`. Portable Text bodies typed `unknown[]`.
- `sanity/lib/publicContent.ts` — **new**. `import "server-only"`. `getPublishedSermons()`,
  `getPublishedSermon(slug)`, `getPublishedLibraryItems()`, `getPublishedAnnouncements()`,
  `getUpcomingEvents()` — each wraps `sanityFetch` with the matching query, returns typed data.
- `sanity/lib/adminContent.ts` — **new**. `import "server-only"`. `getReviewQueue()` →
  `ReviewQueueItem[]` (one query, all four types); `getReviewItem(id)` → `ReviewItem | null`.
  Both via `adminClient.fetch(…, { next: { revalidate: 0 } })`. File-level comment: import only
  from role-gated admin routes.

### Web app — wiring / config / verifiability
- `app/layout.tsx` — render `<SanityLive />` (from `@/sanity/lib/live`) just before `</body>`,
  after `{children}` / inside `ClerkProvider`.
- `app/(site)/sermons/page.tsx` — **new**, minimal published-sermons list (D7).
- `app/api/dev/content-selfcheck/route.ts` — **new**, dev-only self-check (D7).
- `package.json` — remove `@sanity/vision` from web deps (embedded-Studio-only). Keep `sanity`,
  `styled-components`, `next-sanity`, `@sanity/image-url` (next-sanity peers). No new web deps.
- `tsconfig.json` — add `"studio"` to `exclude`.
- `eslint.config.mjs` — add `"studio/**"` to `globalIgnores`.
- `.gitignore` — add `studio/node_modules`, `studio/dist`, `studio/.sanity`.
- `.env.example` (root, **new**) — document `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` (opt), `SANITY_API_READ_TOKEN`
  (server-only, Viewer role), plus the existing Clerk vars.

## Requirements
- Every field name/shape matches AGENTS.md §8. Model *what things are*, not presentation
  (schema.md §1). `defineType`/`defineField`/`defineArrayMember` throughout; every document type
  has a `@sanity/icons` icon imported from its **subpath** (`@sanity/icons/DocumentText`, not
  the root — root exports were removed in v5).
- One shared `workflowFields` array is spread into all four types — the review queue lists all
  four uniformly off the shared `status` field. No per-type workflow shape.
- `status` is a radio list (not a boolean), `initialValue: "draft"`, required. `reviewNote` is
  required exactly when `status === "rejected"`.
- `endsAt` must be after `startsAt` (cross-field validation).
- **No client-side Sanity token anywhere.** `SANITY_API_READ_TOKEN` appears only in
  `token.ts`; `token.ts`, `live.ts`, `adminClient.ts`, `publicContent.ts`, `adminContent.ts`
  each begin with `import "server-only"`. `defineLive` gets no `browserToken`.
- Every public query string contains the literal `status == "published"`; the public client
  runs `perspective: "published"`. The review-queue query is the **only** path that reads
  non-published content, and it lives behind the tokened admin client in a `server-only` module.
- `getReviewQueue()` is a **single** function issuing a **single** query covering all four
  types — not four calls, not four functions.
- Public helpers never return a document whose `status !== "published"` even if a caller passes
  hostile params (queries take `$slug`/`$id` as params, never string-interpolated).
- No `any`. Arrays keyed by `_key` on the frontend later (n/a in this task).

## Security / access-control considerations
- **Private dataset**: no `NEXT_PUBLIC` Sanity token, ever. Server-only token, `server-only`
  import guard on every module that touches it or reads drafts.
- **§13 "draft content must never be fetched into a public page"**: enforced twice —
  `perspective: "published"` on the public client *and* `status == "published"` in every public
  query. The dev self-check asserts it at runtime and 500s on any leak.
- **Review-queue helpers** are `server-only` and documented as admin-route-only; the only
  present caller is the dev-only self-check route, which 404s in production. Real callers will
  be the role-gated admin panel (later prompt) — they must still apply their own Clerk role
  check; this task does not add auth gating.
- `proxy.ts` leaves all routes public; `/sermons` and `/api/dev/content-selfcheck` are
  intentionally reachable logged-out — they must expose published data only.
- No Postgres, no Clerk role wiring, no membership/attendance/schedule data — out of scope.
  No Presentation tool / Visual Editing / draft-mode route in this task.
- CORS: server-to-Sanity fetches with a token don't need CORS entries. If the Studio's browser
  or a future Presentation tool needs it, run
  `npx sanity cors add http://localhost:3000 --credentials` — noted, not required here.

## Acceptance criteria
1. `studio/` runs standalone (`cd studio && npm i && npm run dev` → http://localhost:3333) and
   shows a "Review queue" pane plus Sermons / Library / Announcements / Events; each type's form
   renders `status` (radio, defaults to Draft) and a `reviewNote` that appears only when
   Rejected and blocks save when empty.
3. `npx sanity schema deploy` (from `studio/`) succeeds; the four types + workflow states are
   visible in the deployed schema.
4. In the web app: `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass; `studio/` is
   excluded from both and does not break them.
5. **A logged-out request to a public route never returns non-published content:** with a
   `draft`, an `in_review`, a `rejected`, and a `published` document of *each* type in the
   dataset —
   - `GET /sermons` (logged out) lists only the published sermon(s);
   - `GET /api/dev/content-selfcheck` (logged out) returns `public` counts that only ever
     count `published` docs, and does **not** 500 (its per-item `status === "published"`
     assertion holds).
6. **All four types are queryable through one shared review-queue-style fetch:**
   `getReviewQueue()` (one function, one query) returns items of all four `_type`s;
   `/api/dev/content-selfcheck` `reviewQueue.byType` shows non-zero counts for
   `sermonPost`, `libraryItem`, `announcement`, `event` given the seed data above.
7. `grep -rn "SANITY_API_READ_TOKEN" app sanity` shows it only in `sanity/lib/token.ts`; no
   Sanity token string reaches any client component or the browser bundle; `defineLive` has no
   `browserToken`.

## Checks to run (report real output)
- `studio/`: `npm install`; `npm run build`; `npx sanity schema deploy` (needs Sanity login —
  if unauthenticated, report that and stop at `build`); `npm run dev` smoke.
- web root: `npx tsc --noEmit`; `npm run lint`; `npm run build`; `npm run dev`.
- `grep -rn "SANITY_API_READ_TOKEN\|browserToken" sanity app`.

## Manual test steps
1. `cd studio && npm install && npm run dev` → open http://localhost:3333. Confirm the four
   types + "Review queue" pane. Open a new Sermon: `status` shows as a radio defaulting to
   Draft; set it to Rejected → `reviewNote` appears and the doc won't save until it's filled.
2. Create, for **each** of the four types, four documents — one `draft`, one `in_review`, one
   `rejected`, one `published` (fill required fields; publish the `published` ones so they're
   real Sanity published docs). For the event's published doc set `startsAt` in the future; add
   one extra published event with a past `startsAt` (+ no `endsAt`) to test the date filter.
   Add one published announcement with `expiresAt` in the past to test the expiry filter.
3. Add `SANITY_API_READ_TOKEN` (Sanity → Manage → API → Tokens, **Viewer**) to `.env.local`.
4. `npm run dev` (web). Logged out, open `http://localhost:3000/sermons` → only the published
   sermon appears; the draft/in-review/rejected ones do not.
5. Logged out, `curl -s localhost:3000/api/dev/content-selfcheck | jq` →
   - `public.sermons` / `.libraryItems` counts equal the number of *published* docs only;
   - `public.events` excludes the past-dated event; `public.announcements` excludes the
     expired one;
   - `reviewQueue.total` ≥ 12 and `reviewQueue.byType` has non-zero counts for all four types;
   - HTTP 200 (no 500 → the per-item published assertion held).
6. `NODE_ENV=production npm run build && npm run start`, then
   `curl -i localhost:3000/api/dev/content-selfcheck` → `404`.
7. `grep -rn "SANITY_API_READ_TOKEN" app sanity` → only `sanity/lib/token.ts`.
8. In the Studio, flip the `rejected` sermon to `published` (and set `status: published`);
   reload `/sermons` → it now appears.
</content>
</invoke>

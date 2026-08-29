# Implementation prompt — Seed sample CMS content (Church of Christ)

## Goal
Populate the `production` Sanity dataset with realistic, **published** sample content for a
typical Church of Christ congregation ("The Church of Christ, Evueta"), so the public site,
portal, Studio panes, and the dev self-check all have real data to render:

- **13 `sermonPost`** documents — blog-style teachings with Portable Text bodies.
- **13 `libraryItem`** documents — each with at least one real uploaded PDF file asset.
- **13 `announcement`** documents — short notices, future / absent expiry.
- **14 `event`** documents — 13 upcoming (Sep 2026 – Jan 2027) + 1 past (to exercise the
  date filter).

All content documents are created with `status: "published"` and real (non-`drafts.`) IDs so
they surface through the existing public read layer (`perspective: "published"` +
`status == "published"` in every query — `sanity/lib/queries.ts`).

## Skills / docs read
- `sanity-best-practices` SKILL.md + `references/migration.md` (import idempotency, asset
  upload via `client.assets.upload('file'|'image', buffer)`, "let Sanity generate `_id`s
  unless intentionally seeding repeatable fixtures").
- AGENTS.md §5 (Studio is standalone, content-only), §7–8 (the four content types and their
  exact fields), §10 (`draft | in_review | published | rejected` workflow; only `published`
  is public), §12–14 (public behaviour, degrade gracefully on empty fields, checks).
- `prompts/sanity-content-model.md` (D2 "two layers of only-published reaches public",
  D4 speaker/ministry are plain strings, D7 verification surfaces).

## Code / config inspected
- **`studio/schemaTypes/*`** — field shapes confirmed:
  - `sermonPost`: `title`, `slug` (`{current}`), `date` (datetime, req), `speaker` (string,
    req), `series` (string, opt), `coverImage` (image+alt, opt), `body` (PT: `block` +
    `image`), `mediaUrl` (url, opt), `ministry` (string, opt), `status`, `reviewNote`.
  - `libraryItem`: `title`, `description` (text, req), `category` (string, req),
    `files[]` (array of `file` members, each with optional `title` label,
    `options.storeOriginalFilename`), `status`, `reviewNote`.
  - `announcement`: `title`, `body` (text, req), `image` (opt), `expiresAt` (datetime, opt),
    `status`, `reviewNote`.
  - `event`: `title`, `description` (text, req), `startsAt` (datetime, req), `endsAt`
    (datetime, opt, must be after start), `location` (string, req), `image` (opt),
    `ministry` (string, opt), `status`, `reviewNote`.
  - `workflow.ts`: `status` string radio, `initialValue: "draft"`; `reviewNote` required
    only when `rejected`.
- **`sanity/lib/queries.ts`** — public queries and the shapes the frontend expects:
  - library: `files[]{ _key, title, "asset": asset->{_id, url, originalFilename, extension,
    mimeType, size} }` → files must be real uploaded assets, not bare objects.
  - announcements: `status == "published" && (!defined(expiresAt) || expiresAt > now())`.
  - events: `status == "published" && coalesce(endsAt, startsAt) >= now()`, order `startsAt asc`.
- **`app/(site)/sermons/page.tsx`** — renders `speaker · date · series`; `dynamic = "force-dynamic"`.
- **`app/api/dev/content-selfcheck/route.ts`** — asserts every public item is `published`,
  reports `public` counts + `reviewQueue.byType`.
- **`.env.local`** — has `NEXT_PUBLIC_SANITY_{PROJECT_ID,DATASET}` (`vkg66kal` / `production`)
  and Clerk keys. **No `SANITY_API_READ_TOKEN`** → `/sermons` and the self-check currently
  throw; seeding and its verification must not depend on that token.
- **`sanity debug --secrets`** (from `studio/`) — the Sanity CLI is already authenticated as
  this user with role `administrator` on `vkg66kal` / `production`. `@sanity/client@7.26.2` is
  in `studio/node_modules`.
- **`tsconfig.json`** excludes `"studio"`; **`eslint.config.mjs`** ignores `"studio/**"` →
  a script under `studio/` cannot affect web `tsc` / `lint` / `build`.
- **`studio/tsconfig.json`** — `include: ["**/*.ts"]`, no `@types/node`.

## Key design decisions

### D1 — Write via `sanity exec … --with-user-token`, reusing the existing CLI auth
New script `studio/scripts/seed.ts`, run from `studio/` as
`npx sanity exec scripts/seed.ts --with-user-token`. It gets a write-capable client from
`getCliClient({apiVersion: "2026-08-29"})` (`sanity/cli`), which reads `projectId` / `dataset`
from `sanity.cli.ts` and the token from the logged-in CLI user. **No new token, nothing
secret added to the repo or `.env`.** Add `"seed": "sanity exec scripts/seed.ts --with-user-token"`
to `studio/package.json`.

### D2 — Deterministic seed IDs + `createOrReplace` (deliberate deviation)
Each document gets a stable single-segment `_id`: `seed-sermon-<slug>`, `seed-library-<slug>`,
`seed-announcement-<slug>`, `seed-event-<slug>` (hyphens, not dots — a dot in an `_id` starts a
path segment and a public dataset only grants anonymous read to single-segment `_id in
path("*")`). The script uses `createOrReplace` so a
re-run overwrites in place — no duplicates, no pre-query needed. `migration.md` prefers
Sanity-generated IDs; that rule targets real migrations whose docs later get edited and
cross-referenced. This is repeatable demo/fixture data: stable IDs make it idempotent,
greppable, and removable in one line:
`npx sanity documents query '*[string::startsWith(_id,"seed-")]._id' | … delete`, or
`sanity exec` a 3-line delete. Documented in `studio/scripts/README.md`.
IDs are **not** `drafts.`-prefixed → they are real published documents.

### D3 — Every doc `status: "published"`
The point of the seed is populated public pages. All 53 docs carry `status: "published"`.
(The workflow states themselves are already exercised by the manual steps in
`prompts/sanity-content-model.md`; this prompt is not about the review queue.)

### D4 — Library files are generated PDFs, uploaded as real assets
The script builds a minimal but **valid** one-page PDF per file in-memory
(`makePdf(title, lines[])` — assembles objects with a correct `xref` table), uploads each via
`client.assets.upload("file", buffer, { filename, contentType: "application/pdf" })`, and
references the returned `asset._id` in `files[]` members (`{_key, _type:"file", title,
asset:{_type:"reference", _ref}}`). Every library item gets 1 file; ~3 get 2 (e.g. "Notes" +
"Slides (PDF)"). **No real `.pptx`** — a spec-valid PowerPoint file is disproportionate for
seed data; "slide" resources ship as PDF exports and are labelled as such. Filenames use
`.pdf` so `extension` / `mimeType` / `size` resolve correctly for the frontend.

### D5 — Body shapes
- `sermonPost.body`: hand-built Portable Text — 4–7 blocks per sermon (`normal` intro, a
  couple of `h2` headings, `normal` paragraphs, one `blockquote` scripture). Every block has
  `_key`, `markDefs: []`; every span has `_key`, `marks: []`.
- `announcement.body`, `event.description`: plain strings (schema type `text`).

### D6 — No images
`coverImage` / `image` are omitted on every doc. §12 requires graceful degradation when a
field is empty, and the public pages already handle a missing image. Avoids committing binary
image fixtures; can be added in a follow-up.

### D7 — Dates use West Africa Time (WAT, `+01:00`, no DST) — stated assumption
Today is 2026-08-29. Events: 13 dated `2026-09-04` … `2027-01-18` (all future → all appear on
the upcoming-events page), plus **one** past event (`2026-07-14`, "Summer VBS 2026") so the
`coalesce(endsAt, startsAt) >= now()` filter is visibly exercised. Evening events at
`T19:00:00+01:00`, Sunday events at `T09:30:00+01:00`. Multi-day events (gospel meeting nights,
youth retreat) set `endsAt`. Announcement `expiresAt`: ~half set 3–10 weeks out (all future →
all appear), the rest omitted. (Updated from US Central at the user's request, 2026-08-29.)

### D8a — `mediaUrl` on four sermons (added 2026-08-29 for the sermons-pages work)
Four of the 13 sermons carry a plausible-but-fictional `https://youtube.com/…` `mediaUrl` so
the sermon-detail "Watch on YouTube" button is exercised in the demo. Clearly example data per
DESIGN-SYSTEM.md §17.

### D8 — Speakers / series / ministries are plain string labels (matches schema D4)
- Speakers: `Michael Alexander` (pulpit minister), `David Coleman` (associate minister),
  `James Whitfield` (elder), `Robert Nguyen` (gospel-meeting guest).
- Series: `Back to the Bible`, `The New Testament Church`, `Gospel Meeting 2026`, or none.
- Ministry / category labels: `Bible Class`, `Evangelism`, `Worship`, `Family`, `Youth`,
  `Leadership`, `Benevolence`.

### D9 — `@types/node` added to `studio/` devDependencies
`scripts/seed.ts` uses `Buffer` / `process`. `sanity exec` runs via esbuild (no typecheck),
but adding `@types/node` keeps the file clean for editors and any future `studio` typecheck.
Isolated to `studio/package.json`; the web workspace is untouched.

## Content plan (titles — full copy written at implementation)

**Sermons (13)** — book·chapter·verse, Restoration themes:
1. The Pattern of New Testament Worship — *The New Testament Church*
2. Why We Sing Without Instruments — *The New Testament Church*
3. The Lord's Supper Every First Day of the Week — *The New Testament Church*
4. Baptism for the Remission of Sins (Acts 2:38) — *Back to the Bible*
5. The Church You Read About in the Bible (Matthew 16:18) — *The New Testament Church*
6. Speak Where the Bible Speaks, Be Silent Where It Is Silent — *Back to the Bible*
7. Giving as We Have Been Prospered (1 Corinthians 16:2)
8. The All-Sufficiency of Scripture (2 Timothy 3:16–17) — *Back to the Bible*
9. Elders, Deacons, and the Work of the Local Church (1 Timothy 3)
10. Saved by Grace Through an Obedient Faith (Ephesians 2:8–10)
11. Neither Catholic nor Protestant: The Undenominational Church
12. Restoring First-Century Christianity — *Back to the Bible*
13. Let Us Draw Near: A Study of Hebrews 10 — *Gospel Meeting 2026* (Robert Nguyen)

**Library items (13)** — category in parens:
1. New Members Class — Study Booklet (Bible Class)
2. Personal Evangelism: Conducting an Open-Bible Study (Evangelism) — Notes + Slides (PDF)
3. Song Leading Basics for A Cappella Worship (Worship) — Notes + Slides (PDF)
4. Adult Auditorium Bible Class Curriculum — Fall Quarter (Bible Class)
5. The Scheme of Redemption — Chart Study (Bible Class)
6. Marriage and the Christian Home — Workbook (Family)
7. Examining Denominational Doctrines — Handout Set (Evangelism)
8. How to Study the Bible — A Primer on Interpretation (Bible Class)
9. Lads to Leaders / Leaderettes — Preparation Guide (Youth)
10. Benevolence and the Deacons' Work — Guidelines (Leadership)
11. Gospel Meeting 2026 — Sermon Outlines (Evangelism)
12. Vacation Bible School 2026 — Teacher Lesson Plans (Youth) — 2 files
13. Wednesday Auditorium Class — Notes on the Book of Acts (Bible Class)

**Announcements (13):**
1. Gospel Meeting with Robert Nguyen — September 21–24
2. Fall Bible Class Quarter Begins September 7
3. Ladies' Bible Class Resumes Tuesday Mornings
4. Fifth Sunday Singing and Fellowship Meal
5. Area-Wide Youth Devotional This Friday
6. Building Fund — Contribution Update
7. Pictorial Directory Photos Being Updated
8. New Wednesday Evening Series: The Book of Acts
9. Benevolence Pantry Collection This Month
10. Men's Business Meeting — First Monday
11. Nursing Home Singing — Volunteers Needed
12. Vacation Bible School Registration Now Open
13. Prayer List and Sympathy Update

**Events (14):**
1. Summer VBS 2026 (Family) — **past**, 2026-07-14 → 07-16
2. Area-Wide Youth Devotional — 2026-09-04
3. Congregational Singing Night — 2026-09-13
4. Senior Saints Fellowship Luncheon — 2026-09-18
5. Gospel Meeting — Night 1 (Evangelism) — 2026-09-21
6. Gospel Meeting — Night 2 — 2026-09-22
7. Gospel Meeting — Night 3 — 2026-09-23
8. Gospel Meeting — Night 4 — 2026-09-24
9. Newcomers' Dinner — 2026-09-27
10. Men's Leadership Training Workshop (Leadership) — 2026-10-03
11. Friends and Family Day — 2026-10-25
12. Ladies' Day: "Rooted in Christ" (Family) — 2026-11-07
13. Thanksgiving Eve Devotional and Pie Fellowship — 2026-11-25
14. Winter Youth Retreat (Youth) — 2027-01-16 → 01-18

## Files to touch
- **New** `studio/scripts/seed.ts` — the seed script (all content inline; `makePdf` helper;
  `createOrReplace` loop; prints a per-type created count and a post-write verification query).
- **New** `studio/scripts/unseed.ts` — deletes every `seed-*` document.
- **New** `studio/scripts/README.md` — how to run, the timezone assumption, and the removal command.
- **Edit** `studio/package.json` — add `"seed"` / `"unseed"` scripts; add `@types/node` to `devDependencies`.
- No schema changes. No `.env` changes.

### Follow-up during verification (beyond original scope) — public dataset
Verifying the web read path exposed that `next-sanity` `sanityFetch` never sends a token for the
`published` perspective (it assumes published content is world-readable), so on a private
dataset every public helper returned **zero rows**. The user's decision (2026-08-29): **make the
dataset public** and lift the AGENTS.md prohibition. Resulting changes:
- **Dataset** `production` set to `aclMode: public` (`sanity dataset visibility set production
  public`). Published sermons / library items / announcements / events are now anonymously
  readable via CDN; drafts/versions stay private (excluded from the anonymous-read ACL).
- **Seed ids are hyphenated, not dotted** (`seed-sermon-<slug>`, not `seed.sermon.<slug>`). A
  dot starts a new `_id` path segment and a public dataset only grants anonymous read to
  `_id in path("*")` (single segment) — dotted ids were invisible to logged-out visitors.
  `unseed.ts` / README / the verification query use `string::startsWith(_id, "seed-")`.
- **`sanity/lib/publicContent.ts`** keeps using `sanityFetch` (no token needed now; caching +
  live revalidation via `<SanityLive/>` for free). The interim `publicClient.ts` workaround was
  removed.
- **AGENTS.md** §5 and §6 edited: a public Sanity dataset is now explicitly allowed for
  published CMS content; draft/in-review reads stay server-only + tokened + role-gated.

## Requirements
- All 53 docs: `status: "published"`, single-segment hyphenated `_id`
  (`seed-<type>-<slug>`), required fields populated, no schema validation violations
  (`endsAt` after `startsAt`; `files` non-empty).
- `libraryItem.files[]` reference **real uploaded assets** — after seeding, the library query's
  `asset->{originalFilename, extension, mimeType, size, url}` must resolve for every item.
- `sermonPost.body` is valid Portable Text (keyed blocks + spans, `markDefs: []`).
- Script is **idempotent**: a second run replaces the same 53 IDs, uploads assets again but
  produces no duplicate documents, exits 0.
- Script pulls its token only from `--with-user-token` / the CLI session — no token literal in
  the file, no `NEXT_PUBLIC_*`, nothing written to `.env*`.
- Content is recognizably **Church of Christ**: a cappella worship, weekly Lord's Supper on the
  first day of the week, baptism for the remission of sins, autonomous local congregation with
  elders and deacons, gospel meeting, "book, chapter, and verse", undenominational identity,
  Lads to Leaders, fifth-Sunday singing. No denominational structures (no pastor-as-CEO, no
  diocese, no instrumental praise band).
- `studio/` stays excluded from web `tsc` / `lint` / `build`.

## Security / access-control considerations
- Uses the existing authenticated Sanity CLI session (role `administrator`); no token is
  created, printed, or committed. `--with-user-token` scopes the token to the exec process.
- Writes only to `_type in ["sermonPost","libraryItem","announcement","event"]` — the content
  store. Touches no Postgres / Clerk / attendance / schedule data (none exists yet, and none
  belongs in Sanity per §13).
- All seeded docs are `published` and public by design — no draft/in-review data is created,
  so there is no risk of the seed leaking non-public content.
- The dev self-check route stays dev-only (404 in production); seeding does not change its
  gating.

## Acceptance criteria
1. `cd studio && npx sanity exec scripts/seed.ts --with-user-token` completes with exit 0 and
   prints `sermonPost: 13, libraryItem: 13, announcement: 13, event: 14` (created/replaced).
2. Re-running the command a second time still exits 0 and the dataset still has exactly
   13 / 13 / 13 / 14 `seed-*` docs of each type (no duplicates).
3. `npx sanity documents query 'count(*[_type=="sermonPost" && status=="published"])'` (and the
   other three types) each return ≥ 10; `count(*[string::startsWith(_id,"seed-")])`
   returns 53.
4. `npx sanity documents query '*[_type=="libraryItem" && string::startsWith(_id,"seed-")]{ "files": files[]{ "f": asset->{originalFilename, extension, size} } }'`
   shows every item with ≥ 1 file whose `extension == "pdf"` and `size > 0`.
5. In the Studio (`npm run dev` → :3333): Sermons / Library / Announcements / Events panes each
   list the seeded published docs; opening a sermon shows a rendered Portable Text body; opening
   a library item shows downloadable file(s).
6. Web checks unaffected: `npx tsc --noEmit`, `npm run lint`, `npm run build` still pass from
   the repo root.
7. If `SANITY_API_READ_TOKEN` (Viewer) is present in `.env.local`: logged-out
   `GET /api/dev/content-selfcheck` returns `public` counts of `sermons ≥ 13`,
   `libraryItems ≥ 13`, `announcements ≥ 13`, `events ≥ 13` (past VBS excluded), HTTP 200; and
   `GET /sermons` lists the 13 sermons. If the token is absent, this step is reported as
   skipped (seed already verified by 3–4).
8. `studio/scripts/README.md` documents the removal command and it works:
   after running it, `count(*[string::startsWith(_id,"seed-")])` returns 0.

## Checks to run (report real output)
- `cd studio && npm install` (picks up `@types/node` + the `seed` script).
- `cd studio && npx sanity exec scripts/seed.ts --with-user-token` — capture the summary.
- `cd studio && npx sanity documents query 'count(*[_type=="sermonPost" && status=="published"])'`
  and the same for `libraryItem`, `announcement`, `event`; plus the `files` query from AC 4.
- `cd studio && npx sanity exec scripts/seed.ts --with-user-token` a second time — confirm counts
  unchanged.
- repo root: `npx tsc --noEmit`; `npm run lint`; `npm run build`.
- If a read token exists: `npm run dev`, then
  `curl -s localhost:3000/api/dev/content-selfcheck | jq` and open `/sermons`.

## Manual test steps
1. `cd studio && npm install && npx sanity exec scripts/seed.ts --with-user-token`. Read the
   printed per-type summary.
2. `npm run dev` (from `studio/`) → http://localhost:3333. Check each of the four panes lists
   the seeded items. Open one sermon → body renders as formatted text. Open one library item →
   at least one PDF is attached and downloads.
3. Run the four `count(...)` queries above → each ≥ 10; run the `files` query → every library
   item has a real PDF asset.
4. Re-run the `sanity exec` command → summary identical, no duplicate docs in the Studio panes.
5. (If `SANITY_API_READ_TOKEN` is set) `cd ..` && `npm run dev`; logged out, open
   `http://localhost:3000/sermons` → 13 sermons listed; `curl -s localhost:3000/api/dev/content-selfcheck | jq`
   → published counts ≥ 13 for sermons/library/announcements, events = 13 (past VBS excluded),
   `ok: true`.
6. Cleanup check: follow `studio/scripts/README.md` to delete `seed-*`, then
   `npx sanity documents query 'count(*[string::startsWith(_id,"seed-")])'` → `0`. (Optional — only to
   prove the removal path; re-seed afterwards if the sample data should stay.)

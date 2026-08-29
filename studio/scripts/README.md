# Studio scripts

Utility scripts run through the Sanity CLI (`sanity exec`), using the logged-in
user's token (`--with-user-token`) — no separate token or `.env` entry needed.
Make sure you're authenticated first: `npx sanity login`.

## Seed sample content

```bash
cd studio
npm run seed        # = sanity exec scripts/seed.ts --with-user-token
```

Creates published sample content for The Church of Christ, Evueta:

| Type          | Count | Notes                                                        |
| ------------- | ----- | ----------------------------------------------------------- |
| `sermonPost`  | 13    | Portable Text bodies; one future-dated (gospel meeting)     |
| `libraryItem` | 13    | each with 1–2 real uploaded PDF assets                      |
| `announcement`| 13    | ~half with a future `expiresAt`                             |
| `event`       | 14    | 13 upcoming (Sep 2026 – Jan 2027) + 1 past (Summer VBS)     |

Details:

- Every document uses a stable id (`seed-sermon-<slug>`, `seed-library-<slug>`,
  `seed-announcement-<slug>`, `seed-event-<slug>`) and is written with
  `createOrReplace`, so **re-running is idempotent** — no duplicates.
- All documents are `status: "published"` with real (non-draft) ids, so they
  surface through the app's public read layer.
- The ids are **hyphenated, not dotted**. A dot in a Sanity `_id` starts a new
  path segment, and a public dataset only grants anonymous read to single-segment
  ids (`_id in path("*")`) — a dotted `seed.sermon.x` would be invisible to
  logged-out visitors.
- **Timezone assumption:** all dates are West Africa Time (WAT, `+01:00`, no
  DST). Change the offsets in `seed.ts` if the congregation keeps different local
  time.
- Library PDFs are generated in-memory (minimal one-page documents) and uploaded
  as file assets. "Slide" resources ship as PDF exports — no real `.pptx`.

## Remove sample content

```bash
cd studio
npm run unseed      # = sanity exec scripts/unseed.ts --with-user-token
```

Deletes every `seed-*` document. Uploaded PDF assets are content-addressed and
left in place; remove them from the Studio media view if you want them gone.

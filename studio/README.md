# Shepherd Studio

Standalone Sanity Studio for Shepherd's editorial content: sermons, library items,
announcements, and events, each with a shared approval workflow
(`draft → in_review → published`, or `rejected` with a note).

This Studio is **dev-facing**. Contributors and approvers do their day-to-day work in the
Shepherd admin panel (in the Next.js app), which reads/writes the same dataset through a
server-only, role-gated layer.

## Setup

```bash
cd studio
npm install
cp .env.example .env.local   # fill in project id + dataset (same as the web app)
npm run dev                  # http://localhost:3333
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Local Studio on :3333 |
| `npm run build` | Production build of the Studio bundle |
| `npm run deploy` | Deploy the hosted Studio (`<project>.sanity.studio`) — needs `npx sanity login` |
| `npm run schema:deploy` | Push the schema to the dataset (enables schema-aware tooling / TypeGen) |
| `npm run typegen` | Extract schema + generate TS types |

## Notes

- The web app never imports from this folder. It talks to Sanity through
  `sanity/lib/*` with a server-only `SANITY_API_READ_TOKEN`.
- Nothing relational (members, zones, gatherings, attendance, headcount, schedule) belongs
  here — that is Postgres. See `AGENTS.md` §5 / §13.

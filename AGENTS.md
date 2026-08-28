# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** building **Shepherd**, a production-style church management system: a public website, a member portal, zone-based attendance and headcount tracking, a quarterly worship schedule, a member directory, and a content management system for sermons and resources.

*(Shepherd is a working title — rename it everywhere in this file before you start if the church has a preferred name.)*

Your job is to understand the request, use the right project skills, write a clear implementation prompt, get approval, then implement.

---

# 1. What you are building

Shepherd serves one church, single campus, 200+ members. Six things sit on top of one identity and role system:

1. **A website.** Public pages (service times, about, upcoming events, the worship schedule, contact) plus a gated **member portal** (login required) where members see their own attendance history, their own upcoming worship-schedule assignments, browse sermons and announcements, and download library resources.
2. **An attendance tracker and a headcount tracker — two different things.** The church is divided into **zones**. Each zone has a **zonal leader** who records member-level attendance for their own zone at every gathering their zone is involved in. Zonal leaders and ushers never see or edit another zone's attendance. Separately, **headcount** is an aggregate count (men, women, children, total) with no link to individual members: one designated **headcount recorder** logs it church-wide at every unified gathering, and zonal leaders log it for their own zone at zonal meetings. Admins see everything, aggregated.
3. **A quarterly worship schedule.** For unified services, members are scheduled ahead of time — a quarter at a time — into worship roles: teaching (Sunday School, every week, with a topic), sermon (only on the Sundays the quarter's plan calls for one — not guaranteed weekly), song leading, collection/giving, Lord's Supper, a prayer team (several people, not one), an ushering team (several people, not one), the foundation class, and three separate children's classes (upper, middle, lower), each with its own lesson series. It's browsed as a calendar — a month grid on desktop, a grouped list by month on mobile — where selecting a Sunday opens that date's assignments for entry or editing. It's a public, read-only page, and members also see their own upcoming assignments in the portal.
4. **A member directory.** Every member's contact and personal details — address, phone number(s), birthday (month and day only, no year), gender, marital status, occupation — browsable by other logged-in members. This is portal-only, never public: it holds meaningfully more sensitive data than a name and a sermon list, and gets its own explicit access check rather than riding on the portal's general login gate.
5. **A content management system.** Sermons/teachings are published as blog-style posts. A **library** holds downloadable PDFs and PPTs (teaching notes, slides, handouts). Announcements and upcoming events are also managed content. All of it goes through an **approval workflow** — a contributor submits, an approver publishes. Ministries/departments (e.g. youth, choir, media) own and submit their own content within this workflow.
6. **An admin panel.** A single role-gated hub where authorized users manage membership (add/edit/deactivate members, assign zones/ministries/roles, maintain directory details), build the quarterly worship schedule, review and publish content (sermons, library items, announcements, events), and see church-wide attendance and headcount. It is not a separate app — it's the set of screens a logged-in admin/leader sees that a plain member never does.

You will build the content model, authentication and role-based access, the public site, the member portal, the gathering/attendance/headcount data model and UI, the quarterly worship schedule, the member directory, the CMS with its approval states (sermons, library, announcements, events), the admin panel that ties all of it together, and membership management. Build nothing beyond that. Do not overbuild — no giving, no messaging/SMS, no event RSVP/ticketing, no small-group management, unless the user asks.

---

# 2. How to work

Follow this loop for every request:

1. Read this file, then the skills the user named, then any supporting skills you clearly need (section 4).
2. Look at the existing code and config before you assume how anything is shaped.
3. Ask one focused question only if the task is genuinely ambiguous.
4. Write an implementation prompt in `prompts/` covering the goal, the skills you read, the code you inspected, your decisions and assumptions, the files you expect to touch, the requirements, the security/access-control considerations, the acceptance criteria, the checks to run, and the exact manual test steps.
5. Ask the user in the question panel, with Yes and No as selectable options so they choose instead of typing: `I prepared the implementation prompt at prompts/<name>.md. Is this good to execute?`
6. Once approved, build strictly to that prompt and run the checks (section 14). Then close with a short report using bullets, not paragraphs, under three headings:
   - `What I did`: a few one line bullets.
   - `Test`: numbered steps to run or see.
   - `Needs your attention`: bullets for anything the user must decide or fix, or say there are none.
     Keep every line short. Put detail and rationale in the prompt file, not in this report.

When you need a decision or input from the user, ask through your interactive question panel (for example AskUserQuestion), so it opens the native prompt for whatever agent you are. Use plain text only if you have no such panel.

Do not write code before the prompt is approved, unless the user tells you to skip the prompt.

---

# 3. UI work

If the user gives you design references (images, a live site, a Figma link), reproduce them exactly: layout, spacing, typography, color, and states. If no reference is given, default to a clean, restrained design — this is a church site, not a SaaS marketing page. Avoid dense admin-dashboard aesthetics for anything a member sees.

Everything must work well on a phone first. Most members will check their attendance history, their worship-schedule assignment, or read a sermon post from their phone, not a desktop. Ushers and zonal leaders will often record attendance or headcount from their phone right after a gathering, standing in the foyer — those entry screens especially must be fast and thumb-friendly, not dense data-entry forms.

Do not restyle or improve beyond a given reference. Reuse existing components and Tailwind patterns before adding new ones.

---

# 4. Skills to lean on

Reach for these instead of guessing. Do not invent new ones. (Adjust paths to match what's actually installed — these mirror common skill names; confirm they exist before relying on them.)

- sanity-best-practices (`~/.claude/skills/sanity-best-practices/SKILL.md`), for workspace setup, schema, GROQ, Portable Text, document workflow/approval states, and asset (PDF/PPT) handling.
- sanity-migration (`~/.claude/skills/sanity-migration/SKILL.md`), if importing existing sermon archives or a members list.
- A Prisma/Postgres schema-design skill, if one is installed, for modeling zones, members, gatherings, attendance, headcount, and the worship schedule.
- `node_modules/next/dist/docs/`, for Next.js routing, server/client boundaries, and data fetching.

For `next-sanity`, Portable Text, Tailwind, Clerk, and Prisma, follow the package docs and existing patterns in the repo.

---

# 5. How the app is structured

The project is standalone workspaces in one repo. Do not embed the Studio inside Next.js and do not put attendance/headcount/schedule/member data inside Sanity — keeping content and transactional data apart is what keeps access control simple and correct.

- A **Studio** workspace holds the Sanity schema and content authoring — sermons, library resources, announcements, events, and their approval states. Nothing else lives here.
- A **web** workspace holds the Next.js public site, member portal, admin/zonal-leader dashboards, and all server-side integration.
- A **database** (Postgres via Prisma) holds members, zones, zonal-leader assignments, ministries, gatherings, attendance records, headcount records, and worship-schedule assignments. This is relational, transactional data — it does not belong in the content store.

Inside web, keep these responsibilities apart:

- Public pages (home, about, service times, the worship schedule, published sermon posts, public library items if any) are read only and ungated.
- The **member portal** is gated by Clerk. It shows a member's own attendance history, their own upcoming worship-schedule assignments, and any member-only content.
- **Auth is Clerk**, wired through Next.js middleware. It carries the role(s) a user has — member, usher, zonal leader, headcount recorder, schedule coordinator, ministry contributor, content approver, admin — and which zone(s)/ministry(ies) they're scoped to. The secret key stays server-side; only the publishable key reaches the browser.
- **Attendance write access is server-only and zone-scoped.** A zonal leader's or usher's session can only write attendance rows for the zone(s) they're assigned to. This check happens on the server on every write, never trusted from the client.
- **Headcount write access is scoped by gathering type, not always by zone.** The headcount recorder role can write headcount for unified gatherings (services, prayer meetings) church-wide — there's no zone on that kind of headcount. A zonal leader can write headcount only for their own zone's zonal meetings. Enforce both checks server-side.
- **Worship-schedule write access belongs to the schedule coordinator role** (or an admin). No other role edits it. Members have read access to the whole public schedule and read access to their own assignments; they never write to it.
- **The member directory is gated separately from "logged in," even though every logged-in member can see it.** It carries meaningfully more sensitive data (address, phone, birthday, marital status) than anything else a member sees, so its route/query gets its own explicit access check — don't let it inherit access just because it happens to live under the same portal layout as lower-sensitivity pages.
- **Content write access is server-only and workflow-gated.** A contributor can create/edit drafts in their own ministry; only an approver role can move a document to published. Enforce this in the CMS workflow, not just in the UI.
- The CMS read layer is a server-only Sanity client and fetch helper for published content; draft/in-review content is only ever fetched for users with the relevant role.
- The **admin panel** is not a separate workspace — it's a set of routes in web, gated per-screen by role: membership management, church-wide attendance/headcount, and the schedule builder require an admin/coordinator role and hit the Postgres layer; the content review queue (sermons, library, announcements, events) requires a contributor/approver role and hits Sanity. A user only sees the sub-sections their roles grant — don't build one flat "admin" gate that's all-or-nothing.
- **Membership management writes go through a server route into Postgres**, and, when it invites a new member with portal access, also create the corresponding Clerk user/invite server-side. The browser never talks to Clerk's admin API or Postgres directly.

Never cross these boundaries. The browser holds no token, never writes attendance, headcount, schedule, or content directly, and never sees another zone's or another member's data.

---

# 6. Tech stack

Use Next.js (App Router), Clerk for authentication and role/zone-scoped access, Sanity Studio with `next-sanity`, `@sanity/image-url`, and `@portabletext/react` for the CMS (sermons as blog documents, library items as file-asset documents, both with a draft → in review → published workflow), PostgreSQL with Prisma for members, zones, zonal-leader assignments, ministries, gatherings, attendance records, headcount records, and worship-schedule assignments, Tailwind CSS, and TypeScript.

Do not use a public Sanity dataset, a client-side Sanity or Postgres token, an embedded Studio, or a separate backend framework. Do not model attendance, headcount, schedule, or membership data as Sanity documents — see section 13 for why.

If the user wants email/SMS notifications, giving, or event RSVPs later, treat those as separate, explicitly scoped requests — do not pull them in speculatively.

---

# 7. Decisions already made for you

Build to these unless the user changes them. They exist because access control and data integrity depend on them.

- **Zones and ministries are separate structures.** A zone is where a member is counted for attendance, led by a zonal leader. A ministry/department (youth, choir, media, ushering, etc.) is who owns and submits CMS content. A member can belong to one zone and any number of ministries. Confirm this split with the user before building if it doesn't match how the church actually organizes itself.
- **There are three kinds of gathering.** A **unified service** is church-wide, on Sundays, Wednesdays, and any other day the church agrees on — no fixed single recurrence rule, just a pattern with exceptions. A **prayer meeting** is also church-wide, on the last Thursday of every month. A **zonal meeting** belongs to exactly one zone, and has no fixed schedule at all — each zonal leader chooses when and where to hold theirs. Model these as one Gathering shape with a `scope` (`church_wide` or `zonal`) and a `kind` label, not three separate tables — see section 8.
- **Unified services and prayer meetings are predictable enough to pre-create ahead of time** (weekly Sundays/Wednesdays, monthly last-Thursday), which is also what the quarterly worship schedule needs to attach assignments to. **Zonal meetings are not** — don't build a recurrence/auto-generation engine for them; a zonal leader creates one whenever they decide to hold it.
- **Attendance is recorded manually** by an usher or the zonal leader, at whichever gatherings their zone is involved in (unified services, prayer meetings, and their own zonal meetings) — not self check-in. Build for that: a fast, zone-scoped entry screen listing that zone's members with a present/absent toggle (plus a way to add a visitor/first-timer on the spot), submitted once per gathering per zone.
- **Headcount is a separate data type from attendance — an aggregate count, not per-member.** It captures men, women, children, and a total for a gathering, with no link to individual member records. Don't try to reconcile a headcount total against attendance record counts; they can legitimately differ (children not on the member list, first-timers, etc.).
- **Headcount recording has its own two-tier access, mirroring the gathering split.** A single **headcount recorder** role logs the men/women/children/total headcount for every unified gathering (service or prayer meeting), church-wide — this is one person's job, not zone-scoped. **Zonal leaders** log headcount for their own zone's zonal meetings, the same way they log attendance for it.
- **A zonal leader's access is scoped to their own zone(s).** They can view and edit only their zone's attendance and headcount, past and present. They cannot see other zones' numbers or names.
- **Admins see everything, aggregated.** Church-wide attendance and headcount dashboards (by zone, by gathering, over time) are an admin-only view.
- **The quarterly worship schedule covers unified services only** (not prayer meetings, not zonal meetings) — confirm with the user if prayer meetings should also get a schedule, since roles like ushering and translation may still apply there.
- **One schedule coordinator role builds the schedule**, a quarter at a time, assigning a member to each worship role for each unified-service date in that quarter. Confirm with the user if this should instead be split per ministry (ushers assign ushers, children's ministry assigns class teachers, etc.) as the church grows.
- **The worship-role list is a small admin-editable table, not a hardcoded enum** — start with teaching (Sunday School), sermon, song leading, collection/giving, Lord's Supper, prayer, ushering, the foundation class, and three named children's classes (upper, middle, lower) — but let an admin add, rename, or retire roles without a code change.
- **Sermon is optional per Sunday, distinct from teaching.** Teaching (Sunday School) happens every week and always has a topic; sermon only happens on the Sundays the quarter's plan calls for one. Don't force a sermon assignment on every date — a Sunday with no sermon simply has no sermon row, not a "TBD" placeholder.
- **Some roles take more than one person on the same date** — prayer and ushering are the clearest examples (a small team, not a single name). Model this as multiple ScheduleAssignment rows sharing the same role and gathering, one per person, rather than trying to cram several names into one row.
- **The schedule is browsed as a calendar, not a flat table.** On desktop, show the quarter as month grids with each Sunday marked (and flagged if it has a sermon); tapping a date opens a manual-entry panel for that Sunday's roles. On mobile, the same dates work better as a list grouped by month rather than a cramped 7-column grid — same underlying data, a different browsing layout for the smaller screen.
- **Quarterly teaching topics and teachers often originate outside the app** — churches frequently already prepare a lesson-plan document (e.g. a PDF) each quarter. Don't build a document-import feature speculatively; treat it as a separate, explicitly-scoped request if the user asks for it. Until then, the schedule coordinator re-enters each date's teaching/foundation-class/children's-class details manually from whatever source the church already uses.
- **Only some roles carry extra detail**: teaching carries a topic; each children's class and the foundation class carries a lesson series. Model this as one optional text field on the assignment, used only where it applies — don't add a separate column per role.
- **The schedule is admin-managed only, no self-service swaps**, unless the user asks for a swap/decline flow later.
- **The member directory is visible to any logged-in member by default, not just admins.** Confirm with the user if certain fields — address in particular — should be restricted to admins/zonal leaders instead of shown peer-to-peer, since not every church wants full home addresses visible to the whole membership.
- **Birthdays are stored as month and day only, with no year field** — matching the request exactly. Flag to the user if an age-based feature comes up later (children's-class assignment by age, milestone birthdays), since that would need a year after all and is a deliberate gap right now, not an oversight.
- **Members can have more than one phone number.** Model it as a small list (each with an optional label like "mobile" or "home"), not a single field.
- **Directory fields are edited by an admin through membership management**, not self-service by the member, unless the user asks for member self-edit later.
- **Content goes through an approval workflow**: draft → submitted for review → approved & published, or sent back with a note. A ministry contributor can create and edit their own drafts; only a designated approver (ministry lead or church admin) can publish. Never let a contributor publish directly.
- **Sermons/teachings are blog posts**: title, date, speaker, series (optional), a cover image, Portable Text body, and an optional linked audio/video. They render as a public-facing blog once published, newest first, filterable by series/speaker.
- **The library holds downloadable files**, primarily PDFs and PPTs — teaching notes, slide decks, handouts. Each library item has a title, description, a ministry/category tag, and one or more downloadable file assets. Default to public unless the user says library items should be member-only.
- **The website has two tiers**: public pages need no login; the member portal (attendance history, own schedule assignments, member-only content if any) is gated by Clerk.
- **Announcements** are short, often time-sensitive, so they skip the full review cycle by default — a ministry lead or admin can publish one directly. They still carry a status field and an optional expiry date/time; an expired announcement stops showing on the site and portal without needing to be manually unpublished. Confirm with the user if they'd rather announcements go through the same review queue as sermons.
- **The upcoming events page** lists Event content (title, date/time, location, description, optional image) sorted chronologically, showing only events whose date is today or later. Past events simply age out of the list — do not build an RSVP or ticketing flow unless asked.
- **"Blog management" is the sermon/teaching content type from section 7–8**, managed through the same admin review queue as everything else in the CMS — there isn't a second, separate blog system.
- **Membership management lives in the admin panel, not the CMS.** Admins can add a member, edit their details, assign or change their zone, add/remove ministry memberships, grant or revoke roles (usher, zonal leader, headcount recorder, schedule coordinator, contributor, approver, admin), and deactivate a member. This is Postgres data — see section 8 — surfaced through admin-only, non-public screens.
- **Roles**: Member (portal access, no write access) → Usher (attendance entry for an assigned zone) → Zonal Leader (attendance + headcount entry for their zone, across unified gatherings and their own zonal meetings) → Headcount Recorder (headcount entry for unified gatherings, church-wide — a standalone role) → Schedule Coordinator (builds the quarterly worship schedule) → Ministry Contributor (drafts content for their ministry) → Content Approver (publishes content) → Admin (everything, church-wide, including membership management). A person can hold more than one role — e.g. someone might be both a zonal leader and the schedule coordinator.

---

# 8. The data you are modeling

## Relational (Postgres / Prisma)

- A **Member** has a name, one or more phone numbers (each optionally labeled), an address, a birth month and day (no year — see section 7), gender, marital status, occupation, an optional Clerk user id (members without portal access can still exist as attendance records), a zone reference, and any ministry memberships.
- A **Zone** has a name/label, an optional default meeting location (used as a suggestion when a zonal leader schedules a zonal meeting, overridable per meeting), and a list of members. A **ZoneLeader** assignment links a Member (or Clerk user) to a Zone with leader permissions; a zone can have more than one leader.
- A **Ministry** has a name and a list of members/contributors.
- A **Gathering** is a dated event that attendance, headcount, and/or a schedule are recorded against. It has a `scope` (`church_wide` or `zonal`), a `kind` label (e.g. "Sunday Service", "Wednesday Service", "Prayer Meeting", "Zonal Meeting", or any other agreed label — keep this a free label, not a rigid enum, since the church may add ad hoc special-service days), a date/time, an optional location, and, when `scope` is `zonal`, a required Zone reference. Model it as one table with these fields, not separate tables per kind.
- An **AttendanceRecord** ties a Gathering, a Zone, and a Member (or a lightweight visitor/first-timer entry) to a present/absent status, plus who recorded it and when. A visitor entry also carries an optional home church (if they already attend elsewhere) and which Member invited them — the admin dashboard surfaces these as a "recent visitors" view. One submission per zone per gathering is the norm — decide with the user whether edits after submission are allowed and by whom.
- A **HeadcountRecord** ties a Gathering to a `menCount`, `womenCount`, `childrenCount`, and `totalCount`, plus who recorded it and when. For a `church_wide` gathering it has no zone (one count for the whole gathering); for a `zonal` gathering it belongs to that gathering's zone. It has no link to individual Member rows — it's a pure aggregate, kept separate from AttendanceRecord.
- A **WorshipRole** is an admin-editable lookup: a label (e.g. "Teaching", "Sermon", "Prayer", "Ushering", "Upper Children's Class"), a flag for whether it takes the optional topic/lesson-series detail, and a flag for whether it's a fixed weekly role (teaching) or an occasional one that doesn't apply to every date (sermon).
- A **ScheduleAssignment** ties a unified-service Gathering, a WorshipRole, and a Member, plus an optional `topicOrSeries` text field (used for teaching's topic and each children's/foundation class's lesson series), and who created/last edited it. A role can have more than one assignment for the same gathering (e.g. three separate rows for the prayer team, five for ushering) — that's normal, not a data error. A role can also be left unassigned for a given date, rendered as "TBD"; an occasional role like sermon simply has no row at all on a date it doesn't apply.

## Content (Sanity)

- A **SermonPost** has a title/slug, date, speaker (reference or free text), optional series, cover image, Portable Text body, optional audio/video link, the owning ministry, and a workflow status.
- A **LibraryItem** has a title, description, category/ministry tag, one or more file assets (PDF/PPT), and a workflow status.
- An **Announcement** has a title, body, an optional image, an optional expiry date/time, and a workflow status. Unlike sermons and library items, it can go straight to `published` (see section 7).
- An **Event** has a title, description, a date/time (start, and optional end), a location (text is enough unless the user wants a map), an optional image, the owning ministry, and a workflow status.
- All four content types share the same **workflow status** field: `draft`, `in_review`, `published`, or `rejected` (with a reviewer note). Do not invent a different shape per content type — the admin review queue should be able to list items from all of them the same way.

Keep the Sanity schema free of anything relational (members, zones, gatherings, attendance, headcount, schedule) — that lives in Postgres, referenced by Clerk user id where the two systems need to meet (e.g. "which ministries can this logged-in user submit content for").

---

# 9. How attendance and headcount recording work

This is the highest-friction, most-used flow in the app, so it needs to be fast, not exhaustive.

- A zonal leader or usher logs in, lands on their zone's attendance entry for the current/most recent gathering their zone is involved in (not a menu they have to dig through).
- The list is their zone's members, defaulting to whatever makes sense (e.g. all unmarked, or carried over from last time) — confirm the default with the user rather than guessing.
- Present/absent is a single tap per member. Adding a visitor or first-timer who isn't in the member list yet is a lightweight inline action, not a separate flow.
- Submission is explicit ("Submit attendance for [Zone] — [Gathering]"), and once submitted, decide with the user whether it locks or stays editable, and by whom (the recorder, the zonal leader, or only an admin).
- Headcount entry is its own short form — four numbers (men, women, children, total) against a gathering, no member list involved. The headcount recorder sees unified gatherings needing a count; a zonal leader sees the same short form for their own zonal meetings.
- Aggregation (zone totals, church-wide totals, trends over time, attendance vs. headcount side by side) is computed from these records for admin dashboards — never store a separately-maintained total that can drift from the underlying records.

---

# 10. The content approval workflow

- A ministry contributor creates a SermonPost or LibraryItem as `draft`, edits freely, then moves it to `in_review` when ready.
- An approver (scoped to that ministry, or a church-wide admin) sees a review queue of `in_review` items, and either publishes (`published`) or sends it back (`rejected`, with a note the contributor can see).
- Only `published` content appears on the public site and in the member portal. `draft`, `in_review`, and `rejected` items are visible only to the contributor and approvers for that ministry, never fetched into a public page.
- Enforce this server-side in whatever fetches content for a page — a public route must filter to `published` regardless of what the client asks for.

---

# 11. The quarterly worship schedule

- The schedule coordinator (or admin) builds the schedule a quarter at a time: pre-create the quarter's unified-service Gathering dates (Sundays, Wednesdays, other agreed days), then assign a Member to each WorshipRole for each date.
- **Browse it as a calendar, not a flat table.** On desktop, show the quarter as three month grids (or however many months the quarter spans), each Sunday marked with a short label of that date's teaching topic, and flagged separately if a sermon is happening that date. Selecting a date opens a manual-entry panel below or beside the calendar for that Sunday's full set of roles. On mobile, replace the month grid with a list of Sundays grouped under a month heading — same data, easier to tap and read on a narrow screen than a squeezed 7-column grid.
- Teaching's assignment carries a topic; each children's class and the foundation class carries a lesson series — both stored in the same optional `topicOrSeries` field on the assignment, shown only for the roles that use it.
- A single-person role can be left unassigned; render that clearly ("TBD") rather than a blank space that reads as a bug. A multi-person role (prayer, ushering) shows however many of its slots are filled and however many are still open — e.g. "3 of 3 assigned" vs "2 of 5 assigned" — rather than a single TBD for the whole role.
- Sermon doesn't appear at all on a date the quarter's plan doesn't call for one — the manual-entry panel for that date simply omits the sermon field rather than showing it unassigned.
- The **public schedule page** needs no login. Organize it by date (the same calendar-first browsing pattern), showing every role and who's assigned (or TBD, or the open-slot count for multi-person roles) for that date, including the topic/lesson-series detail where set.
- The **member portal** shows a member their own upcoming assignments only — every ScheduleAssignment where they're the assigned Member, filtered to today or later — pulled with the same server-side filtering discipline as attendance and headcount (a member's client should never receive anyone else's assignments to filter client-side).
- No self-service swap or decline flow by default (section 7) — the coordinator edits assignments directly if something changes.

---

# 12. How the site and portal must behave

- Public pages (home, service times, the worship schedule, published sermons, library if public) need no login and load fast — this is often a visitor's first impression of the church.
- The member portal requires login and shows: the member's own attendance history (not anyone else's), their own upcoming worship-schedule assignments, and any member-only content if the user wants that distinction.
- The sermon blog is chronological, newest first, with filters for series/speaker once there's enough content to need them. Each post shows speaker, date, and links any attached audio/video — do not build a custom media player; embed or link to it.
- The library is browsable by category/ministry, with a clear file type and size shown before download. Downloads are direct links to the stored asset — no login wall unless the user asked for member-only library access.
- **Announcements** show on the homepage and/or portal (confirm which with the user) as a short list or banner, filtered server-side to `published` and not yet expired. Don't rely on the client to hide an expired one.
- **The events page** shows only `published` events with a date today or later, soonest first. Once an event's date has passed, it drops off this page automatically — don't require someone to manually archive it.
- Nothing in the CMS or portal invents data. If a field is empty (no speaker photo, no series, no schedule assignment yet), degrade gracefully rather than showing a placeholder that looks like real content.
- **The member directory** is browsable and searchable (by name, at minimum) from the portal, gated to logged-in members. Show a clean fallback for any field a member hasn't filled in (no phone on file, birthday not set, etc.) rather than a blank-looking row that reads as broken.

---

# 13. Things that will trip you up

- **Don't model attendance, headcount, schedule, or membership in Sanity.** It's tempting since the CMS is already there, but relational integrity (a zone has many members, a gathering has many attendance records, "this member's attendance rate over 3 months") is what Postgres is for. Sanity is for editorial content with a workflow.
- **Zone-scoping is a server-side check on every write and every read of attendance and zonal headcount data, not a UI filter.** A zonal leader's client should never even receive another zone's data in the response, not just fail to display it.
- **Roles compose.** Someone can be a zonal leader *and* a ministry contributor *and* the schedule coordinator elsewhere. Don't model roles as a single enum on the user — model them as a set of scoped grants (this role, for this zone/ministry).
- **The approval workflow status is the single source of truth for what's public.** Don't let "published" be inferred from a date or a checkbox that's separate from the workflow field — that's how draft content leaks onto the public site.
- **File assets (PDF/PPT) need real file-type and size handling**, not just an image-asset pattern copy-pasted from a sermon cover image field.
- **Gathering dates and timezones**: be explicit about which timezone a gathering's date/time is recorded in, especially for a monthly prayer meeting or an admin traveling.
- **Don't let attendance or headcount submission be silently editable by anyone with a login.** Decide and enforce who can edit a submitted record and until when.
- **Clerk roles and Postgres scoping need to agree.** If a zonal leader is reassigned to a different zone, their access should update immediately, not just at next login — don't cache scope claims longer than necessary.
- **"Published" isn't enough of a filter for announcements and events on its own.** An announcement also needs the expiry check; an event also needs the date check. Both filters belong in the same server-side query that checks workflow status — don't split this logic between the CMS fetch and a client-side date comparison.
- **Membership management touches two systems at once.** Adding a member with portal access means a Postgres row *and* a Clerk user/invite; deactivating a member should revoke portal access, not just flag a database row. Decide and implement both sides together, not as an afterthought.
- **The admin panel's content review queue spans four content types.** Build it as one queue that lists drafts/in-review items across sermons, library, announcements, and events (using the shared workflow status field from section 8), not four separate queues someone has to check individually.
- **Don't build a recurrence engine for zonal meetings.** They have no fixed pattern by design — a zonal leader creates one whenever they hold it. Only unified services and the monthly prayer meeting are predictable enough to be worth pre-generating ahead of time.
- **Don't hardcode the worship-role list in code.** Keep it in the admin-editable WorshipRole table (section 8), or every future role change becomes a deploy instead of an admin edit.
- **Don't model a multi-person role as one Member field with a comma-separated string.** Prayer and ushering need one ScheduleAssignment row per person so each person's assignment can be edited, removed, or reported on independently — a packed string can't do any of that.
- **Sermon's optionality is a feature, not a gap to fill.** Resist the urge to auto-generate a sermon assignment for every Sunday "for consistency" — some Sundays genuinely don't have one, and forcing one in misrepresents the actual schedule.
- **A member's "my schedule" view must filter to that member's own assignments and future dates only, server-side** — the same discipline as attendance and headcount, not a client-side filter over a full assignment list.
- **The directory holds the most sensitive data in the app** — home addresses and personal phone numbers, not just names. Verify its route/query is gated as its own check, not just "inside the portal so it must be fine." Also keep it out of anything crawlable — no public sitemap entry, no unauthenticated API response, no accidental inclusion in a public member-count or search feature.

---

# 14. Checks to run

Run these from the correct workspace and report the real output. Never claim a check passed without running it.

- In web: type check, lint, a production build when routes, config, or server code change, and the dev server.
- In Studio: deploy the Studio application, deploy the schema, and confirm the workflow states render correctly for a draft, in-review, and published document.
- In the database layer: run migrations, and manually verify zone-scoping — log in as a zonal leader for Zone A and confirm Zone B's data is genuinely absent from the response, not just hidden in the UI.
- For the worship schedule: confirm the public schedule page needs no login, and that a logged-in member's "my assignments" view shows only their own, future-dated rows.
- For the directory: confirm the listing/search route returns nothing to a logged-out request, and manually check that a member's response contains no other member's data beyond what the directory is meant to show.

After you implement, run the type check and lint at minimum, add a build when routes, config, or server modules changed, and manually test the attendance entry flow end to end as a scoped (non-admin) user.

---

# 15. When in doubt

Keep it small. Use the relevant skill. Preserve the zone-scoping and workflow-gating rules above every other consideration. Match any provided UI exactly; otherwise keep it simple and mobile-first. Get specifics (roles, timezone, editability rules) from the user instead of guessing. Save a prompt and get approval before coding. Run the checks. Share exact test steps.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

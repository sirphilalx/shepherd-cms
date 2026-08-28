# Shepherd Design System

**Version 1.0 — derived from the Shepherd design mockups (August 2026)**

This document is the source of truth for Shepherd's visual language: color, type, spacing, elevation, iconography, and every UI component used across the public site, member portal, and admin panel. It's written for whoever builds the real app (Next.js + Tailwind, per `AGENTS.md`) — every token below is meant to be copied directly into `tailwind.config.js` or `globals.css`.

**One important note before anything else:** the mockups this system was extracted from were rendered as static JPGs through an old, limited HTML renderer for design-review purposes. That renderer didn't support modern CSS Grid or flexbox `gap`, so the mockup source code works around that with older techniques. **None of that applies here.** Building the real app in Next.js/Tailwind, use CSS Grid, flexbox `gap`, and every other modern layout tool freely — there's no reason to avoid them. This document describes the *design*, not the mockup pipeline's workarounds.

---

## 1. Design principles

- **Calm, not corporate.** This is a church system, not a SaaS dashboard for its own sake. Warmth and restraint over density and gradients.
- **One accent, used with intent.** Deep forest green carries all emphasis — primary actions, active states, selected dates. It is never diluted by a second "brand" color.
- **Numbers get a serif.** Anywhere a number or a page title is the hero of the moment (KPI values, page `h1`s, calendar chip counts), the serif display face is used. Everything functional stays in the sans-serif UI face.
- **Mobile is a different layout, not a shrunk one.** Tables become stacked label/value rows. Multi-column sections become one column. Padding scales down. Never just squeeze the desktop layout into a smaller viewport.

---

## 2. Color

### 2.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F6F4EF` | App/page background (warm off-white, never pure white) |
| `--surface` | `#FFFFFF` | Cards, inputs, sidebar, any raised surface |
| `--primary` | `#12362C` | Primary buttons, active nav state, selected states, dark KPI card, sidebar/brand mark |
| `--primary-hover` | `#0C281F` | Hover/pressed state for primary actions |
| `--tint` | `#E5EEE7` | Light green fill — active nav background, icon chips, neutral pills |
| `--tint-strong` | `#CFE1D5` | Slightly deeper tint — gradient stops, decorative fills |
| `--accent` | `#3E7A64` | Secondary green — eyebrows/labels, chart secondary series, links inside dark bands |

### 2.2 Ink (text) scale

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#161E1A` | Primary text, headings |
| `--ink-muted` | `#68716B` | Secondary text, subtitles, table body on light backgrounds |
| `--ink-faint` | `#9AA29B` | Tertiary/disabled text, placeholder text, calendar out-of-range dates |

### 2.3 Structure

| Token | Hex | Use |
|---|---|---|
| `--border` | `#E7E3D9` | Default hairline border (table rows, card dividers) |
| `--border-strong` | `#D9D4C6` | Input borders, secondary button borders — needs more definition than a divider |

### 2.4 Status colors

Each status has a background + text pair — never use the text color alone on `--surface`, and never use the background alone without its paired text color (contrast is calibrated as a pair).

| Status | Background | Text | Use |
|---|---|---|---|
| Success | `#E5EEE7` | `#1F5C3F` | Active, published, submitted, present |
| Warning | `#FBF1DD` | `#8E6412` | Pending, in review, sermon flag |
| Danger | `#FBEAE6` | `#9C4130` | Inactive, absent, rejected, error |
| Info | `#E9F0FB` | `#2C5A99` | Neutral informational tag (content type labels) |
| Neutral | `--tint` / `--primary` | — | Default/generic pill when no status applies |

### 2.5 Rules

- Never introduce a second hue as an "accent color." If a new status or category is needed, derive it from the existing status set (success/warning/danger/info) rather than adding e.g. blue or purple for its own sake.
- Dark surfaces (`--primary` background) always pair with white text and a lightened version of body/muted text (`#DCE9E2` / `#CFE1D5`) — never place `--ink-muted` on a dark background.
- `--bg` and `--surface` are deliberately close in value (off-white vs. white). The separation between "page" and "card" is carried by `--shadow-card`, not a strong color jump.

---

## 3. Typography

### 3.1 Typefaces

| Role | Family | Fallback stack |
|---|---|---|
| UI / body | **Inter** | `system-ui, sans-serif` |
| Display / numbers | **Newsreader** | `Georgia, serif` |

Load weights: Inter 400, 500, 600, 700, 800. Newsreader 500 (roman + italic optional, not currently used).

**Rule:** Newsreader is used *only* for: page `<h1>`/`<h2>` headings, KPI stat values, and the brand wordmark. Every other piece of text — labels, body copy, table content, buttons, nav — is Inter. Do not let Newsreader creep into UI chrome; it's reserved for moments that deserve a human, editorial feel.

### 3.2 Type scale

| Token / context | Size | Weight | Family |
|---|---|---|---|
| Hero H1 (landing page) | 46px (28px mobile) | 500 | Newsreader |
| Page H1 (app topbar) | 24px | 500 | Newsreader |
| Section H2 | 26px (21px mobile) | 500 | Newsreader |
| Card/tile H3 | 15–22px | 500 | Newsreader |
| KPI value | 32px | 500 | Newsreader, tabular numbers |
| Body / default | 13–14px | 400 | Inter |
| Card title | 15px | 600 | Inter |
| Subtitle / muted caption | 12–13px | 400 | Inter, `--ink-muted` |
| Label (form, table header) | 11–12px | 600–700 | Inter, uppercase, `0.04–0.06em` tracking |
| Pill / badge text | 11.5px | 600 | Inter |
| Button text | 13.5px | 600 | Inter |

### 3.3 Rules

- Headings use `letter-spacing: -0.01em` (slightly tight, standard for a serif display face at this size).
- All-caps labels (table headers, eyebrows, nav section labels) always carry positive letter-spacing (`0.04–0.08em`) — never set caps text at default tracking, it reads cramped.
- Numeric values (KPI stats, prices, counts) use `font-variant-numeric: tabular-nums` so figures don't jitter in tables or when they update.
- Line height: headings are tight (`1.08–1.15`); body/paragraph text is relaxed (`1.55–1.9`) — the gap between the two is intentional, not an oversight.

---

## 4. Spacing

Base unit is **4px**. Every margin, padding, and gap in the system is a multiple of it. Don't introduce arbitrary values (13px, 17px) outside this scale except where a component's internal padding has a specific established value (documented per-component below).

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight internal spacing |
| `space-2` | 8px | Button icon gap, form field label-to-input gap |
| `space-3` | 12px | List row internal gap, compact stacks |
| `space-4` | 16px | Default grid/card gap, form field row gap |
| `space-5` | 20px | Card internal padding (default) |
| `space-6` | 24px | Section internal spacing, hero item gap |
| `space-8` | 32–34px | Page horizontal padding (desktop), content vertical rhythm |
| `space-10` | 40px | Section vertical padding (public pages) |
| `space-16` | 64px | Hero vertical padding |

**Mobile adjustment:** desktop section/hero padding (40–64px) drops to roughly **20–24px** on mobile — never carry desktop-scale whitespace into a 390px viewport, it eats the content area.

---

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 9px | Small chips, checkboxes, tight elements |
| `radius-md` | 14px | Inputs, buttons that aren't pills, medium elements |
| `radius-lg` | 20px | **Default for every card, tile, and panel.** This is the signature radius — if in doubt, use this one. |
| `radius-pill` | 999px | Buttons, pills/badges, search bar, toggle groups, quarter selector |
| `radius-phone` | 46px | Mobile frame only (design-review artifact, not a real UI element) |

Buttons and pills are always fully rounded (999px). Cards are always `radius-lg` (20px). Inputs sit in between at `radius-md` (14px, though implemented at 10px in the current input styling — treat 10–14px as the acceptable input-radius range). There is no "sharp corner" anywhere in this system; the softest element in any given context should still round at minimum 9px.

---

## 6. Elevation (shadow)

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(22,30,26,.04), 0 10px 28px rgba(22,30,26,.06)` | Every card, tile, dropdown button — the default "raised surface" shadow |
| `shadow-pop` | `0 8px 24px rgba(22,30,26,.14)` | Modals, popovers, anything floating above the card layer |

Two-layer shadows only (a tight contact shadow + a soft ambient one). Never use a single hard drop-shadow — it reads flat and dated against this palette. There is no third "elevated" tier; if something needs to feel more prominent than a card, use `shadow-pop` plus a border, not a third shadow token.

---

## 7. Iconography

- **Style:** outline/stroke icons only, never filled. `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="1.7"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`.
- **Default size:** 16px. Icons inherit `currentColor`, so they pick up their container's text color automatically (e.g. white inside a primary button, `--primary` inside a tint chip).
- **Context sizes:** sidebar nav icons 17px; bottom nav icons 19px; everything else defaults to 16px unless the surrounding text is visibly larger (scale proportionally, roughly `1em`).
- **Never** use a filled icon set (e.g. Material filled, Font Awesome solid) alongside these — pick one outline icon library (Lucide is the closest match already listed as available in `AGENTS.md`'s tech stack) and use it exclusively.

---

## 8. Buttons

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--primary` | white | none | The one primary action per view (Save, Submit, Publish, Plan your visit) |
| Secondary | `--surface` | `--ink` | `1px solid --border-strong` | Everything else clickable that isn't primary or destructive |
| Ghost | transparent | `--ink-muted` | none | Low-emphasis inline actions (table row "Edit", "View") |

- Radius: always 999px (pill).
- Padding: `10px 18px` default, `7px 13px` for the `sm` size.
- Icon + label: icon first, `8px` gap, never icon-only without a tooltip/label somewhere accessible.
- **Only one primary button per screen/card-region.** If two actions compete, one is primary and the other is secondary — never two primary buttons side by side.
- Hover state exists only for primary (`--primary-hover`); secondary/ghost rely on browser-default or a subtle background tint on hover — don't invent a third color for this.
- There is no dedicated "destructive" button color in the current system. If a delete/remove action is needed, use the `--danger-text` color on a secondary or ghost button rather than introducing a solid red button.

---

## 9. Badges / Pills

Pill-shaped, `4px 10px` padding, `11.5px` / weight 600 text, using the status background+text pairs from §2.4. Used for: gathering/content status (Draft, In review, Published, Sent back), attendance status (Present, Absent), member status (Active, Inactive), and the "Sermon" flag on the schedule calendar.

Never rely on color alone to carry the status — pill text is always a real word ("Published", "Pending"), not just a colored dot.

---

## 10. Cards

The single most-used container in the system.

- Background `--surface`, radius `--radius-lg` (20px), shadow `--shadow-card`, padding `22px` (`16px` on mobile).
- **Card head pattern:** title (+ optional subtitle) on the left, one action (button or dropdown) on the right, `justify-content: space-between`, `16px` margin below before the card body.
- Cards never nest shadows — a card inside a card loses its own shadow and just uses a flat tint background (see the "Source" note pattern used throughout the schedule/dashboard pages: `background: var(--tint); box-shadow: none`).

---

## 11. Forms

- Label: 12px, weight 600, `--ink-muted`, sits above the input with `6px` gap.
- Input/select/textarea: `1px solid --border-strong`, radius 10px, `10px 12px` padding, 13px text, `--surface` background.
- Two-column field rows on desktop, collapsing to one column on mobile — this is one of the few places a 2-column layout is standard even in a "form" context (not just card grids).
- No visible label-less inputs (placeholder-as-label is not acceptable) — every field gets a real `<label>`.
- Multi-value fields (e.g. a prayer team of 3, an ushering team of 5) use a single text input listing names comma-separated at the mockup stage — see `AGENTS.md` §8 for why the real data model still needs one row per person; the form UI can reasonably use tag/chip input for this rather than a raw comma-separated string once built for real.

---

## 12. Tables

### 12.1 Desktop
Standard HTML table. Header row: 11px uppercase, weight 600, `--ink-faint`, `1px solid --border` bottom rule, no vertical borders. Body rows: 13px, `13px 10px` cell padding, `1px solid --border` row divider, last row has no divider. Avatars/initials (30px circle, `--tint` background, `--primary` text) prefix name cells where relevant.

### 12.2 Mobile — critical pattern
**Never render a wide table as-is on mobile.** Convert every table on a narrow viewport into stacked label/value rows: each row becomes a block with no visible table grid, and each cell shows its column header as a small inline label before the value (`label: value`, label in `--ink-faint`/11px, value right-aligned or below). This is implemented with a `data-label` attribute per cell in the mockups and can be done the same way in production, or with a dedicated mobile list component that maps the same row data — either is fine, but the table-as-table layout must not survive onto a phone screen.

### 12.3 Calendar (an exception)
The one place a literal grid table is appropriate on both desktop *and* mobile is a true calendar (the worship schedule). On mobile, don't force a 7-column calendar into label/value rows — instead switch to a simpler pattern entirely: a vertical list of the relevant dates (e.g. "Jul 5 · Head Covering"), grouped by month, which is more legible on a narrow screen than a cramped grid. This is the one component with a genuinely different mobile *structure*, not just a reflow.

---

## 13. Navigation

### 13.1 Sidebar (admin / portal, desktop)
236px fixed width, `--surface` background, `1px solid --border` right edge, 20px/14px padding. Brand mark (32px rounded-square icon) + wordmark at top, with a collapse toggle button beside it. Nav items: icon (17px) + label, `10px` radius, active item gets `--tint` background + `--primary` text + weight 600. Settings/Help pinned to the bottom via `margin-top: auto`.

**Collapsed state:** width drops to 76px, labels hide (icons only, centered), toggle remains visible to expand again. Every admin/portal screen must support both states identically — the collapse behavior is a property of the sidebar component, not something re-implemented per page.

### 13.2 Bottom nav (mobile, admin/portal)
Fixed to the bottom of the frame, `--surface` background, top border. 4–5 icon+label items (19px icons, 9.5px labels), active item in `--primary`, inactive in `--ink-faint`.

### 13.3 Public top nav
Logo left, horizontal text links center-right (13.5px, active link in `--primary` weight 600), primary "Member Login" button far right. Collapses to logo + hamburger icon on mobile.

---

## 14. Data visualization

No charting library — every chart is hand-built SVG/CSS so it stays on-brand without fighting a library's default theme.

- **Line chart:** single `--primary` stroke line (2.4px, rounded joins), soft gradient fill beneath (primary at 28% opacity fading to 0), light horizontal gridlines in `--border`, one callout bubble (dark pill + white bold text) marking the current/average value.
- **Donut chart:** CSS `conic-gradient`, primary + a descending tint scale for additional segments (`--primary` → `--accent` → lighter tints), white center hole showing a total + label, paired with a text legend (dot + label + value) rather than relying on the chart alone to convey exact numbers.
- Charts are always paired with a plain-language total/summary nearby — never the sole source of a number the user needs.

---

## 15. KPI / stat cards

20px padding, `--radius-lg`. Two variants: **dark** (`--primary` background, white text, used for the single "headline" metric in a row) and **light** (`--surface` + `shadow-card`, used for supporting metrics). Label (12.5px, weight 600) + big Newsreader value (32px) + small trend footnote (↑/↓ + comparison text, 11.5px). Exactly one dark KPI card per row — it marks the most important number; the rest stay light so the hierarchy is unambiguous at a glance.

---

## 16. Responsive rules summary

| Aspect | Desktop | Mobile |
|---|---|---|
| Navigation | Sidebar (expandable/collapsible) | Bottom tab bar |
| Multi-column grids (KPIs, charts, tiles) | 2–4 columns | 1 column (KPIs may use 2) |
| Tables | Real table | Stacked label/value rows |
| Calendar | Month grid | Grouped vertical list |
| Section padding | 40–64px | 20–24px |
| Hero | Side-by-side copy + art | Stacked, art shrinks to ~160px tall |

---

## 17. Copy / voice

- Sentence case everywhere — titles, buttons, nav labels. No title case, no all-caps except deliberate eyebrow/label text.
- Buttons name the action directly: "Save changes", "Submit attendance for Zone 3", "Plan your visit" — never a bare "Submit" or "OK".
- Empty/placeholder states are plain and specific ("— TBD —", "First time in any church") rather than cute or apologetic.
- Numbers are never invented for placeholder content in real builds — mockup data here is clearly fictional/example (Nigerian names, example church) and should be replaced with real data before anything ships.

---

## 18. Ready-to-use tokens

Drop this into `globals.css` (or translate directly into `tailwind.config.js` `theme.extend`):

```css
:root{
  /* Color */
  --bg:#F6F4EF;
  --surface:#FFFFFF;
  --ink:#161E1A;
  --ink-muted:#68716B;
  --ink-faint:#9AA29B;
  --primary:#12362C;
  --primary-hover:#0C281F;
  --tint:#E5EEE7;
  --tint-strong:#CFE1D5;
  --accent:#3E7A64;
  --border:#E7E3D9;
  --border-strong:#D9D4C6;
  --success-bg:#E5EEE7; --success-text:#1F5C3F;
  --warning-bg:#FBF1DD; --warning-text:#8E6412;
  --danger-bg:#FBEAE6; --danger-text:#9C4130;
  --info-bg:#E9F0FB; --info-text:#2C5A99;

  /* Radius */
  --radius-sm:9px;
  --radius-md:14px;
  --radius-lg:20px;
  --radius-pill:999px;

  /* Shadow */
  --shadow-card:0 1px 2px rgba(22,30,26,0.04), 0 10px 28px rgba(22,30,26,0.06);
  --shadow-pop:0 8px 24px rgba(22,30,26,0.14);

  /* Spacing (4px base) */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px; --space-16:64px;
}
```

```js
// tailwind.config.js theme.extend excerpt
colors: {
  bg: "#F6F4EF",
  surface: "#FFFFFF",
  ink: { DEFAULT: "#161E1A", muted: "#68716B", faint: "#9AA29B" },
  primary: { DEFAULT: "#12362C", hover: "#0C281F" },
  tint: { DEFAULT: "#E5EEE7", strong: "#CFE1D5" },
  accent: "#3E7A64",
  border: { DEFAULT: "#E7E3D9", strong: "#D9D4C6" },
  success: { bg: "#E5EEE7", text: "#1F5C3F" },
  warning: { bg: "#FBF1DD", text: "#8E6412" },
  danger:  { bg: "#FBEAE6", text: "#9C4130" },
  info:    { bg: "#E9F0FB", text: "#2C5A99" },
},
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  serif: ["Newsreader", "Georgia", "serif"],
},
borderRadius: {
  sm: "9px", md: "14px", lg: "20px", pill: "999px",
},
boxShadow: {
  card: "0 1px 2px rgba(22,30,26,.04), 0 10px 28px rgba(22,30,26,.06)",
  pop:  "0 8px 24px rgba(22,30,26,.14)",
},
```

---

## 19. Where this came from

These tokens and patterns were extracted directly from the Shepherd mockup set (50 exported screens across public site, member portal, and admin panel, desktop + mobile + collapsed-sidebar states). If a component is needed that isn't documented here, derive it from the nearest existing pattern (§10 Cards, §8 Buttons) rather than inventing a new visual language — consistency with what's already built matters more than any individual new component being perfectly bespoke.

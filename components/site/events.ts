/**
 * Event date formatting for the public events page and the homepage "Upcoming"
 * strip. Every part is rendered in a fixed display timezone so an evening event
 * (e.g. 19:00+01:00) never drifts a calendar day based on the server's clock
 * (AGENTS.md §13). Swap EVENT_TZ in one place if the church relocates.
 */
export const EVENT_TZ = "Africa/Lagos";

type DayParts = { y: number; m: number; d: number };

function dayParts(iso: string): DayParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** "2026-09-13T…" -> "Sep 13". The `eyebrow` class uppercases it in the UI. */
function monthDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: EVENT_TZ,
    month: "short",
    day: "numeric",
  });
}

/** "Sep 20" · "Sep 12–13" (same month) · "Sep 30 – Oct 2" (crosses month/year). No year. */
export function formatEventDateRange(
  startsAt: string,
  endsAt?: string | null,
): string {
  const start = monthDay(startsAt);
  if (!endsAt) return start;

  const a = dayParts(startsAt);
  const b = dayParts(endsAt);
  if (a.y === b.y && a.m === b.m && a.d === b.d) return start;

  if (a.y === b.y && a.m === b.m) {
    return `${start}–${b.d}`;
  }
  return `${start} – ${monthDay(endsAt)}`;
}

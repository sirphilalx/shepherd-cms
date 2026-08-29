/** "2026-08-30T…" -> "Aug 30, 2026". Shared by the sermon list, card, and detail. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

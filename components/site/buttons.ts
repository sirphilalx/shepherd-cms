import { cn } from "@/components/ui/cn";

/**
 * Shared class recipes for the public site. Mirrors the inline recipes in
 * app/(site)/page.tsx (DESIGN-SYSTEM.md §8 — pill buttons, one primary per view,
 * icon-first). Kept here so new pages don't re-derive them; the home page will
 * converge onto this module in a later pass.
 */

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-[18px] py-[10px] text-[13.5px] font-semibold transition-colors";

export const btnPrimary = cn(btnBase, "bg-primary text-white hover:bg-primary-hover");

export const btnSecondary = cn(
  btnBase,
  "border border-border-strong bg-surface text-ink hover:bg-bg",
);

/** Small bordered pill used for section actions / filters. */
export const pillLink =
  "inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface px-[14px] py-[7px] text-[12.5px] font-semibold text-ink transition-colors hover:bg-bg";

/** Uppercase green label above a title. */
export const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-accent";

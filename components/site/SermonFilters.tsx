"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { PillSelect } from "./PillSelect";

type FilterKey = "q" | "series" | "speaker" | "year";

interface Props {
  q: string;
  series: string;
  speaker: string;
  year: string;
  allSeries: string[];
  allSpeakers: string[];
  allYears: string[];
}

/**
 * Search + filters for /sermons. URL-driven: every control writes `?q=`,
 * `?series=`, `?speaker=`, `?year=` and the page re-filters server-side.
 * Holds no sermon data — just the current values and the option strings.
 */
export function SermonFilters({
  q,
  series,
  speaker,
  year,
  allSeries,
  allSpeakers,
  allYears,
}: Props) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  // Re-sync the box when `q` changes from outside (Clear all, back/forward).
  // Adjusting state during render is the supported pattern for prop-derived
  // state — no effect, no cascading render, no focus loss while typing.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setTerm(q);
  }

  const commit = (patch: Partial<Record<FilterKey, string>>) => {
    const next: Record<FilterKey, string> = { q, series, speaker, year, ...patch };
    const params = new URLSearchParams();
    (Object.keys(next) as FilterKey[]).forEach((key) => {
      const value = next[key].trim();
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    router.replace(qs ? `/sermons?${qs}` : "/sermons", { scroll: false });
  };

  // Debounce the free-text search.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = setTimeout(() => {
      if (term.trim() !== q) commit({ q: term });
    }, 300);
    return () => clearTimeout(id);
    // `commit` closes over the current param values; re-running only on `term`
    // is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const anyActive = Boolean(q || series || speaker || year);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          size={15}
          strokeWidth={1.9}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search sermons"
          aria-label="Search sermons"
          className="w-full rounded-full border border-border-strong bg-surface py-[9px] pl-9 pr-9 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        {term && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-faint transition-colors hover:text-ink"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {allSeries.length > 0 && (
          <PillSelect
            label="Filter by series"
            placeholder="All series"
            value={series}
            options={allSeries}
            onChange={(value) => commit({ series: value })}
          />
        )}
        {allSpeakers.length > 0 && (
          <PillSelect
            label="Filter by speaker"
            placeholder="All speakers"
            value={speaker}
            options={allSpeakers}
            onChange={(value) => commit({ speaker: value })}
          />
        )}
        {allYears.length > 0 && (
          <PillSelect
            label="Filter by year"
            placeholder="Any year"
            value={year}
            options={allYears}
            onChange={(value) => commit({ year: value })}
          />
        )}
        {anyActive && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              router.replace("/sermons", { scroll: false });
            }}
            className="text-[12.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

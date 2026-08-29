"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { PillSelect } from "./PillSelect";

type FilterKey = "q" | "category" | "type";

interface Props {
  q: string;
  category: string;
  type: string;
  allCategories: string[];
  allTypes: string[];
}

/**
 * Search + filters for /library. Mirrors SermonFilters: URL-driven — every
 * control writes `?q=`, `?category=`, `?type=` and the page re-filters
 * server-side. Holds no library data, just current values + option strings.
 */
export function LibraryFilters({
  q,
  category,
  type,
  allCategories,
  allTypes,
}: Props) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  // Re-sync the box when `q` changes from outside (Clear all, back/forward).
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setTerm(q);
  }

  const commit = (patch: Partial<Record<FilterKey, string>>) => {
    const next: Record<FilterKey, string> = { q, category, type, ...patch };
    const params = new URLSearchParams();
    (Object.keys(next) as FilterKey[]).forEach((key) => {
      const value = next[key].trim();
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    router.replace(qs ? `/library?${qs}` : "/library", { scroll: false });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const anyActive = Boolean(q || category || type);

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
          placeholder="Search the library"
          aria-label="Search the library"
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
        {allCategories.length > 0 && (
          <PillSelect
            label="Filter by ministry"
            placeholder="All ministries"
            value={category}
            options={allCategories}
            onChange={(value) => commit({ category: value })}
          />
        )}
        {allTypes.length > 1 && (
          <PillSelect
            label="Filter by file type"
            placeholder="All file types"
            value={type}
            options={allTypes}
            onChange={(value) => commit({ type: value })}
          />
        )}
        {anyActive && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              router.replace("/library", { scroll: false });
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

import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Section";
import { LibraryCard } from "@/components/site/LibraryCard";
import { LibraryFilters } from "@/components/site/LibraryFilters";
import { flattenLibraryFiles, type LibraryFileRow } from "@/components/site/library";
import { getPublishedLibraryItems } from "@/sanity/lib/publicContent";

export const metadata: Metadata = {
  title: "Library — The Church of Christ, Evueta",
  description:
    "Teaching notes, slides and handouts from The Church of Christ, Evueta — free to download.",
};

type Filters = { q: string; category: string; type: string };

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function matches(row: LibraryFileRow, { q, category, type }: Filters): boolean {
  if (category && row.category !== category) return false;
  if (type && row.typeLabel !== type) return false;
  if (q) {
    const haystack = `${row.filename} ${row.description} ${row.category}`.toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  return true;
}

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const sp = await searchParams;
  const items = await getPublishedLibraryItems();
  const files = flattenLibraryFiles(items);

  const allCategories = [...new Set(files.map((f) => f.category))].sort((a, b) =>
    a.localeCompare(b),
  );
  const allTypes = [...new Set(files.map((f) => f.typeLabel))].sort((a, b) =>
    a.localeCompare(b),
  );

  // Validate params against the real option lists so a junk value is ignored
  // rather than rendering a confusing empty page.
  const categoryRaw = first(sp.category);
  const typeRaw = first(sp.type);
  const filters: Filters = {
    q: first(sp.q),
    category: allCategories.includes(categoryRaw) ? categoryRaw : "",
    type: allTypes.includes(typeRaw) ? typeRaw : "",
  };

  const anyActive = Boolean(filters.q || filters.category || filters.type);
  const visible = anyActive ? files.filter((f) => matches(f, filters)) : files;

  return (
    <Container className="py-12 md:py-16">
      <div>
        <h1 className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-ink md:text-[30px]">
          Library
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Teaching notes, slides and handouts — free to download.
        </p>
      </div>

      <LibraryFilters
        q={filters.q}
        category={filters.category}
        type={filters.type}
        allCategories={allCategories}
        allTypes={allTypes}
      />

      <p className="mt-4 text-[12.5px] text-ink-faint">
        {anyActive
          ? `Showing ${visible.length} of ${files.length}`
          : `${files.length} file${files.length === 1 ? "" : "s"}`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 text-[14px] text-ink-muted">
          <p>No files match those filters.</p>
          <Link
            href="/library"
            className="mt-3 inline-block text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((row) => (
            <li key={row.key}>
              <LibraryCard row={row} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

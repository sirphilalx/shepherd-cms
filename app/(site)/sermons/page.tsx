import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Section";
import { SermonCard } from "@/components/site/SermonCard";
import { SermonFilters } from "@/components/site/SermonFilters";
import { getPublishedSermons } from "@/sanity/lib/publicContent";
import type { PublishedSermonListItem } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Sermons — The Church of Christ, Evueta",
  description:
    "Teachings from our unified services at The Church of Christ, Evueta — search by name, speaker, series, or year.",
};

type Filters = { q: string; series: string; speaker: string; year: string };

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function matches(sermon: PublishedSermonListItem, { q, series, speaker, year }: Filters): boolean {
  if (series && sermon.series !== series) return false;
  if (speaker && sermon.speaker !== speaker) return false;
  if (year && new Date(sermon.date).getFullYear() !== Number(year)) return false;
  if (q) {
    const haystack = `${sermon.title} ${sermon.speaker} ${sermon.series ?? ""}`.toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  return true;
}

export default async function SermonsPage({ searchParams }: PageProps<"/sermons">) {
  const sp = await searchParams;
  const sermons = await getPublishedSermons();

  const allSeries = [
    ...new Set(sermons.map((s) => s.series).filter((s): s is string => Boolean(s))),
  ].sort((a, b) => a.localeCompare(b));
  const allSpeakers = [...new Set(sermons.map((s) => s.speaker))].sort((a, b) =>
    a.localeCompare(b),
  );
  const allYears = [
    ...new Set(sermons.map((s) => new Date(s.date).getFullYear())),
  ]
    .sort((a, b) => b - a)
    .map(String);

  // Validate params against the real option lists so a junk value (?year=1999,
  // ?speaker=Nobody) is ignored rather than rendering a confusing empty page.
  const seriesRaw = first(sp.series);
  const speakerRaw = first(sp.speaker);
  const yearRaw = first(sp.year);
  const filters: Filters = {
    q: first(sp.q),
    series: allSeries.includes(seriesRaw) ? seriesRaw : "",
    speaker: allSpeakers.includes(speakerRaw) ? speakerRaw : "",
    year: allYears.includes(yearRaw) ? yearRaw : "",
  };

  const anyActive = Boolean(
    filters.q || filters.series || filters.speaker || filters.year,
  );
  const visible = anyActive
    ? sermons.filter((sermon) => matches(sermon, filters))
    : sermons;

  return (
    <Container className="py-12 md:py-16">
      <div>
        <h1 className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-ink md:text-[30px]">
          Sermons
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Teachings from our unified services, newest first.
        </p>
      </div>

      <SermonFilters
        q={filters.q}
        series={filters.series}
        speaker={filters.speaker}
        year={filters.year}
        allSeries={allSeries}
        allSpeakers={allSpeakers}
        allYears={allYears}
      />

      <p className="mt-4 text-[12.5px] text-ink-faint">
        {anyActive
          ? `Showing ${visible.length} of ${sermons.length}`
          : `${sermons.length} sermon${sermons.length === 1 ? "" : "s"}`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 text-[14px] text-ink-muted">
          <p>No sermons match those filters.</p>
          <Link
            href="/sermons"
            className="mt-3 inline-block text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((sermon) => (
            <li key={sermon._id}>
              <SermonCard sermon={sermon} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

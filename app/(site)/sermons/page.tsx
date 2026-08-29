import type {Metadata} from "next";

import {getPublishedSermons} from "@/sanity/lib/publicContent";

// Minimal verification surface (see prompts/sanity-content-model.md D7): render
// on every request so publishing in the Studio is reflected without a rebuild.
// The real sermons page will use tag-based revalidation instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sermons — The Church of Christ, Evueta",
  description: "Teachings and sermons from The Church of Christ, Evueta.",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SermonsPage() {
  const sermons = await getPublishedSermons();

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="font-serif text-[26px] tracking-[-0.01em] text-ink md:text-[32px]">
        Sermons
      </h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Teachings from our gatherings, newest first.
      </p>

      {sermons.length === 0 ? (
        <p className="mt-10 text-[14px] text-ink-muted">
          No sermons have been published yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {sermons.map((sermon) => (
            <li key={sermon._id} className="py-4">
              <h2 className="font-serif text-[18px] text-ink">{sermon.title}</h2>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                {[
                  sermon.speaker,
                  formatDate(sermon.date),
                  sermon.series,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

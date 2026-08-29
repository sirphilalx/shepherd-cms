import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";
import type { UpcomingEvent } from "@/sanity/lib/types";
import { eyebrow } from "./buttons";
import { formatEventDateRange } from "./events";

/**
 * One upcoming event. Shared by the /events page and the homepage "Upcoming"
 * strip. Not a link — there is no event detail route and no RSVP (AGENTS.md §12).
 */
export function EventCard({ event }: { event: UpcomingEvent }) {
  const hasImage = Boolean(event.image?.asset);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative aspect-[16/9] bg-tint">
        {hasImage ? (
          <Image
            src={urlFor(event.image!).width(640).height(360).fit("crop").url()}
            alt={event.image?.alt || event.title}
            fill
            sizes="(min-width: 768px) 360px, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-tint to-tint-strong"
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className={eyebrow}>{formatEventDateRange(event.startsAt, event.endsAt)}</p>
        <h3 className="mt-2 font-serif text-[18px] leading-[1.25] text-ink">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-[1.6] text-ink-muted">
          {event.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-ink-faint">
          <span>{event.location}</span>
          {event.ministry && <span>{event.ministry}</span>}
        </div>
      </div>
    </article>
  );
}

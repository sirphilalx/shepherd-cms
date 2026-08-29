import Image from "next/image";
import Link from "next/link";

import { urlFor } from "@/sanity/lib/image";
import type { PublishedSermonListItem } from "@/sanity/lib/types";
import { eyebrow } from "./buttons";
import { formatDate } from "./format";

export function SermonCard({ sermon }: { sermon: PublishedSermonListItem }) {
  const hasCover = Boolean(sermon.coverImage?.asset);

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card transition-shadow hover:shadow-pop"
    >
      <div className="relative aspect-[16/9] bg-tint">
        {hasCover ? (
          <Image
            src={urlFor(sermon.coverImage!).width(640).height(360).fit("crop").url()}
            alt={sermon.coverImage?.alt || sermon.title}
            fill
            sizes="(min-width: 1180px) 220px, (min-width: 640px) 45vw, 100vw"
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
        <p className={eyebrow}>{sermon.series || "Standalone"}</p>
        <h3 className="mt-2 font-serif text-[18px] leading-[1.25] text-ink">
          {sermon.title}
        </h3>
        <p className="mt-1 text-[12.5px] text-ink-muted">{sermon.speaker}</p>
        <div className="mt-4 flex items-center justify-between pt-1 text-[11.5px] text-ink-faint">
          <span>{formatDate(sermon.date)}</span>
        </div>
      </div>
    </Link>
  );
}

import {NextResponse} from "next/server";

import {getReviewQueue} from "@/sanity/lib/adminContent";
import {
  getPublishedAnnouncements,
  getPublishedLibraryItems,
  getPublishedSermons,
  getUpcomingEvents,
} from "@/sanity/lib/publicContent";
import type {ContentType} from "@/sanity/lib/types";

/**
 * DEV-ONLY verification of the Sanity read layer. Returns 404 in production.
 * Delete once the admin panel exercises these helpers for real.
 *
 * Proves:
 *  - a logged-out request to a public route never sees non-published content
 *    (every public item asserted `status === "published"`, else HTTP 500);
 *  - all four content types come back through ONE shared review-queue fetch.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", {status: 404});
  }

  const [sermons, library, announcements, events, queue] = await Promise.all([
    getPublishedSermons(),
    getPublishedLibraryItems(),
    getPublishedAnnouncements(),
    getUpcomingEvents(),
    getReviewQueue(),
  ]);

  const publicItems = [...sermons, ...library, ...announcements, ...events];
  const leaked = publicItems.filter((item) => item.status !== "published");

  if (leaked.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Non-published content returned by a public helper",
        leaked: leaked.map((item) => ({_id: item._id, _type: item._type, status: item.status})),
      },
      {status: 500},
    );
  }

  const byType: Record<ContentType, number> = {
    sermonPost: 0,
    libraryItem: 0,
    announcement: 0,
    event: 0,
  };
  for (const item of queue) {
    byType[item._type] += 1;
  }

  return NextResponse.json({
    ok: true,
    public: {
      sermons: sermons.length,
      libraryItems: library.length,
      announcements: announcements.length,
      events: events.length,
    },
    reviewQueue: {
      total: queue.length,
      byType,
      allFourTypesPresent: Object.values(byType).every((n) => n > 0),
    },
  });
}

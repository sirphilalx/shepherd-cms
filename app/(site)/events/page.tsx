import type { Metadata } from "next";

import { Container } from "@/components/site/Section";
import { EventCard } from "@/components/site/EventCard";
import { getUpcomingEvents } from "@/sanity/lib/publicContent";

export const metadata: Metadata = {
  title: "Events — The Church of Christ, Evueta",
  description:
    "Upcoming services, gospel meetings, classes and fellowships at The Church of Christ, Evueta.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <Container className="py-12 md:py-16">
      <div>
        <h1 className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-ink md:text-[30px]">
          Upcoming events
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Soonest first — past events are archived automatically.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="mt-10 text-[14px] text-ink-muted">
          No upcoming events right now. Check back soon.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {events.map((event) => (
            <li key={event._id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

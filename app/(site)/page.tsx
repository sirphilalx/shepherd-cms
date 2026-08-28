import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  HandHelping,
  Music2,
  Play,
  Radio,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container, Section } from "@/components/site/Section";
import { cn } from "@/components/ui/cn";
import heroImg from "@/public/worship-singing.jpg";
import zonesImg from "@/public/worship-portrait.jpg";
import congregationImg from "@/public/worship-congregation.jpg";

/* --- Static content (transcribed from the mockup; swaps to CMS fetches later) --- */

type ServiceTime = { label: string; value: string; sub: string };
const serviceTimes: ServiceTime[] = [
  { label: "Sunday", value: "8:00 & 10:00am", sub: "Main auditorium" },
  { label: "Wednesday", value: "5:30pm", sub: "Main auditorium" },
  { label: "Last Thursday", value: "6:00pm · Prayer meeting", sub: "Main auditorium" },
  { label: "2nd Sunday", value: "Zonal fellowships", sub: "Across all 5 zones" },
];

type Ministry = { name: string; blurb: string; icon: LucideIcon; slug: string };
const ministries: Ministry[] = [
  {
    name: "Youth Ministry",
    blurb: "Ages 13–25 · worship, discipleship, and community every Friday.",
    icon: Users,
    slug: "youth",
  },
  {
    name: "Choir",
    blurb: "Weekly rehearsals and leading worship across all unified services.",
    icon: Music2,
    slug: "choir",
  },
  {
    name: "Media & Production",
    blurb: "Sound, livestream and photography for every gathering.",
    icon: Radio,
    slug: "media",
  },
  {
    name: "Ushering Unit",
    blurb: "Welcoming faces and steady hands at every service and event.",
    icon: HandHelping,
    slug: "ushering",
  },
  {
    name: "Children's Ministry",
    blurb: "Age-graded classes so kids grow in faith alongside the adults.",
    icon: Baby,
    slug: "children",
  },
  {
    name: "Foundation Class",
    blurb: "A six-week on-ramp into faith and church life for new believers.",
    icon: GraduationCap,
    slug: "foundation",
  },
];

type EventItem = {
  date: string;
  title: string;
  blurb: string;
  location: string;
  ministry: string;
};
const events: EventItem[] = [
  {
    date: "Sept 12–13",
    title: "Youth Conference 2026",
    blurb: "Two days of worship, workshops and fellowship for ages 13–25.",
    location: "Main auditorium",
    ministry: "Youth Ministry",
  },
  {
    date: "Sept 20",
    title: "Choir Rehearsal Retreat",
    blurb: "A day set apart for the choir ahead of the Q4 season.",
    location: "Fellowship Hall",
    ministry: "Choir",
  },
  {
    date: "Oct 5",
    title: "Foundation Class Graduation",
    blurb: "Celebrating this quarter's new believers.",
    location: "Main auditorium",
    ministry: "Foundation Class",
  },
];

type LibraryItem = {
  category: string;
  filename: string;
  blurb: string;
  type: string;
  size: string;
};
const libraryItems: LibraryItem[] = [
  {
    category: "Foundation Class",
    filename: "Foundation Class Wk 6 Notes.pdf",
    blurb: "Session six handouts for new believers.",
    type: "PDF",
    size: "1.4 MB",
  },
  {
    category: "Teaching Ministry",
    filename: "Walking in Grace Slides.pptx",
    blurb: "This week's teaching slides.",
    type: "PPT",
    size: "3.8 MB",
  },
  {
    category: "Children's Ministry",
    filename: "David & Goliath Lesson Series.pdf",
    blurb: "This quarter's children's class series.",
    type: "PDF",
    size: "2.0 MB",
  },
];

/* --- Link recipes (Button component is <button>-only; these CTAs are links) --- */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-[18px] py-[10px] text-[13.5px] font-semibold transition-colors";
const btnPrimary = cn(btnBase, "bg-primary text-white hover:bg-primary-hover");
const btnSecondary = cn(
  btnBase,
  "border border-border-strong bg-surface text-ink hover:bg-bg",
);
const btnOnDark = cn(btnBase, "bg-white text-primary hover:bg-white/90");
const pillLink =
  "inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface px-[14px] py-[7px] text-[12.5px] font-semibold text-ink transition-colors hover:bg-bg";
const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-accent";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[560px] items-end overflow-hidden md:min-h-[53vh] md:max-h-[480px]">
        <Image
          src={heroImg}
          alt="The congregation singing together during a Sunday service"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <Container className="relative z-10 py-12 md:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            The Church of Christ, Evueta
          </p>
          <h1 className="mt-3 max-w-[16ch] font-serif text-[28px] leading-[1.1] tracking-[-0.01em] text-white md:text-[46px]">
            A church family, gathered every week.
          </h1>
          <p className="mt-4 max-w-[34rem] text-[14px] leading-[1.7] text-white/85">
            Join us Sundays at 8am &amp; 10am, Wednesdays at 5:30pm, and find your
            zone&rsquo;s fellowship in your neighbourhood.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/visit" className={cn(btnPrimary, "max-sm:w-full")}>
              Plan your visit
            </Link>
            <Link href="/sermons" className={cn(btnOnDark, "max-sm:w-full")}>
              <Play size={15} strokeWidth={1.9} />
              Watch latest sermon
            </Link>
          </div>
        </Container>
      </section>

      {/* Service times */}
      <Section title="Service times">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceTimes.map((s) => (
            <div key={s.label} className="rounded-lg bg-surface p-5 shadow-card">
              <p className={eyebrow}>{s.label}</p>
              <p className="mt-2 font-serif text-[20px] text-ink">{s.value}</p>
              <p className="mt-1 text-[12.5px] text-ink-muted">{s.sub}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* This Sunday */}
      <Section
        title="This Sunday"
        subtitle="Continue the series with us, live or from the sermon library."
        action={
          <Link href="/sermons" className={pillLink}>
            All sermons
            <ChevronRight size={14} />
          </Link>
        }
      >
        <div className="overflow-hidden rounded-lg bg-surface shadow-card lg:grid lg:grid-cols-2">
          <div className="relative aspect-[16/10] lg:aspect-auto">
            <Image
              src={congregationImg}
              alt="Worshippers gathered for a Sunday service"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="p-6 md:p-8">
            <p className={cn(eyebrow, "tracking-[0.1em]")}>Grace series</p>
            <h3 className="mt-2 font-serif text-[22px] text-ink">Walking in Grace</h3>
            <p className="mt-2 text-[12.5px] text-ink-muted">
              Pastor J. Amadi · Aug 30, 2026 · 32 min
            </p>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-ink-muted">
              What it means to live daily out of grace rather than performance —
              three practical shifts in prayer, relationships, and how we handle
              failure.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/library" className={btnPrimary}>
                <Download size={15} strokeWidth={1.9} />
                Download notes
              </Link>
              <Link href="/sermons" className={btnSecondary}>
                Watch on YouTube
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Zones band */}
      <section className="relative isolate overflow-hidden bg-primary">
        <Image
          src={zonesImg}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-right opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40" />
        <Container className="relative z-10 py-14 md:py-20">
          <h3 className="max-w-[32rem] font-serif text-[22px] leading-[1.15] tracking-[-0.01em] text-white md:text-[26px]">
            One church family, five zones strong.
          </h3>
          <p className="mt-3 max-w-[32rem] text-[13.5px] leading-[1.75] text-white/80">
            Every member belongs to a zone close to home, gathering for fellowship
            beyond Sunday and cared for by a zonal leader who knows their name.
          </p>
        </Container>
      </section>

      {/* Find your place */}
      <Section
        title="Find your place"
        subtitle="Six ways to get plugged in beyond a Sunday seat."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ministries.map((m) => {
            const Glyph = m.icon;
            return (
              <div
                key={m.slug}
                className="flex flex-col rounded-lg bg-surface p-5 shadow-card"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-tint text-primary"
                  aria-hidden
                >
                  <Glyph size={18} strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 font-serif text-[16px] text-ink">{m.name}</h3>
                <p className="mt-1 flex-1 text-[13px] leading-[1.6] text-ink-muted">
                  {m.blurb}
                </p>
                <Link
                  href={`/ministries/${m.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary"
                >
                  Learn more
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Upcoming */}
      <Section
        title="Upcoming"
        subtitle="What's on across the church this month."
        action={
          <Link href="/events" className={pillLink}>
            All events
            <ChevronRight size={14} />
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {events.map((e) => (
            <article
              key={e.title}
              className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card"
            >
              <div
                className="flex h-[132px] items-center justify-center bg-tint text-primary/40"
                aria-hidden
              >
                <Calendar size={30} strokeWidth={1.5} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className={eyebrow}>{e.date}</p>
                <h3 className="mt-2 font-serif text-[18px] text-ink">{e.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.6] text-ink-muted">
                  {e.blurb}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-ink-faint">
                  <span>{e.location}</span>
                  <span>{e.ministry}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* From the library */}
      <Section
        title="From the library"
        subtitle="Recent notes and slides, free to download."
        action={
          <Link href="/library" className={pillLink}>
            Browse library
            <ChevronRight size={14} />
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {libraryItems.map((item) => (
            <Link
              key={item.filename}
              href="/library"
              className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card transition-shadow hover:shadow-pop"
            >
              <div
                className="flex h-[132px] items-center justify-center bg-tint text-primary/40"
                aria-hidden
              >
                <FileText size={30} strokeWidth={1.5} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className={eyebrow}>{item.category}</p>
                <h3 className="mt-2 font-serif text-[16px] break-words text-ink">
                  {item.filename}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.6] text-ink-muted">
                  {item.blurb}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-ink-faint">
                  <span>{item.type}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Visit CTA band */}
      <section className="relative isolate overflow-hidden bg-primary">
        <Image
          src={congregationImg}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <Container className="relative z-10 py-16 md:py-24">
          <h3 className="max-w-[34rem] font-serif text-[24px] leading-[1.15] tracking-[-0.01em] text-white md:text-[28px]">
            New here? We&rsquo;d love to meet you.
          </h3>
          <p className="mt-3 max-w-[34rem] text-[13.5px] leading-[1.75] text-white/80">
            Fill in a two-minute form and a member of our welcome team will save
            you a seat and walk you in — right here at our Evueta building.
          </p>
          <Link href="/visit" className={cn(btnOnDark, "mt-6 max-sm:w-full")}>
            Plan your visit
          </Link>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { toPlainText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { Container } from "@/components/site/Section";
import { SermonBody } from "@/components/site/PortableText";
import { btnPrimary, eyebrow } from "@/components/site/buttons";
import { formatDate } from "@/components/site/format";
import { urlFor } from "@/sanity/lib/image";
import { getPublishedSermon } from "@/sanity/lib/publicContent";

function bodyBlocks(body: unknown): PortableTextBlock[] {
  return Array.isArray(body) ? (body as PortableTextBlock[]) : [];
}

function mediaLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be") return "Watch on YouTube";
    if (host === "vimeo.com") return "Watch on Vimeo";
  } catch {
    /* fall through */
  }
  return "Watch or listen";
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getPublishedSermon(slug);
  if (!sermon) return { title: "Sermon not found — The Church of Christ, Evueta" };

  const summary = toPlainText(bodyBlocks(sermon.body)).trim().slice(0, 155);
  return {
    title: `${sermon.title} — Sermons`,
    description:
      summary ||
      `A teaching by ${sermon.speaker} at The Church of Christ, Evueta.`,
  };
}

export default async function SermonDetailPage({ params }: Params) {
  const { slug } = await params;
  const sermon = await getPublishedSermon(slug);
  if (!sermon) notFound();

  const hasCover = Boolean(sermon.coverImage?.asset);
  const body = bodyBlocks(sermon.body);

  return (
    <Container className="py-10 md:py-16">
      <article className="mx-auto max-w-[720px]">
        <p className={eyebrow}>{sermon.series || "Standalone"}</p>
        <h1 className="mt-2 font-serif text-[30px] leading-[1.1] tracking-[-0.01em] text-ink md:text-[38px]">
          {sermon.title}
        </h1>
        <p className="mt-3 text-[13px] text-ink-muted">
          {sermon.speaker} · {formatDate(sermon.date)}
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-primary">
          {hasCover ? (
            <Image
              src={urlFor(sermon.coverImage!).width(1440).height(810).fit("crop").url()}
              alt={sermon.coverImage?.alt || sermon.title}
              fill
              sizes="(min-width: 760px) 720px, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-primary to-accent"
              aria-hidden
            />
          )}
        </div>

        {body.length > 0 && (
          <div className="mt-8">
            <SermonBody value={body} />
          </div>
        )}

        {sermon.mediaUrl && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={sermon.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnPrimary} max-sm:w-full`}
            >
              <Play size={15} strokeWidth={1.9} />
              {mediaLabel(sermon.mediaUrl)}
            </a>
          </div>
        )}
      </article>
    </Container>
  );
}

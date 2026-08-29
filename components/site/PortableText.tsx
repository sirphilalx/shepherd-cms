import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { urlFor } from "@/sanity/lib/image";

type BodyImage = {
  _type: "image";
  alt?: string;
  asset?: { _ref: string; _type: "reference" };
};

const sermonBodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[14px] leading-[1.8] text-ink-muted [&:not(:first-child)]:mt-4">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 font-serif text-[22px] leading-[1.2] text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-serif text-[18px] leading-[1.25] text-ink">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-tint-strong pl-4 text-[14px] italic leading-[1.8] text-ink-muted">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 pl-5 text-[14px] leading-[1.8] text-ink-muted">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-[14px] leading-[1.8] text-ink-muted">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-primary underline underline-offset-2"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: BodyImage }) => {
      if (!value?.asset) return null;
      return (
        <Image
          src={urlFor(value).width(1400).url()}
          alt={value.alt || ""}
          width={1400}
          height={788}
          className="mt-6 h-auto w-full rounded-lg"
        />
      );
    },
  },
};

export function SermonBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={sermonBodyComponents} />;
}

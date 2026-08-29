import { Download } from "lucide-react";

import { cn } from "@/components/ui/cn";
import { btnSecondary, eyebrow } from "./buttons";
import type { LibraryFileRow } from "./library";

export function LibraryCard({ row }: { row: LibraryFileRow }) {
  return (
    <a
      href={row.downloadUrl}
      download
      aria-label={`Download ${row.filename}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card transition-shadow hover:shadow-pop"
    >
      <div
        className="aspect-[16/9] bg-gradient-to-br from-tint to-tint-strong"
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-5">
        <p className={eyebrow}>{row.category}</p>
        <h3 className="mt-2 font-serif text-[16px] leading-[1.3] break-words text-ink">
          {row.filename}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-[1.6] text-ink-muted">
          {row.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-ink-faint">
          <span>{row.typeLabel}</span>
          <span>{row.sizeLabel}</span>
        </div>
        <span className={cn(btnSecondary, "mt-4 w-full")}>
          <Download size={15} strokeWidth={1.9} />
          Download
        </span>
      </div>
    </a>
  );
}

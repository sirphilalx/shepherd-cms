import type { PublishedLibraryItem } from "@/sanity/lib/types";

/**
 * One downloadable file, flattened out of a library item's `files[]`. A card on
 * `/library` (and the homepage teaser) renders one of these — the mock's card
 * titles are filenames with a single type + size, i.e. a card is a file, not an
 * item. See prompts/library-page.md D1.
 */
export type LibraryFileRow = {
  key: string;
  category: string;
  filename: string;
  description: string;
  typeLabel: string;
  sizeLabel: string;
  downloadUrl: string;
};

/** 1_400_000 -> "1.4 MB"; 900_000 -> "900 KB". Decimal base, matches the mock. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** "pdf" -> "PDF", "pptx" -> "PPT". Short label shown before download (§13). */
export function fileTypeLabel(
  ext?: string | null,
  mime?: string | null,
): string {
  const e = (ext ?? "").toLowerCase();
  const map: Record<string, string> = {
    pdf: "PDF",
    ppt: "PPT",
    pptx: "PPT",
    doc: "DOC",
    docx: "DOC",
    xls: "XLS",
    xlsx: "XLS",
    key: "KEY",
  };
  if (map[e]) return map[e];
  if (e) return e.toUpperCase();
  if (mime?.includes("presentation")) return "PPT";
  if (mime?.includes("pdf")) return "PDF";
  if (mime?.includes("word")) return "DOC";
  return "FILE";
}

/**
 * Sanity's documented way to force a download with the right filename: append
 * `?dl=<name>` so the asset is served `Content-Disposition: attachment`. The
 * bare `download` attribute is ignored cross-origin from cdn.sanity.io.
 */
export function downloadHref(url: string, filename: string): string {
  return `${url}?dl=${encodeURIComponent(filename)}`;
}

/** Flatten every published item's files into card rows, preserving order. */
export function flattenLibraryFiles(
  items: PublishedLibraryItem[],
): LibraryFileRow[] {
  const rows: LibraryFileRow[] = [];
  for (const item of items) {
    for (const file of item.files ?? []) {
      const asset = file.asset;
      if (!asset?.url) continue;
      const filename =
        asset.originalFilename || file.title || item.title || "download";
      rows.push({
        key: `${item._id}:${file._key}`,
        category: item.category,
        filename,
        description: item.description,
        typeLabel: fileTypeLabel(asset.extension, asset.mimeType),
        sizeLabel: formatBytes(asset.size ?? 0),
        downloadUrl: downloadHref(asset.url, filename),
      });
    }
  }
  return rows;
}

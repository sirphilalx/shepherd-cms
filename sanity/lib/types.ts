/**
 * Hand-written shapes for the read layer. Replace with generated types once
 * TypeGen is wired across the studio/ + web workspaces (see studio/README.md).
 */

export type WorkflowStatus = 'draft' | 'in_review' | 'published' | 'rejected'
export type ContentType = 'sermonPost' | 'libraryItem' | 'announcement' | 'event'

export interface SanityImageRef {
  alt?: string | null
  asset?: {_ref: string; _type: 'reference'} | null
}

export interface LibraryFile {
  _key: string
  title?: string | null
  asset: {
    _id: string
    url: string
    originalFilename?: string | null
    extension?: string | null
    mimeType?: string | null
    size?: number | null
  } | null
}

// --- Public --------------------------------------------------------------

interface PublishedBase {
  _id: string
  status: 'published'
}

export interface PublishedSermonListItem extends PublishedBase {
  _type: 'sermonPost'
  title: string
  slug: string
  date: string
  speaker: string
  series?: string | null
  ministry?: string | null
  mediaUrl?: string | null
  coverImage?: SanityImageRef | null
}

export interface PublishedSermon extends PublishedSermonListItem {
  body?: unknown[] | null
}

export interface PublishedLibraryItem extends PublishedBase {
  _type: 'libraryItem'
  title: string
  description: string
  category: string
  files: LibraryFile[] | null
}

export interface PublishedAnnouncement extends PublishedBase {
  _type: 'announcement'
  title: string
  body: string
  expiresAt?: string | null
  image?: SanityImageRef | null
}

export interface UpcomingEvent extends PublishedBase {
  _type: 'event'
  title: string
  description: string
  location: string
  startsAt: string
  endsAt?: string | null
  ministry?: string | null
  image?: SanityImageRef | null
}

// --- Admin (review) ----------------------------------------------------

export interface ReviewQueueItem {
  _id: string
  _type: ContentType
  _updatedAt: string
  status: WorkflowStatus
  reviewNote?: string | null
  title: string
  slug?: string | null
}

export type ReviewItem = ReviewQueueItem & Record<string, unknown>

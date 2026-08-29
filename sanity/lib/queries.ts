import {defineQuery} from 'next-sanity'

/**
 * Every PUBLIC query below contains the literal `status == "published"`. That is
 * the single source of truth for what is public (AGENTS.md §13) — combined with
 * the public client's `perspective: 'published'` it is enforced twice.
 *
 * The only query that reads non-published content is REVIEW_QUEUE_QUERY /
 * REVIEW_ITEM_BY_ID_QUERY, run exclusively through the server-only admin client.
 */

const IMAGE_FRAGMENT = /* groq */ `{
  ...,
  "alt": alt,
  asset
}`

// ---------------------------------------------------------------------------
// Public — sermons
// ---------------------------------------------------------------------------

export const PUBLISHED_SERMONS_QUERY = defineQuery(/* groq */ `
  *[_type == "sermonPost" && status == "published" && defined(slug.current)]
  | order(date desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    date,
    speaker,
    series,
    ministry,
    mediaUrl,
    coverImage ${IMAGE_FRAGMENT},
    status
  }
`)

export const PUBLISHED_SERMON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "sermonPost" && status == "published" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    date,
    speaker,
    series,
    ministry,
    mediaUrl,
    coverImage ${IMAGE_FRAGMENT},
    body,
    status
  }
`)

// ---------------------------------------------------------------------------
// Public — library
// ---------------------------------------------------------------------------

export const PUBLISHED_LIBRARY_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "libraryItem" && status == "published"]
  | order(_createdAt desc) {
    _id,
    _type,
    title,
    description,
    category,
    files[]{
      _key,
      title,
      "asset": asset->{
        _id,
        url,
        originalFilename,
        extension,
        mimeType,
        size
      }
    },
    status
  }
`)

// ---------------------------------------------------------------------------
// Public — announcements (published AND not expired)
// ---------------------------------------------------------------------------

export const PUBLISHED_ANNOUNCEMENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "announcement"
    && status == "published"
    && (!defined(expiresAt) || expiresAt > now())]
  | order(_createdAt desc) {
    _id,
    _type,
    title,
    body,
    expiresAt,
    image ${IMAGE_FRAGMENT},
    status
  }
`)

// ---------------------------------------------------------------------------
// Public — events (published AND today or later)
// ---------------------------------------------------------------------------

export const UPCOMING_EVENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "event"
    && status == "published"
    && coalesce(endsAt, startsAt) >= now()]
  | order(startsAt asc) {
    _id,
    _type,
    title,
    description,
    location,
    startsAt,
    endsAt,
    ministry,
    image ${IMAGE_FRAGMENT},
    status
  }
`)

// ---------------------------------------------------------------------------
// Admin — one shared review queue across all four content types
// ---------------------------------------------------------------------------

export const REVIEW_QUEUE_QUERY = defineQuery(/* groq */ `
  *[_type in ["sermonPost", "libraryItem", "announcement", "event"]
    && status != "published"]
  | order(_updatedAt desc) {
    _id,
    _type,
    _updatedAt,
    status,
    reviewNote,
    title,
    "slug": slug.current
  }
`)

export const REVIEW_ITEM_BY_ID_QUERY = defineQuery(/* groq */ `
  *[_id == $id && _type in ["sermonPost", "libraryItem", "announcement", "event"]][0] {
    _id,
    _type,
    _updatedAt,
    status,
    reviewNote,
    title,
    "slug": slug.current,
    _type == "sermonPost" => {
      date,
      speaker,
      series,
      ministry,
      mediaUrl,
      coverImage ${IMAGE_FRAGMENT},
      body
    },
    _type == "libraryItem" => {
      description,
      category,
      files[]{
        _key,
        title,
        "asset": asset->{_id, url, originalFilename, extension, mimeType, size}
      }
    },
    _type == "announcement" => {
      body,
      expiresAt,
      image ${IMAGE_FRAGMENT}
    },
    _type == "event" => {
      description,
      location,
      startsAt,
      endsAt,
      ministry,
      image ${IMAGE_FRAGMENT}
    }
  }
`)

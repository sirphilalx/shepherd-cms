import 'server-only'

import {sanityFetch} from './live'
import {
  PUBLISHED_ANNOUNCEMENTS_QUERY,
  PUBLISHED_LIBRARY_ITEMS_QUERY,
  PUBLISHED_SERMON_BY_SLUG_QUERY,
  PUBLISHED_SERMONS_QUERY,
  UPCOMING_EVENTS_QUERY,
} from './queries'
import type {
  PublishedAnnouncement,
  PublishedLibraryItem,
  PublishedSermon,
  PublishedSermonListItem,
  UpcomingEvent,
} from './types'

/**
 * Public content read layer. Every helper only ever returns `status: "published"`
 * documents — the queries hard-filter it and the client runs under
 * `perspective: 'published'`. Safe to call from ungated public pages.
 */

export async function getPublishedSermons(): Promise<PublishedSermonListItem[]> {
  const {data} = await sanityFetch({query: PUBLISHED_SERMONS_QUERY})
  return (data ?? []) as PublishedSermonListItem[]
}

export async function getPublishedSermon(slug: string): Promise<PublishedSermon | null> {
  const {data} = await sanityFetch({
    query: PUBLISHED_SERMON_BY_SLUG_QUERY,
    params: {slug},
  })
  return (data ?? null) as PublishedSermon | null
}

export async function getPublishedLibraryItems(): Promise<PublishedLibraryItem[]> {
  const {data} = await sanityFetch({query: PUBLISHED_LIBRARY_ITEMS_QUERY})
  return (data ?? []) as PublishedLibraryItem[]
}

export async function getPublishedAnnouncements(): Promise<PublishedAnnouncement[]> {
  const {data} = await sanityFetch({query: PUBLISHED_ANNOUNCEMENTS_QUERY})
  return (data ?? []) as PublishedAnnouncement[]
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const {data} = await sanityFetch({query: UPCOMING_EVENTS_QUERY})
  return (data ?? []) as UpcomingEvent[]
}

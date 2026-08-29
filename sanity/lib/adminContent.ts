import 'server-only'

import {getAdminClient} from './adminClient'
import {REVIEW_ITEM_BY_ID_QUERY, REVIEW_QUEUE_QUERY} from './queries'
import type {ReviewItem, ReviewQueueItem} from './types'

/**
 * Admin review-queue read layer. Reads NON-published content via the tokened,
 * server-only admin client.
 *
 * Import ONLY from admin routes that have already checked the caller's Clerk
 * role (contributor / approver / admin). These helpers do not gate access
 * themselves.
 */

const FRESH = {next: {revalidate: 0}} as const

/**
 * One query, all four content types — the shared review queue (AGENTS.md §13:
 * "one queue that lists drafts/in-review items across sermons, library,
 * announcements, and events").
 */
export async function getReviewQueue(): Promise<ReviewQueueItem[]> {
  return getAdminClient().fetch(REVIEW_QUEUE_QUERY, {}, FRESH) as Promise<ReviewQueueItem[]>
}

export async function getReviewItem(id: string): Promise<ReviewItem | null> {
  return getAdminClient().fetch(REVIEW_ITEM_BY_ID_QUERY, {id}, FRESH) as Promise<ReviewItem | null>
}

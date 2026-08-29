import 'server-only'

import {createClient, type SanityClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'
import {getReadToken} from './token'

/**
 * Tokened client that CAN read drafts / in-review content.
 *
 * Use `getAdminClient()` only from server code behind a Clerk role check (the
 * admin review queue). It is the single path in the app that reads non-published
 * content.
 *
 * - `perspective: 'drafts'` — see the draft version of each document, deduped.
 * - `useCdn: false` — review data must be fresh, never a stale CDN copy.
 *
 * Built lazily so `next build` does not require the token before it is set.
 */
let cached: SanityClient | undefined

export function getAdminClient(): SanityClient {
  if (!cached) {
    cached = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: 'drafts',
      token: getReadToken(),
      stega: false,
    })
  }
  return cached
}

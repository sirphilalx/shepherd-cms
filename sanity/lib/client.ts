import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'

/**
 * Base client for PUBLIC content only.
 *
 * - `perspective: 'published'` — native Sanity drafts are never returned.
 * - no token here — `defineLive` in ./live.ts attaches the server-only token.
 * - the public fetch helpers additionally hard-filter `status == "published"`.
 *
 * For draft / in-review content use ./adminClient.ts (server-only, tokened).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: false,
})

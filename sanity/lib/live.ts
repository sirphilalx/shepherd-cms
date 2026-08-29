import 'server-only'

// Live Content API for PUBLIC published content. `<SanityLive />` must be
// rendered in the root layout. The token is attached as `serverToken` only —
// there is deliberately no `browserToken`, so no Sanity credential reaches the
// browser (live refresh degrades to server-side revalidation).
import {defineLive} from 'next-sanity/live'

import {client} from './client'

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  // No browser token, by design: no Sanity credential is shipped to the client.
  browserToken: false,
})

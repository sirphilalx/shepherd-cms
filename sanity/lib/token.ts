import 'server-only'

/**
 * Sanity read token. Server-only — this module throws if it is ever pulled into
 * a client bundle, and the variable has no NEXT_PUBLIC_ prefix so Next never
 * inlines it into browser code.
 *
 * Read lazily (at request time, not module load) so `next build` does not hard
 * require the token before it is configured. Use a Sanity **Viewer** token — it
 * can read drafts, which the review-queue helpers need. The public read path
 * filters to published content regardless.
 */
export function getReadToken(): string {
  const value = process.env.SANITY_API_READ_TOKEN
  if (!value) {
    throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
  }
  return value
}

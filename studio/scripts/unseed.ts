/**
 * Remove all sample content created by scripts/seed.ts.
 *
 * Run from studio/:
 *   npx sanity exec scripts/unseed.ts --with-user-token
 *   (or: npm run unseed)
 *
 * Deletes every document whose id starts with `seed-`
 * (seed-sermon-*, seed-library-*, seed-announcement-*, seed-event-*).
 * Uploaded PDF assets are left in place — they are content-addressed and
 * harmless; delete them from the Studio's media view if desired.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-08-29'})

async function main() {
  const before: number = await client.fetch('count(*[string::startsWith(_id, "seed-")])')
  if (before === 0) {
    console.log('No seed- documents found. Nothing to remove.')
    return
  }

  const res = await client.delete({query: '*[string::startsWith(_id, "seed-")]'})
  const removed = res.results?.length ?? before
  console.log(`Removed ${removed} seed document(s).`)

  const after: number = await client.fetch('count(*[string::startsWith(_id, "seed-")])')
  console.log(`Remaining seed- documents: ${after}`)
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schema} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

if (!projectId || !dataset) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET. Copy studio/.env.example to studio/.env.local and fill them in.',
  )
}

export default defineConfig({
  name: 'shepherd',
  title: 'Shepherd Content',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    // GROQ playground — dev aid only.
    visionTool(),
  ],
})

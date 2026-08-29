/**
 * Lets you run `$ sanity [command]` in this folder.
 * https://www.sanity.io/docs/cli
 */
import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {autoUpdates: true},
})

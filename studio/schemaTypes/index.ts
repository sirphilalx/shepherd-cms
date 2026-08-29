import {type SchemaTypeDefinition} from 'sanity'

import {announcement} from './announcement'
import {event} from './event'
import {libraryItem} from './libraryItem'
import {sermonPost} from './sermonPost'

export const CONTENT_TYPES = ['sermonPost', 'libraryItem', 'announcement', 'event'] as const

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [sermonPost, libraryItem, announcement, event],
}

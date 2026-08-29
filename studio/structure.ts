import {BellIcon, CalendarIcon, DocumentsIcon, DocumentTextIcon, InboxIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

import {CONTENT_TYPES} from './schemaTypes'

/**
 * Minimal, dev-facing desk. Real review happens in the Shepherd admin panel;
 * the "Review queue" pane here just mirrors what that queue will show.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Shepherd content')
    .items([
      S.listItem()
        .title('Review queue')
        .icon(InboxIcon)
        .child(
          S.documentList()
            .title('Awaiting review / not published')
            .filter('_type in $types && status != "published"')
            .params({types: [...CONTENT_TYPES]})
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.documentTypeListItem('sermonPost').title('Sermons').icon(DocumentTextIcon),
      S.documentTypeListItem('libraryItem').title('Library').icon(DocumentsIcon),
      S.documentTypeListItem('announcement').title('Announcements').icon(BellIcon),
      S.documentTypeListItem('event').title('Events').icon(CalendarIcon),
    ])

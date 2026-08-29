import {BellIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {WORKFLOW_GROUP, workflowFields} from './shared/workflow'

/**
 * Announcement — short and often time-sensitive (AGENTS.md §7). Carries the full
 * workflow status field like every content type; a ministry lead / admin may set
 * it straight to Published (a permission concern for the admin panel, not the
 * schema). An expired announcement (`expiresAt` in the past) is filtered out by
 * the public read layer, not unpublished by hand.
 */
export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  icon: BellIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: WORKFLOW_GROUP, title: 'Workflow'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires at',
      type: 'datetime',
      group: 'content',
      description: 'After this moment the announcement stops showing on the site and portal.',
    }),
    ...workflowFields,
  ],
  preview: {
    select: {title: 'title', status: 'status', expiresAt: 'expiresAt'},
    prepare({title, status, expiresAt}) {
      const expiry = expiresAt ? `expires ${new Date(expiresAt).toISOString().slice(0, 10)}` : null
      return {title, subtitle: [status, expiry].filter(Boolean).join(' · ')}
    },
  },
})

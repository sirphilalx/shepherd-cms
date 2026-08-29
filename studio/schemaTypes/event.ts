import {CalendarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {WORKFLOW_GROUP, workflowFields} from './shared/workflow'

/**
 * Event — listed on the public upcoming-events page, soonest first, showing only
 * events whose date is today or later (the public read layer applies the date
 * filter). No RSVP / ticketing. `ministry` is a plain string label for now.
 */
export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
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
      name: 'description',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at',
      type: 'datetime',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends at',
      type: 'datetime',
      group: 'content',
      validation: (rule) =>
        rule.custom((endsAt, context) => {
          const startsAt = (context.document as {startsAt?: string} | undefined)?.startsAt
          if (endsAt && startsAt && new Date(endsAt) < new Date(startsAt)) {
            return 'End must be after start.'
          }
          return true
        }),
    }),
    defineField({
      name: 'location',
      type: 'string',
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
      name: 'ministry',
      title: 'Owning ministry',
      type: 'string',
      group: 'content',
    }),
    ...workflowFields,
  ],
  preview: {
    select: {title: 'title', startsAt: 'startsAt', location: 'location', status: 'status'},
    prepare({title, startsAt, location, status}) {
      const when = startsAt ? new Date(startsAt).toISOString().slice(0, 10) : 'no date'
      return {title, subtitle: [when, location, status].filter(Boolean).join(' · ')}
    },
  },
})

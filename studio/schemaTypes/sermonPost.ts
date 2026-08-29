import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {WORKFLOW_GROUP, workflowFields} from './shared/workflow'

/**
 * Sermon / teaching — rendered as a blog-style post once published (AGENTS.md §7–8).
 * `speaker` and `ministry` are plain strings for now: members and ministries live
 * in Postgres and are referenced across systems by Clerk user id, not modelled here.
 */
export const sermonPost = defineType({
  name: 'sermonPost',
  title: 'Sermon',
  type: 'document',
  icon: DocumentTextIcon,
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
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date preached',
      type: 'datetime',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'speaker',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'series',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'mediaUrl',
      title: 'Audio / video link',
      type: 'url',
      group: 'content',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
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
    select: {title: 'title', speaker: 'speaker', date: 'date', status: 'status', media: 'coverImage'},
    prepare({title, speaker, date, status}) {
      const when = date ? new Date(date).toISOString().slice(0, 10) : 'no date'
      return {
        title,
        subtitle: [speaker, when, status].filter(Boolean).join(' · '),
      }
    },
  },
})

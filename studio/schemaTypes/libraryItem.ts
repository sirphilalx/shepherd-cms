import {DocumentsIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {WORKFLOW_GROUP, workflowFields} from './shared/workflow'

/**
 * Library item — one or more downloadable files (primarily PDF / PPT).
 * The frontend reads real file metadata off the asset:
 *   files[]{ title, asset->{ originalFilename, extension, mimeType, size, url } }
 */
export const libraryItem = defineType({
  name: 'libraryItem',
  title: 'Library item',
  type: 'document',
  icon: DocumentsIcon,
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
      name: 'category',
      title: 'Category / ministry tag',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'files',
      title: 'Files',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'file',
          title: 'File',
          options: {storeOriginalFilename: true},
          fields: [
            defineField({
              name: 'title',
              title: 'Label',
              type: 'string',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).error('Add at least one file.'),
    }),
    ...workflowFields,
  ],
  preview: {
    select: {title: 'title', category: 'category', status: 'status', count: 'files'},
    prepare({title, category, status, count}) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title,
        subtitle: [category, `${n} file${n === 1 ? '' : 's'}`, status].filter(Boolean).join(' · '),
      }
    },
  },
})

import {defineField} from 'sanity'

/**
 * Shared approval workflow (AGENTS.md §10). Spread `workflowFields` into every
 * content document so the admin review queue can list all types uniformly off
 * one `status` field. "Published" is the single source of truth for what is
 * public — never infer it from a date or a separate checkbox.
 */
export const WORKFLOW_STATUSES = [
  {title: 'Draft', value: 'draft'},
  {title: 'In review', value: 'in_review'},
  {title: 'Published', value: 'published'},
  {title: 'Rejected', value: 'rejected'},
] as const

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number]['value']

export const WORKFLOW_GROUP = 'workflow'

export const workflowFields = [
  defineField({
    name: 'status',
    title: 'Workflow status',
    type: 'string',
    group: WORKFLOW_GROUP,
    options: {list: [...WORKFLOW_STATUSES], layout: 'radio'},
    initialValue: 'draft',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'reviewNote',
    title: 'Reviewer note',
    type: 'text',
    rows: 3,
    group: WORKFLOW_GROUP,
    description: 'Shown to the contributor when an item is sent back. Required when status is Rejected.',
    hidden: ({parent}) => (parent as {status?: string} | undefined)?.status !== 'rejected',
    validation: (rule) =>
      rule.custom((value, context) => {
        const status = (context.parent as {status?: string} | undefined)?.status
        if (status === 'rejected' && !value?.trim()) {
          return 'Add a note explaining what needs to change.'
        }
        return true
      }),
  }),
]

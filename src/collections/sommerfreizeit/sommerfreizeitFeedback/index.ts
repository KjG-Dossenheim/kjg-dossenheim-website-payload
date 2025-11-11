import type { CollectionConfig } from 'payload'

export const sommerfreizeitFeedback: CollectionConfig = {
  slug: 'sommerfreizeitFeedback',
  labels: {
    singular: 'Feedback',
    plural: 'Feedback',
  },
  admin: {
    group: 'Sommerfreizeit',
  },
  fields: [
    {
      name: 'age',
      label: 'Alter',
      type: 'number',
      required: true,
    },
    {
      name: 'rating',
      label: 'Bewertung',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comments',
      label: 'Kommentare',
      type: 'textarea',
      required: false,
    },
  ],
}
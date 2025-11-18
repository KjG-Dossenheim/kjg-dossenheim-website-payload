import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  labels: {
    singular: 'Feedback',
    plural: 'Feedback',
  },
  admin: {
    group: 'Allgemein',
    defaultColumns: ['name', 'email', 'rating', 'createdAt'],
    useAsTitle: 'name',
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional - Ihr Name',
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      admin: {
        description: 'Optional - Wenn Sie eine Antwort wünschen',
      },
    },
    {
      name: 'rating',
      label: 'Bewertung',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Bewertung von 1 (schlecht) bis 5 (ausgezeichnet)',
      },
    },
    {
      name: 'category',
      label: 'Kategorie',
      type: 'select',
      required: false,
      options: [
        { label: 'Allgemein', value: 'general' },
        { label: 'Website', value: 'website' },
        { label: 'Veranstaltung', value: 'event' },
        { label: 'Service', value: 'service' },
        { label: 'Sonstiges', value: 'other' },
      ],
      defaultValue: 'general',
    },
    {
      name: 'message',
      label: 'Nachricht',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Ihr Feedback',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Neu', value: 'new' },
        { label: 'In Bearbeitung', value: 'in_review' },
        { label: 'Abgeschlossen', value: 'completed' },
      ],
      defaultValue: 'new',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

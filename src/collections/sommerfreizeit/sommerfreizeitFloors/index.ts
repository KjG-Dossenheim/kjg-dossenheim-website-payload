import type { CollectionConfig } from 'payload'

export const sommerfreizeitFloors: CollectionConfig = {
  slug: 'sommerfreizeitFloors',
  admin: {
    useAsTitle: 'name',
    group: 'Sommerfreizeit',
    defaultColumns: ['name', 'gender', 'freizeit'],
    hidden: true, // hide from sidebar, since this is a sub-collection of sommerfreizeitEvents
  },
  labels: {
    singular: 'Etage',
    plural: 'Etagen',
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      admin: {
        description: 'z.B. "Erdgeschoss", "1. Stock", "Dachgeschoss"',
      },
    },
    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'select',
      admin: {
        description:
          'Leer lassen für gemischte Etage. Wird überschrieben, wenn ein Zimmer ein eigenes Geschlecht hat.',
      },
      options: [
        {
          label: 'Männlich',
          value: 'male',
        },
        {
          label: 'Weiblich',
          value: 'female',
        },
      ],
    },
    {
      name: 'freizeit',
      label: 'Freizeit',
      type: 'relationship',
      relationTo: 'sommerfreizeitEvents',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

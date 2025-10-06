import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'

export const Songs: CollectionConfig = {
  slug: 'songs',
  labels: {
    singular: 'Lied',
    plural: 'Lieder',
  },

  admin: {
    defaultColumns: ['title', 'year', 'artist', 'theme'],
    useAsTitle: 'title',
    group: 'Medien',
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
    },
    ...slugField(),
    {
      name: 'theme',
      label: 'Thema',
      type: 'select',
      options: [
        { label: 'Martinsumzug', value: 'martinsumzug' },
        { label: 'Allgemein', value: 'allgemein' },
      ],
      admin: {
        description: 'Z.B. Martinsumzug',
        position: 'sidebar'
      },
    },
    {
      name: 'artist',
      label: 'Künstler',
      type: 'text',
      admin: {
        description: 'Interpret oder Band',
        position: 'sidebar'
      },
    },
    {
      name: 'year',
      label: 'Jahr',
      type: 'number',
      admin: {
        description: 'Erscheinungsjahr',
        position: 'sidebar'
      },
    },
    {
      name: 'copyright',
      label: 'Copyright',
      type: 'text',
      admin: {
        description: 'Copyright-Informationen',
        position: 'sidebar'
      },
    },
    {
      name: 'lyrics',
      label: 'Text',
      type: 'richText',
      required: true,
    },
  ],
}

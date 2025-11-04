import type { CollectionConfig } from 'payload'

export const Jahresplan: CollectionConfig = {
  slug: 'jahresplan',
  labels: {
    singular: 'Aktion',
    plural: 'Aktionen',
  },
  defaultSort: 'startDate',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'location'],
    listSearchableFields: ['title', 'startDate', 'endDate'],
    pagination: {
      defaultLimit: 25,
    },
    group: 'Aktionen',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      label: 'Startdatum',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Enddatum',
      type: 'date',
    },
    {
      name: 'description',
      label: 'Beschreibung',
      type: 'textarea',
    },
    {
      name: 'location',
      label: 'Ort',
      type: 'text',
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
    }
  ],
}

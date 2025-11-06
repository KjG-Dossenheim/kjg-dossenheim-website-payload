import type { CollectionConfig } from 'payload'

export const knallbonbonEvents: CollectionConfig = {
  slug: 'knallbonbonEvents',
  labels: {
    singular: 'Termin',
    plural: 'Termine',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: 'Knallbonbon',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
      defaultValue: 'Knallbonbon',
    },
    {
      name: 'date',
      label: 'Datum',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
          timeFormat: 'HH:mm',
        },
      },
    },
    {
      name: 'location',
      label: 'Ort',
      type: 'text',
      required: true,
    },
    {
      name: 'additionalInfo',
      label: 'Zusätzliche Informationen',
      type: 'textarea',
      required: false,
      admin: {
        rows: 2,
        description: 'Weitere Details zum Termin, z.B. Treffpunkt oder besondere Hinweise.',
      },
    },
    {
      name: 'participants',
      label: 'Anmeldungen',
      type: 'join',
      collection: 'knallbonbonRegistration',
      on: 'event',
      admin: {
        description: 'Verknüpfte Anmeldungen zu diesem Termin anzeigen.',
        allowCreate: false,
        defaultColumns: ['firstName', 'lastName', 'email'],
      },
    },
  ],
}
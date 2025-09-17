import type { CollectionConfig } from 'payload'

export const knallbonbonRegistration: CollectionConfig = {
  slug: 'knallbonbonRegistration',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  admin: {
    group: 'Knallbonbon',
    defaultColumns: ['firstNameParent', 'lastNameParent', 'email', 'event'],
    groupBy: true,
  },
  fields: [
    {
      name: 'firstNameParent',
      label: 'Vorname',
      type: 'text',
      required: true,
    },
    {
      name: 'lastNameParent',
      label: 'Nachname',
      type: 'text',
      required: true,
    },
    {
      name: 'firstNameChild',
      label: 'Vorname des Kindes',
      type: 'text',
      required: true,
    },
    {
      name: 'lastNameChild',
      label: 'Nachname des Kindes',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: false,
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      required: false,
    },
    {
      name: 'photoConsent',
      label: 'Einwilligung zur Veröffentlichung von Fotos',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'event',
      label: 'Veranstaltung',
      type: 'relationship',
      required: true,
      relationTo: 'knallbonbonEvents',
    },
  ],
}
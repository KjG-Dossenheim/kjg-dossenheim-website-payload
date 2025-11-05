import type { CollectionConfig } from 'payload'

export const knallbonbonRegistration: CollectionConfig = {
  slug: 'knallbonbonRegistration',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  admin: {
    group: 'Knallbonbon',
    defaultColumns: ['firstName', 'lastName', 'email', 'event'],
    groupBy: true,
  },
  fields: [
    {
      name: 'event',
      label: 'Veranstaltung',
      type: 'relationship',
      required: true,
      relationTo: 'knallbonbonEvents',
    },
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Nachname',
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
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
    },
    {
      name: 'child',
      label: 'Kind',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'firstName',
          label: 'Vorname des Kindes',
          type: 'text',
          required: true,
        },
        {
          name: 'lastName',
          label: 'Nachname des Kindes',
          type: 'text',
          required: true,
        },
        {
          name: 'dateOfBirth',
          label: 'Geburtsdatum des Kindes',
          type: 'date',
        },
        {
          label: 'Geschlecht des Kindes',
          type: 'select',
          name: 'gender',
          options: [
            { label: 'Männlich', value: 'male' },
            { label: 'Weiblich', value: 'female' },
            { label: 'Divers', value: 'diverse' },
            { label: 'Keine Angabe', value: 'noInfo' },
          ],
        },
        {
          name: 'pickupInfo',
          label: 'Abholung',
          type: 'select',
          options: [
            { label: 'Wird abgeholt', value: 'pickedUp' },
            { label: 'Darf alleine nach Hause gehen', value: 'goesAlone' },
          ],
        },
        {
          name: 'photoConsent',
          label: 'Einwilligung zur Veröffentlichung von Fotos',
          type: 'checkbox',
        },
        {
          name: 'healthInfo',
          label: 'Gesundheitsinformationen',
          type: 'text',
        },
      ],
    },
  ],
}
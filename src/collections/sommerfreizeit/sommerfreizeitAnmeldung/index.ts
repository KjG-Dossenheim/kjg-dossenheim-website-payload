import type { CollectionConfig } from 'payload'

export const sommerfreizeitAnmeldung: CollectionConfig = {
  slug: 'sommerfreizeitAnmeldung',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  admin: {
    group: 'Sommerfreizeit',
    defaultColumns: ['firstName', 'lastName', 'dateOfBirth'],
    groupBy: true,
  },
  fields: [
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
      name: 'dateOfBirth',
      label: 'Geburtsdatum',
      type: 'date',
      required: true,
    },
    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'select',
      required: true,
      options: [
        { label: 'Männlich', value: 'male' },
        { label: 'Weiblich', value: 'female' },
        { label: 'Divers', value: 'diverse' },
      ],
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      required: true,
    },
    {
      name: 'postalCode',
      label: 'Postleitzahl',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      label: 'Ort',
      type: 'text',
      required: true,
    },
    {
      name: 'class',
      label: 'Klasse / Jahrgangsstufe',
      type: 'select',
      required: false,
      options: [
        { label: '3. Klasse', value: '3' },
        { label: '4. Klasse', value: '4' },
        { label: '5. Klasse', value: '5' },
        { label: '6. Klasse', value: '6' },
        { label: '7. Klasse', value: '7' },
        { label: '8. Klasse', value: '8' },
        { label: '9. Klasse', value: '9' },
        { label: '10. Klasse', value: '10' },
      ],
    },
    {
      name: 'krankenversicherung',
      label: 'Krankenversicherung',
      type: 'text',
      required: true,
    },
    {
      name: 'krankenversicherungArt',
      label: 'Art der Krankenversicherung',
      type: 'select',
      required: true,
      options: [
        { label: 'Gesetzlich', value: 'gesetzlich' },
        { label: 'Privat', value: 'privat' },
      ],
    },
  ],
}
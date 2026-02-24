import type { CollectionConfig } from 'payload'
import { populateParticipantCount } from './hooks/populateParticipantCount'

export const knallbonbonEvents: CollectionConfig = {
  slug: 'knallbonbonEvents',
  labels: {
    singular: 'Termin',
    plural: 'Termine',
  },
  hooks: {
    beforeChange: [populateParticipantCount],
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
        position: 'sidebar',
        description: 'Datum und Uhrzeit der Veranstaltung',
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
      admin: {
        description: 'Veranstaltungsort',
        position: 'sidebar',
      },
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
      name: 'maxParticipants',
      label: 'Maximale Teilnehmerzahl',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Lege eine maximale Anzahl an Teilnehmern für diesen Termin fest. Lass es leer, wenn es keine Begrenzung geben soll.',
      },
    },
    {
      name: 'minAge',
      label: 'Mindestalter (Jahre)',
      type: 'number',
      required: false,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Mindestalter der Kinder zum Veranstaltungsdatum. Leer lassen für keine Begrenzung.',
      },
    },
    {
      name: 'maxAge',
      label: 'Höchstalter (Jahre)',
      type: 'number',
      required: false,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Höchstalter der Kinder zum Veranstaltungsdatum. Leer lassen für keine Begrenzung.',
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
    {
      name: 'participantCount',
      label: 'Teilnehmerzahl',
      type: 'number',
      defaultValue: 0,
      required: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      label: 'Ausgebucht',
      name: 'isFull',
      type: 'checkbox',
      admin: {
        hidden: true,
        readOnly: true,
        description: 'Automatisch gesetzt, wenn die maximale Teilnehmerzahl erreicht ist.',
      },
    }
  ],
}
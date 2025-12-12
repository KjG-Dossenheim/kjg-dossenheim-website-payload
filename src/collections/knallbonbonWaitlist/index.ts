import type { CollectionConfig } from 'payload'

import { recalculateQueuePositionsAfterChange, recalculateQueuePositionsAfterDelete } from './hooks/recalculateQueuePositions'

export const knallbonbonWaitlist: CollectionConfig = {
  slug: 'knallbonbonWaitlist',
  labels: {
    singular: 'Wartelisten-Eintrag',
    plural: 'Warteliste',
  },
  admin: {
    group: 'Knallbonbon',
    defaultColumns: ['parentName', 'event', 'status', 'queuePosition', 'promotionSentAt'],
    useAsTitle: 'parentName',
  },
  access: {
    create: () => true, // Allow public creation (handled with care in application logic)
  },
  hooks: {
    afterChange: [recalculateQueuePositionsAfterChange],
    afterDelete: [recalculateQueuePositionsAfterDelete],
  },
  fields: [
    {
      name: 'event',
      label: 'Veranstaltung',
      type: 'relationship',
      relationTo: 'knallbonbonEvents',
      required: true,
      index: true,
      admin: {
        description: 'Referenz zur Veranstaltung',
        readOnly: true,
      },
    },
    {
      name: 'parentName',
      label: 'Eltern Name',
      type: 'text',
      required: true,
      admin: {
        description: 'Vor- und Nachname des Elternteils',
        readOnly: true,
      },
    },
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'postalCode',
      label: 'Postleitzahl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'city',
      label: 'Stadt',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'children',
      labels: {
        singular: 'Kind',
        plural: 'Kinder',
      },
      type: 'array',
      required: true,
      admin: {
        readOnly: true,
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
          name: 'age',
          label: 'Alter',
          type: 'number',
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
            { label: 'Keine Angabe', value: 'noInfo' },
          ],
        },
        {
          name: 'pickupInfo',
          label: 'Abholung',
          type: 'select',
          required: true,
          options: [
            { label: 'Wird abgeholt', value: 'pickedUp' },
            { label: 'Darf alleine nach Hause gehen', value: 'goesAlone' },
          ],
        },
        {
          name: 'photoConsent',
          label: 'Fotoeinwilligung',
          type: 'checkbox',
        },
        {
          name: 'healthInfo',
          label: 'Gesundheitsinformationen',
          type: 'text',
        },
      ],
    },
    {
      name: 'childrenCount',
      label: 'Anzahl Kinder',
      type: 'number',
      required: true,
      admin: {
        description: 'Anzahl der Kinder in dieser Anmeldung',
        readOnly: true,
      },
    },
    // Waitlist Status
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Wartend', value: 'pending' },
        { label: 'Befördert', value: 'promoted' },
        { label: 'Bestätigt', value: 'confirmed' },
        { label: 'Abgelaufen', value: 'expired' },
        { label: 'Storniert', value: 'cancelled' },
      ],
      admin: {
        description: 'Aktueller Status des Wartelisten-Eintrags',
      },
    },
    {
      name: 'queuePosition',
      label: 'Position in der Warteschlange',
      type: 'number',
      required: true,
      index: true,
      admin: {
        description: 'Position in der FIFO-Warteschlange (niedrigere Nummer = früher in der Reihe)',
        readOnly: true,
      },
    },
    // Promotion & Confirmation Timestamps
    {
      name: 'promotionSentAt',
      label: 'Promotion Email gesendet am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt, wann die Benachrichtigung über verfügbare Plätze gesendet wurde',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'confirmationDeadline',
      label: 'Bestätigungsfrist',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Frist bis zur Bestätigung der Teilnahme',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'confirmedAt',
      label: 'Bestätigt am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt der Bestätigung durch Eltern',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'cancelledAt',
      label: 'Storniert am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt der Stornierung',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'expiredAt',
      label: 'Abgelaufen am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt, wann die Bestätigungsfrist abgelaufen ist',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt
}

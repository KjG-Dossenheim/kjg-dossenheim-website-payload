import type { CollectionConfig } from 'payload'

export const membershipApplication: CollectionConfig = {
  slug: 'membershipApplication',
  access: {
    create: () => true,
  },
  labels: {
    singular: 'Antrag',
    plural: 'Anträge',
  },
  admin: {
    group: 'Mitgliedschaft',
    defaultColumns: ['firstName', 'lastName', 'email', 'status'],
    groupBy: true,
    useAsTitle: 'name',
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
      name: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data = {} }) => {
            return `${data.firstName} ${data.lastName}`
          },
        ],
      },
    },
    {
      name: 'birthDate',
      label: 'Geburtsdatum',
      type: 'date',
      required: true,
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      label: 'Stadt',
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
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Neu', value: 'new' },
        { label: 'In Bearbeitung', value: 'in_review' },
        { label: 'Abgeschlossen', value: 'completed' },
        { label: 'Abgelehnt', value: 'rejected' },
      ],
      defaultValue: 'new',
      required: true,
    },
    {
      name: 'notes',
      label: 'Notizen',
      type: 'textarea',
      required: false,
    },
    {
      name: 'consentToDataProcessing',
      label: 'Einwilligung zur Datenverarbeitung',
      type: 'checkbox',
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      ({ operation, req }) => {
        if (operation === 'create') {
          req.payload.sendEmail({
            to: 'ben.wallner@kjg-dossenheim.org',
            subject: 'Neuer Mitgliedschaftsantrag eingegangen',
            text: "Ein neuer Mitgliedschaftsantrag wurde eingereicht",
          });
        }
      },
      ({ operation, doc, req }) => {
        if (operation === 'create') {
          req.payload.sendEmail({
            to: doc.email,
            subject: 'Dein Mitgliedschaftsantrag ist eingegangen',
            text: "Dein Mitgliedschaftsantrag wurde eingereicht",
          });
        }
      },
    ],
  },

}
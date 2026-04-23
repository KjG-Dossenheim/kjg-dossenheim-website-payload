import type { CollectionConfig } from 'payload'

export const sommerfreizeitEvents: CollectionConfig = {
  slug: 'sommerfreizeitEvents',
  admin: {
    group: 'Sommerfreizeit',
    useAsTitle: 'name',
    defaultColumns: ['name', 'startDate', 'endDate'],
  },
  labels: {
    singular: 'Freizeit',
    plural: 'Freizeiten',
  },
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
    },
    {
      name: "startDate",
      label: "Datum",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: "endDate",
      label: "Endet am",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'signupStartDate',
      label: 'Anmeldestart',
      type: 'date',
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'signupEndDate',
      label: 'Anmeldeschluss',
      type: 'date',
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'maxParticipants',
      label: 'Maximale Teilnehmerzahl',
      type: 'number',
      admin: {
        position: "sidebar",
      },
    },
    {
      name: 'motto',
      label: 'Motto',
      type: 'text',
      admin: {
        position: "sidebar",
      },
    },
    {
      name: 'team',
      label: 'Team',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      minRows: 2,
      required: true,
      index: true,
      admin: {
        allowCreate: false,
        allowEdit: false,
        position: "sidebar",
      },
    },
    {
      name: 'pretixEventId',
      label: 'Pretix Event ID',
      type: 'text',
      required: true,
      admin: {
        position: "sidebar",
        description: 'Wird benötigt, um die Verknüpfung mit Pretix herzustellen. Kann in den Event-Details in Pretix gefunden werden.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'unterkunft',
          label: 'Unterkunft',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'beschreibung',
              label: 'Beschreibung',
              type: 'textarea',
              required: true,
            },
            {
              name: 'website',
              label: 'Webseite',
              type: 'text',
              required: true,
            },
            {
              name: "bild",
              label: "Bild",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: 'location',
              type: 'point',
              label: 'Koordinaten',
            },
          ],
        },
        {
          name: 'preise',
          label: 'Preise',
          fields: [
            {
              name: "priceTiers",
              label: "Preisstaffelung",
              type: "join",
              collection: "sommerfreizeitPricing",
              on: "freizeit",
              admin: {
                allowCreate: false,
              }
            },
          ],
        }
      ],
    }
  ],
}
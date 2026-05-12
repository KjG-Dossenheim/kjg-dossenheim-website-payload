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
      label: "Startdatum",
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
      label: "Enddatum",
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
      name: 'signupStartDate',
      label: 'Anmeldestart',
      type: 'date',
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
      name: 'signupEndDate',
      label: 'Anmeldeschluss',
      type: 'date',
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
      name: 'motto',
      label: 'Motto',
      type: 'text',
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
              type: "array",
              required: true,
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabelName.tsx",
                },
              },
              fields: [
                {
                  name: "name",
                  label: "Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "beschreibung",
                  label: "Beschreibung",
                  type: "text",
                  required: true,
                },
                {
                  name: "price",
                  label: "Preis",
                  type: "number",
                  required: true,
                },
                {
                  name: "default",
                  label: "Standard Preisstufe",
                  type: "checkbox",
                  admin: {
                    description: "Es kann nur eine Preisstufe als Standard festgelegt werden.",
                  },
                },
                {
                  name: "eigenschaften",
                  label: "Eigenschaften",
                  type: "array",
                  required: true,
                  admin: {
                    components: {
                      RowLabel: "src/components/admin/rowLable/ArrayRowLabelName.tsx",
                    },
                  },
                  fields: [
                    {
                      name: "name",
                      label: "Name",
                      type: "text",
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Informationen',
          name: 'informationen',
          fields: [
            {
              name: 'eintrag',
              label: 'Eintrag',
              labels: {
                singular: "Eintrag",
                plural: "Einträge",
              },
              type: 'array',
              required: true,
              minRows: 1,
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
                },
              },
              fields: [
                {
                  name: 'title',
                  label: 'Titel',
                  type: 'text',
                },
                {
                  name: 'text',
                  label: 'Text',
                  type: 'richText',
                },
                {
                  name: 'links',
                  label: 'Link',
                  labels: {
                    singular: "Link",
                    plural: "Links",
                  },
                  type: 'array',
                  fields: [
                    {
                      name: 'linkText',
                      label: 'Link Text',
                      type: 'text',
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text',
                    },
                  ],
                },
              ],
            }
          ],
        },
      ],
    }
  ],
}
import type { CollectionConfig } from 'payload'

export const sommerfreizeitPricing: CollectionConfig = {
  slug: 'sommerfreizeitPricing',
  admin: {
    useAsTitle: 'name',
    group: 'Sommerfreizeit',
    groupBy: true,
    defaultColumns: ['name', 'price',],
  },
  labels: {
    singular: 'Preis',
    plural: 'Preise',
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
    {
      name: "freizeit",
      label: "Freizeit",
      type: "relationship",
      relationTo: "sommerfreizeitEvents",
      required: true,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
  ],
}
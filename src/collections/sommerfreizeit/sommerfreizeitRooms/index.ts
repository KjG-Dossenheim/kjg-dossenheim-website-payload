import type { CollectionConfig } from 'payload'
import { validateGenderHomogeneity } from './hooks/validateGenderHomogeneity'

export const sommerfreizeitRooms: CollectionConfig = {
  slug: 'sommerfreizeitRooms',
  admin: {
    useAsTitle: 'name',
    group: 'Sommerfreizeit',
    groupBy: true,
    defaultColumns: ['name', 'gender', 'capacity', 'freizeit'],
    hidden: () => process.env.NODE_ENV === 'production',
  },
  labels: {
    singular: 'Zimmer',
    plural: 'Zimmer',
  },
  hooks: {
    beforeChange: [validateGenderHomogeneity],
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
    },
    {
      name: "capacity",
      label: "Kapazität",
      type: "number",
      min: 1,
      admin: {
        description: 'Maximale Anzahl an Bewohnern. Leer lassen für unbegrenzt.',
      },
    },
    {
      name: "gender",
      label: "Geschlecht",
      type: "select",
      admin: {
        description: 'Leer lassen, damit der Algorithmus das beste Geschlecht für dieses Zimmer ermittelt.',
      },
      options: [
        {
          label: "Männlich",
          value: "male",
        },
        {
          label: "Weiblich",
          value: "female",
        }
      ],
    },
    {
      name: 'occupants',
      label: 'Bewohner',
      type: 'relationship',
      relationTo: 'sommerfreizeitAnmeldung',
      hasMany: true,
      admin: {
        description: 'Die Anmeldungen, die in diesem Zimmer wohnen. Wird automatisch basierend auf den Zimmerwünschen der Anmeldungen gefüllt.',
      },
    },
    {
      name: 'genderComposition',
      label: 'Geschlechter-Zusammensetzung',
      type: 'json',
      admin: { hidden: true },
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
    {
      name: "teamerRoom",
      label: "Teamer Zimmer",
      type: "checkbox",
      admin: {
        description: 'Wenn aktiviert, wird dieses Zimmer als Teamer-Zimmer behandelt',
      },
    },
    {
      name: 'floor',
      label: 'Etage',
      type: 'relationship',
      relationTo: 'sommerfreizeitFloors',
      admin: {
        description:
          'Die Etage, zu der dieses Zimmer gehört. Das Geschlecht der Etage wird verwendet, falls das Zimmer kein eigenes Geschlecht hat.',
      },
    },
  ],
}
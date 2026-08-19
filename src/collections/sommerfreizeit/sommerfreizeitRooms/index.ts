import type { CollectionConfig } from 'payload'
import { validateGenderHomogeneity } from './hooks/validateGenderHomogeneity'
import { syncAnmeldungRoom } from './hooks/syncAnmeldungRoom'

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
  access: {
    read: ({ req: { user } }) => {
      // Angemeldete Benutzer (Admin) sehen alle Zimmer inkl. Entwürfe.
      // Nicht angemeldete Benutzer sehen nur publizierte Zimmer sowie
      // Legacy-Zimmer ohne `_status`-Feld (vor Aktivierung der Versionen
      // angelegt), damit diese nicht aus der API verschwinden.
      if (user) return true
      return {
        or: [
          { _status: { equals: 'published' } },
          { _status: { exists: false } },
        ],
      }
    },
    create: ({ req: { user } }) => !!user && user.collection === 'users',
    update: ({ req: { user } }) => !!user && user.collection === 'users',
    delete: ({ req: { user } }) => !!user && user.collection === 'users',
  },
  hooks: {
    beforeChange: [validateGenderHomogeneity],
    afterChange: [syncAnmeldungRoom],
  },
  versions: {
    drafts: true,
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
      required: true,
      admin: {
        description: 'Maximale Anzahl an Bewohnern',
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
      maxDepth: 1,
      admin: {
        description: 'Die Anmeldungen, die in diesem Zimmer wohnen. Wird automatisch basierend auf den Zimmerwünschen der Anmeldungen gefüllt.',
      },
    },
    {
      name: 'teamerOccupants',
      label: 'Teamer',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      maxDepth: 1,
      admin: {
        description: 'Die Teamer, die in diesem Zimmer wohnen. Wird im Raumplan zugewiesen.',
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
      maxDepth: 0,
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
      maxDepth: 1,
      admin: {
        description:
          'Die Etage, zu der dieses Zimmer gehört. Das Geschlecht der Etage wird verwendet, falls das Zimmer kein eigenes Geschlecht hat.',
      },
    },
  ],
}
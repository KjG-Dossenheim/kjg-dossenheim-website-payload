import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Einstellungen',
  },
  labels: {
    singular: 'Benutzer',
    plural: 'Benutzer',
  },
  auth: {
    useAPIKey: true,
  },
  fields: [
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'teamer',
      label: 'Teamer',
      type: 'relationship',
      relationTo: 'team',
      admin: {
        position: 'sidebar',
      },
    }
  ],
}

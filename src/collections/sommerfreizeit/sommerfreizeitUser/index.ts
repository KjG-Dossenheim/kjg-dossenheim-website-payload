import type { CollectionConfig } from 'payload'

export const sommerfreizeitUser: CollectionConfig = {
  slug: 'sommerfreizeitUser',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Sommerfreizeit',
  },
  labels: {
    singular: 'Konto',
    plural: 'Konten',
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
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: false,
    },
  ],
}

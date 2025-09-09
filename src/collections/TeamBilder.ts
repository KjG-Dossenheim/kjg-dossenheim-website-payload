import type { CollectionConfig } from 'payload'

export const TeamBilder: CollectionConfig = {
  slug: 'teambilder',
  labels: {
    singular: 'Bild',
    plural: 'Bilder',
  },
  admin: {
    group: 'Team',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}

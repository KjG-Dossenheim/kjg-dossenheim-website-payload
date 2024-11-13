import type { CollectionConfig } from 'payload'

export const TeamBilder: CollectionConfig = {
  slug: 'teambilder',
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

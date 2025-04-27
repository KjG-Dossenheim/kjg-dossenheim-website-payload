import type { CollectionConfig } from 'payload'

export const TeamBilder: CollectionConfig = {
  slug: 'teambilder',
  labels: {
    singular: 'Teambild',
    plural: 'Teambilder',
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

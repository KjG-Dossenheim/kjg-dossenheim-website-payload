import { fields } from '@payloadcms/plugin-form-builder'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          label: 'Vorname',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'lastName',
          label: 'Nachname',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
}

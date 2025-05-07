import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: {
    singular: 'Teammitglied',
    plural: 'Teammitglieder',
  },
  defaultSort: 'firstName',
  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'position', 'email'],
    listSearchableFields: ['firstName', 'lastName'],
    pagination: {
      defaultLimit: 25,
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          label: 'Vorname',
          type: 'text',
          required: true,
          index: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'lastName',
          label: 'Nachname',
          type: 'text',
          required: true,
          index: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'description',
      label: 'Beschreibung',
      type: 'richText',
    },
    {
      name: 'profilePicture',
      label: 'Profilbild',
      type: 'upload',
      relationTo: 'teambilder',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'position',
      label: 'Position',
      type: 'select',
      hasMany: true,
      required: true,
      admin: {
        isClearable: true,
        isSortable: true,
      },
      options: [
        {
          label: 'Vorstand',
          value: 'vorstand',
        },
        {
          label: 'Teamer',
          value: 'teamer',
        },
        {
          label: 'Helfer',
          value: 'helfer',
        },
        {
          label: 'Ehemalige',
          value: 'ehemalige',
        },
      ],
    },
  ],
}

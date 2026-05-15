import type { CollectionConfig } from 'payload'
import { syncAnmeldungenAfterChange } from './hooks/syncAnmeldungen'

export const sommerfreizeitChild: CollectionConfig = {
  slug: 'sommerfreizeitChild',
  labels: {
    singular: 'Kind',
    plural: 'Kinder',
  },
  access: {
    create: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    read: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    update: ({ req: { user } }) => !!user && ['sommerfreizeitUsers'].includes(user.collection),
    delete: ({ req: { user } }) => !!user && ['users'].includes(user.collection),
    readVersions: ({ req: { user } }) => !!user && ['sommerfreizeitUsers'].includes(user.collection),
  },
  admin: {
    group: 'Sommerfreizeit',
    defaultColumns: ['firstName', 'lastName', 'dateOfBirth', 'parent'],
    useAsTitle: 'firstName',
  },
  hooks: {
    afterChange: [syncAnmeldungenAfterChange],
  },
  versions: {
    drafts: true,
  },
  trash: true,
  fields: [
    {
      name: 'parent',
      label: 'Konto',
      type: 'relationship',
      relationTo: 'sommerfreizeitUsers',
      required: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'anmeldungen',
      label: 'Anmeldungen',
      type: 'join',
      collection: 'sommerfreizeitAnmeldung',
      on: 'child',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
      admin: {
        readOnly: false,
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
      admin: {
        readOnly: false,
      },
    },
    {
      name: 'dateOfBirth',
      label: 'Geburtsdatum',
      type: 'date',
      required: false,
      admin: {
        readOnly: false,
        date: {
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'age',
      label: 'Alter',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Das Alter wird automatisch basierend auf dem Geburtsdatum berechnet.',
      },
    },
    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'select',
      required: false,
      options: [
        { label: 'Maennlich', value: 'male' },
        { label: 'Weiblich', value: 'female' },
        { label: 'Divers', value: 'diverse' },
      ],
      admin: {
        readOnly: false,
      },
    },
  ],
}

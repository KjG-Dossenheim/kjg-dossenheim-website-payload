import type { CollectionConfig } from 'payload'
import { cascadeDeleteAnmeldungenBeforeDelete } from './hooks/cascadeDeleteAnmeldungen'

const canManageOwnChild: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  if (user.collection === 'users') {
    return true
  }

  if (user.collection === 'sommerfreizeitUsers') {
    return {
      parent: {
        equals: user.id,
      },
    }
  }

  return false
}

export const sommerfreizeitChild: CollectionConfig = {
  slug: 'sommerfreizeitChild',
  labels: {
    singular: 'Kind',
    plural: 'Kinder',
  },
  access: {
    create: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    read: canManageOwnChild,
    update: canManageOwnChild,
    delete: canManageOwnChild,
  },
  admin: {
    group: 'Sommerfreizeit',
    defaultColumns: ['firstName', 'lastName', 'dateOfBirth', 'parent'],
    useAsTitle: 'firstName',
  },
  hooks: {
    beforeDelete: [cascadeDeleteAnmeldungenBeforeDelete],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'parent',
      label: 'Konto',
      type: 'relationship',
      relationTo: 'sommerfreizeitUsers',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: false,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'archived',
      label: 'Archiviert',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        readOnly: true,
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
      required: true,
      admin: {
        readOnly: false,
      },
    },
    {
      name: 'pretixOrderCode',
      label: 'Pretix Bestellcode',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pretixPositionId',
      label: 'Pretix Position ID',
      type: 'text',
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'select',
      required: true,
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

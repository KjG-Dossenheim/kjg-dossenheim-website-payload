import type { CollectionConfig } from 'payload'

const canReadOwnOrders: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  if (user.collection === 'users') {
    return true
  }

  if (user.collection === 'sommerfreizeitUsers') {
    if (!('email' in user) || typeof user.email !== 'string' || !user.email) {
      return false
    }

    return {
      email: {
        equals: user.email,
      },
    }
  }

  return false
}

export const sommerfreizeitOrders: CollectionConfig = {
  slug: 'sommerfreizeitOrders',
  labels: {
    singular: 'Pretix Bestellung',
    plural: 'Pretix Bestellungen',
  },
  admin: {
    group: 'Sommerfreizeit',
    useAsTitle: 'orderCode',
    defaultColumns: ['orderCode', 'status', 'email', 'pretixEventId', 'total', 'datetime'],
    components: {
      views: {
        list: {
          actions: ['@/collections/sommerfreizeit/sommerfreizeitOrders/actions/ImportPretixOrders'],
        },
      },
    },
  },
  access: {
    create: ({ req: { user } }) => !!user && user.collection === 'users',
    read: canReadOwnOrders,
    update: ({ req: { user } }) => !!user && user.collection === 'users',
    delete: ({ req: { user } }) => !!user && user.collection === 'users',
  },
  fields: [
    {
      name: 'organizer',
      label: 'Organizer',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'orderCode',
      label: 'Bestellcode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      label: 'Pretix Status',
      type: 'select',
      options: [
        { label: 'Ausstehend', value: 'n' },
        { label: 'Bezahlt', value: 'p' },
        { label: 'Abgelaufen', value: 'e' },
        { label: 'Storniert', value: 'c' }
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'require_approval',
      label: 'Benötigt Genehmigung',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'testMode',
      label: 'Testmodus',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      index: true,
    },
    {
      name: 'total',
      label: 'Gesamtpreis',
      type: 'number',
      required: false,
    },
    {
      name: 'datetime',
      label: 'Erstellt am',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'expires',
      label: 'Laeuft ab am',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'pretixEventId',
      label: 'Pretix Event ID',
      type: 'text',
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'event',
      label: 'Event',
      type: 'relationship',
      relationTo: 'sommerfreizeitEvents',
      required: false,
    },
    {
      name: 'positions',
      label: 'Positionen',
      type: 'json',
      required: false,
    },
    {
      name: 'lastImportedAt',
      label: 'Zuletzt importiert am',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'pretixPayload',
      label: 'Pretix Rohdaten',
      type: 'json',
      required: false,
      admin: {
        hidden: true,
      },
    },
  ],
}

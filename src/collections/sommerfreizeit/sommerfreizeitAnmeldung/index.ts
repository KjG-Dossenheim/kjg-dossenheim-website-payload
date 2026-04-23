import type { CollectionConfig } from 'payload'

const canManageOwnRegistration: NonNullable<CollectionConfig['access']>['read'] = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  if (user.collection === 'users') {
    return true
  }

  if (user.collection === 'sommerfreizeitUsers') {
    return {
      account: {
        equals: user.id,
      },
    }
  }

  return false
}

export const sommerfreizeitAnmeldung: CollectionConfig = {
  slug: 'sommerfreizeitAnmeldung',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  versions: {
    drafts: true,
  },
  access: {
    create: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    read: canManageOwnRegistration,
    update: canManageOwnRegistration,
    delete: canManageOwnRegistration,
  },
  admin: {
    group: 'Sommerfreizeit',
    useAsTitle: 'child',
    defaultColumns: ['pretixOrderCode', 'pretixPositionId', 'child', 'event', 'pricing', 'account'],
    groupBy: true,
  },
  fields: [
    {
      name: 'class',
      label: 'Klasse / Jahrgangsstufe',
      type: 'select',
      required: false,
      options: [
        { label: '3. Klasse', value: '3' },
        { label: '4. Klasse', value: '4' },
        { label: '5. Klasse', value: '5' },
        { label: '6. Klasse', value: '6' },
        { label: '7. Klasse', value: '7' },
        { label: '8. Klasse', value: '8' },
        { label: '9. Klasse', value: '9' },
        { label: '10. Klasse', value: '10' },
      ],
      admin: {
        readOnly: false,
      },
    },
    {
      name: 'krankenversicherung',
      label: 'Krankenversicherung',
      type: 'text',
      required: false,
    },
    {
      name: 'krankenversicherungArt',
      label: 'Art der Krankenversicherung',
      type: 'select',
      required: false,
      options: [
        { label: 'Gesetzlich', value: 'gesetzlich' },
        { label: 'Privat', value: 'privat' },
      ],
    },
    {
      name: 'krankenversicherungNummer',
      label: 'Versichertennummer',
      type: 'text',
    },
    {
      name: 'foodAllergies',
      label: 'Lebensmittelallergien',
      type: 'text',
    },
    {
      name: 'otherAllergies',
      label: 'Sonstige Allergien',
      type: 'text',
    },
    {
      name: 'medicalConditions',
      label: 'Medizinische Vorerkrankungen',
      type: 'text',
    },
    {
      name: 'medikamente',
      label: 'Medikamente',
      type: 'text',
    },
    {
      name: 'arzt',
      label: 'Arzt',
      type: 'text',
    },
    {
      name: 'arztTelefon',
      label: 'Telefonnummer des Arztes',
      type: 'text',
    },
    {
      name: 'versicherungsNummer',
      label: 'Versicherungsnummer',
      type: 'text',
    },
    {
      name: 'versicherungsAnbieter',
      label: 'Versicherungsanbieter',
      type: 'text',
    },
    {
      name: 'schwimmer',
      label: 'Schwimmer',
      type: 'checkbox',
    },
    {
      name: 'bemerkungen',
      label: 'Weitere Hinweise',
      type: 'text',
    },
    {
      name: 'account',
      label: 'Konto',
      type: 'relationship',
      relationTo: 'sommerfreizeitUsers',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'event',
      label: 'Event',
      type: 'relationship',
      relationTo: 'sommerfreizeitEvents',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'child',
      label: 'Kind',
      type: 'relationship',
      relationTo: 'sommerfreizeitChild',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pricing',
      label: 'Preisoption',
      type: 'relationship',
      relationTo: 'sommerfreizeitPricing',
      required: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pretixOrderCode',
      label: 'Pretix Bestellcode',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        hidden: true,
      },
    },
    {
      name: 'pretixPositionId',
      label: 'Pretix Position ID',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
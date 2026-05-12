import type { CollectionConfig } from 'payload'
import { syncChildDataBeforeChange } from './hooks/syncChildData'
import { populateZimmerwunschChildRelation } from './hooks/populateZimmerwunschChildRelation'


export const sommerfreizeitAnmeldung: CollectionConfig = {
  slug: 'sommerfreizeitAnmeldung',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  versions: {
    drafts: true,
  },
  trash: true,
  hooks: {
    beforeChange: [syncChildDataBeforeChange, populateZimmerwunschChildRelation],
  },
  access: {
    create: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    read: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    update: ({ req: { user } }) => !!user && ['users', 'sommerfreizeitUsers'].includes(user.collection),
    delete: ({ req: { user } }) => !!user && ['users'].includes(user.collection),
  },
  admin: {
    group: 'Sommerfreizeit',
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'event', 'account'],
    groupBy: true,
    components: {
      edit: {
        beforeDocumentControls: [
          '@/collections/sommerfreizeit/sommerfreizeitAnmeldung/beforeDocumentControls/OpenPretixOrder',
          '@/collections/sommerfreizeit/sommerfreizeitAnmeldung/beforeDocumentControls/ApprovePretixOrder'],
      },
    },
  },
  fields: [
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      admin: {
        description: 'Der Vorname des Kindes',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (data?.firstName) {
              return data.firstName
            }

            if (data?.child && typeof data.child === 'object' && 'firstName' in data.child) {
              return data.child.firstName
            }

            return null
          },
        ],
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      admin: {
        description: 'Der Nachname des Kindes',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (data?.lastName) {
              return data.lastName
            }

            if (data?.child && typeof data.child === 'object' && 'lastName' in data.child) {
              return data.child.lastName
            }

            return null
          },
        ],
      },
    },
    {
      name: 'birthDate',
      label: 'Geburtsdatum',
      type: 'date',
      admin: {
        description: 'Das Geburtsdatum des Kindes',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (data?.birthDate) {
              return data.birthDate
            }

            if (data?.child && typeof data.child === 'object' && 'birthDate' in data.child) {
              return data.child.birthDate
            }

            return null
          },
        ],
      },

    },
    {
      name: 'class',
      label: 'Klasse / Jahrgangsstufe',
      type: 'select',
      admin: {
        description: 'Z. B. 5. Klasse oder 10. Klasse',
        readOnly: true,
      },
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
    },
    {
      name: 'krankenversicherung',
      label: 'Krankenversicherung',
      type: 'text',
      admin: {
        description: 'Name der Krankenversicherung, z. B. AOK oder TK',
      },
    },
    {
      name: 'krankenversicherungArt',
      label: 'Art der Krankenversicherung',
      type: 'select',
      options: [
        { label: 'Gesetzlich', value: 'gesetzlich' },
        { label: 'Privat', value: 'privat' },
      ],
      admin: {
        description: 'Z. B. Gesetzlich oder Privat',
      },
    },
    {
      name: 'krankenversicherungNummer',
      label: 'Versichertennummer',
      type: 'text',
      admin: {
        description: 'Die Versichertennummer Ihrer Krankenversicherung',
      },
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
      name: 'medikamenteArray',
      label: 'Medikamente (Liste)',
      type: 'array',
      admin: {
        description: 'Liste der Medikamente, die das Kind regelmäßig einnimmt, inklusive Dosierung und Einnahmehinweise',
      },
      fields: [
        {
          name: 'name',
          label: 'Name des Medikaments',
          type: 'text',
          required: true,
        },
        {
          name: 'dosierung',
          label: 'Dosierung und Einnahmehinweise',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'impfungen',
      label: 'Impfungen',
      type: 'array',
      admin: {
        description: 'Liste der Impfungen, z. B. Masern, Mumps, Röteln, Tetanus',
      },
      fields: [
        {
          name: 'name',
          label: 'Name der Impfung',
          type: 'text',
        },
      ],
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
      name: 'schwimmer',
      label: 'Schwimmer',
      type: 'checkbox',
      admin: {
        description: 'Ist das Kind ein sicherer Schwimmer?',
      },
    },
    {
      name: 'zimmerwunsch',
      label: 'Zimmerwunsch',
      type: 'array',
      fields: [
        {
          name: 'firstName',
          label: 'Vorname',
          type: 'text',
          required: true,
        },
        {
          name: 'lastName',
          label: 'Nachname',
          type: 'text'
        },
        {
          name: 'childRelation',
          label: 'Verknüpftes Kind',
          type: 'relationship',
          relationTo: 'sommerfreizeitAnmeldung',
          admin: {
            hidden: true,
          },
        }
      ],
      admin: {
        description: 'Liste von Zimmerwüschen, geordnet nach Priorität.',
      },
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
      index: true,
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
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: () => false,
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
      access: {
        update: () => false,
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
        hidden: true,
      },
    },
    {
      name: 'pretixStatus',
      label: 'Pretix Status',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
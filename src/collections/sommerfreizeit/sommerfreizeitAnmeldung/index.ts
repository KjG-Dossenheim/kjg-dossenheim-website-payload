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
        position: 'sidebar',
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      admin: {
        description: 'Der Nachname des Kindes',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'dateOfBirth',
      label: 'Geburtsdatum',
      type: 'date',
      admin: {
        description: 'Das Geburtsdatum des Kindes',
        readOnly: true,
        position: 'sidebar',
        date: {
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'class',
      label: 'Klasse / Jahrgangsstufe',
      type: 'select',
      admin: {
        description: 'Z. B. 5. Klasse oder 10. Klasse',
        readOnly: true,
        position: 'sidebar',
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
      name: 'bemerkungen',
      label: 'Weitere Hinweise',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Gesundheit',
          fields: [
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
              name: 'krankenkassenKarte',
              label: 'Krankenkassenkarte',
              type: 'checkbox',
              admin: {
                description: 'Besitzen Sie eine Krankenkassenkarte für Ihr Kind?',
              },
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
              name: 'impfpass',
              label: 'Impfpass',
              type: 'checkbox',
              admin: {
                description: 'Besitzen Sie einen Impfpass für Ihr Kind?',
              },
            },
            {
              name: 'arzt',
              label: 'Arzt',
              type: 'text',
              admin: {
                description: 'Name des Arztes Ihres Kindes',
              },
            },
            {
              name: 'arztTelefon',
              label: 'Telefonnummer des Arztes',
              type: 'text',
              admin: {
                description: 'Telefonnummer des Arztes Ihres Kindes',
              },
            },
            {
              name: 'hausarztmodell',
              label: 'Teilnahme am Hausarztmodell',
              type: 'checkbox',
              admin: {
                description: 'Nimmt Ihr Kind am Hausarztmodell teil?',
              },
            },
          ]
        },
        {
          label: 'Ernährung',
          fields: [
            {
              name: 'foodAllergies',
              label: 'Lebensmittelallergien',
              type: 'text',
            },
            {
              name: `foodPreferences`,
              label: 'Ernährungspräferenzen',
              type: 'select',
              options: [
                { label: 'Keine', value: 'none' },
                { label: 'Vegetarisch', value: 'vegetarisch' },
                { label: 'Vegan', value: 'vegan' },
              ],
              admin: {
                description: 'Z. B. Vegetarisch, Vegan etc.',
              },
            },
          ]
        },
        {
          label: 'Zimmerwünsche',
          fields: [
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
                  access: {
                    update: () => false,
                  },
                }
              ],
              admin: {
                description: 'Liste von Zimmerwüschen, geordnet nach Priorität.',
              },
            },
          ],
        },
        {
          label: 'Sonstiges',
          fields: [
            {
              name: 'schwimmer',
              label: 'Schwimmer',
              type: 'checkbox',
              admin: {
                description: 'Ist das Kind ein sicherer Schwimmer?',
              },
            },
            {
              name: 'schwimmabzeichen',
              label: 'Schwimmabzeichen',
              type: 'select',
              options: [
                { label: 'Seepferdchen', value: 'seepferdchen' },
                { label: 'Bronze', value: 'bronze' },
                { label: 'Silber', value: 'silber' },
                { label: 'Gold', value: 'gold' },
              ],
              admin: {
                description: 'Falls das Kind ein Schwimmabzeichen besitzt, welches?',
              },
            },
            {
              name: 'programmTeilnahme',
              label: 'Teilnahme am Programm',
              type: 'select',
              options: [
                { label: 'Klettern', value: 'klettern' },
              ],
              admin: {
                description: 'Teilnahme am Programm?',
              },
            },
            {
              name: 'agbAkzeptiert',
              label: 'AGB akzeptiert',
              type: 'checkbox',
              required: true,
              admin: {
                description: 'Wurde den AGB zugestimmt?',
              },
            },
            {
              name: 'datenschutzAkzeptiert',
              label: 'Datenschutz akzeptiert',
              type: 'checkbox',
              required: true,
              admin: {
                description: 'Wurde der Datenschutzerklärung zugestimmt?',
              },
            },
            {
              name: 'bildrechteAkzeptiert',
              label: 'Bildrechte akzeptiert',
              type: 'checkbox',
              required: true,
              admin: {
                description: 'Wurden die Bildrechte eingeräumt?',
              },
            },
            {
              name: 'bildrechte',
              label: 'Bildrechte',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Presse- und Öffentlichkeitsarbeit', value: 'public' },
                { label: 'Interne Zwecke (z. B. Fotoalben)', value: 'internal' },
              ],
              admin: {
                description: 'Welche Bildrechte wurden eingeräumt?',
              },
            }
          ]
        }
      ]
    },
    {
      name: 'account',
      label: 'Konto',
      type: 'relationship',
      relationTo: 'sommerfreizeitUsers',
      required: true,
      index: true,
      admin: {
        description: 'Das Konto, über das die Anmeldung erfolgt ist. Wird automatisch mit den Daten des eingeloggten Users befüllt.',
        hidden: true,
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
        description: 'Das Event, für das diese Anmeldung gilt. Wird automatisch mit den Daten aus dem Account befüllt.',
        hidden: true,
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
        description: 'Das Kind, für das diese Anmeldung gilt. Wird automatisch mit den Daten aus dem Account befüllt.',
        hidden: true,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'pretixOrder',
      label: 'Pretix Bestellung',
      type: 'relationship',
      relationTo: 'sommerfreizeitOrders',
      admin: {
        description: 'Die zugehörige Bestellung in Pretix, falls vorhanden',
        hidden: false,
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
      required: true,
      admin: {
        description: 'Der Bestellcode der zugehörigen Pretix-Bestellung, z. B. ABCDE',
        hidden: true,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'pretixPositionID',
      label: 'Pretix Position ID',
      type: 'text',
      admin: {
        description: 'Die ID der zugehörigen Position in Pretix',
        hidden: true,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'pretixStatus',
      label: 'Pretix Status',
      type: 'select',
      defaultValue: 'n',
      options: [
        { label: 'Pending', value: 'n' },
        { label: 'Bezahlt', value: 'p' },
        { label: 'Abgelaufen', value: 'e' },
        { label: 'Storniert', value: 'c' }
      ],
      admin: {
        description: 'Der Status der zugehörigen Pretix-Bestellung, z. B. Pending, Bezahlt, Abgelaufen, Storniert',
        hidden: true,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'require_approval',
      label: 'Benötigt Genehmigung',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Gibt an, ob diese Anmeldung noch genehmigt werden muss. Wird automatisch auf false gesetzt, wenn die zugehörige Pretix-Bestellung bezahlt ist.',
        hidden: true,
      },
      access: {
        update: () => false,
      },
    }
  ],
}
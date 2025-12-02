import type { CollectionConfig } from 'payload'
import {
  updateEventParticipantCountAfterChange,
  updateEventParticipantCountAfterDelete,
} from './hooks/updateEventParticipantCount'

export const knallbonbonRegistration: CollectionConfig = {
  slug: 'knallbonbonRegistration',
  labels: {
    singular: 'Anmeldung',
    plural: 'Anmeldungen',
  },
  hooks: {
    afterChange: [updateEventParticipantCountAfterChange],
    afterDelete: [updateEventParticipantCountAfterDelete],
  },
  admin: {
    group: 'Knallbonbon',
    /* defaultColumns: ['firstName', 'lastName', 'email', 'event'],
    groupBy: true, */
    components: {
      /* beforeList: [
        '@/components/admin/beforeList/KnallbonbonRegistrationStats',
      ],
      afterList: ['@/components/admin/afterList/KnallbonbonRegistrationOverview'], */
      edit: {
        beforeDocumentControls: ['@/collections/knallbonbonRegistration/beforeDocumentControls/SendMail'],
      },
      views: {
        list: {
          actions: ['@/components/admin/actions/KnallbonbonRegistrationExportAction'],
          Component: '@/components/admin/views/KnallbonbonView',
        },
      },
    },
  },
  fields: [
    {
      name: 'event',
      label: 'Veranstaltung',
      type: 'relationship',
      required: true,
      relationTo: 'knallbonbonEvents',
      access: {
        create: () => false,
      },
    },
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: true,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'postalCode',
      label: 'Postleitzahl',
      type: 'text',
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'city',
      label: 'Stadt',
      type: 'text',
      admin: {
        position: "sidebar"
      }
    },
    {
      name: 'isWaitlist',
      label: 'Warteliste',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Anmeldung auf der Warteliste (automatisch gesetzt, wenn Event ausgebucht ist)',
      },
    },
    {
      name: 'promotionSentAt',
      label: 'Promotion Email gesendet am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt, wann die Benachrichtigung über verfügbare Plätze gesendet wurde',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'confirmationDeadline',
      label: 'Bestätigungsfrist',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Frist bis zur Bestätigung der Teilnahme (automatisch gesetzt)',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'confirmedAt',
      label: 'Bestätigt am',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Zeitpunkt der Bestätigung durch Eltern',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'child',
      label: 'Kind',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'firstName',
          label: 'Vorname des Kindes',
          type: 'text',
          required: true,
        },
        {
          name: 'lastName',
          label: 'Nachname des Kindes',
          type: 'text',
          required: true,
        },
        {
          name: 'fullName',
          label: 'Name',
          type: 'text',
          admin: {
            hidden: true,
          },
          hooks: {
            beforeChange: [
              async ({ siblingData }) => {
                const firstName = siblingData.firstName || ''
                const lastName = siblingData.lastName || ''
                return `${firstName} ${lastName}`.trim()
              },
            ],
          },
        },
        {
          name: 'dateOfBirth',
          label: 'Geburtsdatum des Kindes',
          type: 'date',
          required: true,
        },
        {
          name: 'age',
          label: 'Alter',
          type: 'number',
          admin: {
            readOnly: true,
          },
          hooks: {
            beforeChange: [
              async ({ siblingData }) => {
                if (siblingData.dateOfBirth) {
                  const birthDate = new Date(siblingData.dateOfBirth)
                  const currentDate = new Date()
                  let age = currentDate.getFullYear() - birthDate.getFullYear()
                  const monthDiff = currentDate.getMonth() - birthDate.getMonth()
                  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
                    age--
                  }
                  return age
                }
                return undefined
              },
            ],
          },
        },
        {
          label: 'Geschlecht des Kindes',
          type: 'select',
          name: 'gender',
          required: true,
          options: [
            { label: 'Männlich', value: 'male' },
            { label: 'Weiblich', value: 'female' },
            { label: 'Divers', value: 'diverse' },
            { label: 'Keine Angabe', value: 'noInfo' },
          ],
        },
        {
          name: 'pickupInfo',
          label: 'Abholung',
          type: 'select',
          required: true,
          options: [
            { label: 'Wird abgeholt', value: 'pickedUp' },
            { label: 'Darf alleine nach Hause gehen', value: 'goesAlone' },
          ],
        },
        {
          name: 'photoConsent',
          label: 'Einwilligung zur Veröffentlichung von Fotos',
          type: 'checkbox',
        },
        {
          name: 'healthInfo',
          label: 'Gesundheitsinformationen',
          type: 'text',
        },
      ],
    },
  ],
}
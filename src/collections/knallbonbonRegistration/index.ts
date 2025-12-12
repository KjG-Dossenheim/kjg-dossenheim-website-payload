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
        beforeDocumentControls: ['@/collections/knallbonbonRegistration/beforeDocumentControls/SendMail', '@/collections/knallbonbonRegistration/beforeDocumentControls/MoveToWaillist'],
      },
      views: {
        list: {
          actions: ['@/components/admin/Knallbonbon/Actions/ExportAction'],
          Component: '@/components/admin/Knallbonbon/Views/DefaultView',
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
        update: () => false,
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
      name: 'child',
      labels: {
        singular: 'Kind',
        plural: 'Kinder',
      },
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
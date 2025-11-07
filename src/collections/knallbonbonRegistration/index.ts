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
    defaultColumns: ['firstName', 'lastName', 'email', 'event'],
    groupBy: true,
    components: {
      beforeList: ['@/components/admin/beforeList/KnallbonbonRegistrationStats'],
      afterList: ['@/components/admin/afterList/KnallbonbonRegistrationOverview'],
    },
  },
  fields: [
    {
      name: 'event',
      label: 'Veranstaltung',
      type: 'relationship',
      required: true,
      relationTo: 'knallbonbonEvents',
    },
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
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
              async ({ siblingData, req }) => {
                if (siblingData.dateOfBirth && req.data?.event) {
                  const event = await req.payload.findByID({
                    collection: 'knallbonbonEvents',
                    id: typeof req.data.event === 'object' ? req.data.event.id : req.data.event,
                  })
                  const birthDate = new Date(siblingData.dateOfBirth)
                  const eventdate = event?.date ? new Date(event.date) : new Date()
                  let age = eventdate.getFullYear() - birthDate.getFullYear()
                  const monthDiff = eventdate.getMonth() - birthDate.getMonth()
                  if (monthDiff < 0 || (monthDiff === 0 && eventdate.getDate() < birthDate.getDate())) {
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
import type { CollectionConfig } from 'payload'
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth'

export const sommerfreizeitUser: CollectionConfig = {
  slug: 'sommerfreizeitUsers',
  auth: {
    disableLocalStrategy: true,
    strategies: [
      betterAuthStrategy({
        usersCollection: 'sommerfreizeitUsers',
        idType: 'text',
      }),
    ],
  },
  access: {
    create: () => true,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Sommerfreizeit',
    components: {
      views: {
        list: {
          actions: ['@/collections/sommerfreizeit/sommerfreizeitUser/actions/ImportPretixCustomers'],
        },
      },
    },
  },
  labels: {
    singular: 'Konto',
    plural: 'Konten',
  },
  fields: [
    {
      name: 'firstName',
      label: 'Vorname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastName',
      label: 'Nachname',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      label: 'Anzeigename',
      type: 'text',
      required: true,
      admin: {
        hidden: false,
      },
    },
    {
      name: 'emailVerified',
      label: 'E-Mail bestätigt',
      type: 'checkbox',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'image',
      label: 'Profilbild URL',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
    },
    {
      name: 'postalCode',
      label: 'Postleitzahl',
      type: 'text',
    },
    {
      name: 'city',
      label: 'Ort',
      type: 'text',
      required: false,
    },
    {
      name: 'pretix_Identifier',
      label: 'Pretix Identifier',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'children',
      label: 'Kinder',
      type: 'join',
      collection: 'sommerfreizeitChild',
      on: 'parent',
      admin: {
        allowCreate: false,
      },
    },
  ],
}

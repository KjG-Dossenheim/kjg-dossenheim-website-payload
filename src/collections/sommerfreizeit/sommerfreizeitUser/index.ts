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
          actions: ['@/components/admin/SommerfreizeitUsers/Actions/ImportPretixCustomers'],
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
      label: 'E-Mail bestaetigt',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'image',
      label: 'Profilbild URL',
      type: 'text',
      required: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: false,
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      required: false,
    },
    {
      name: 'postalCode',
      label: 'Postleitzahl',
      type: 'text',
      required: false,
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

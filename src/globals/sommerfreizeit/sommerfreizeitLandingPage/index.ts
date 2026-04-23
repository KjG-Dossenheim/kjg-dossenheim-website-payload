import { GlobalConfig } from "payload";

export const sommerfreizeitLandingPage: GlobalConfig = {
  slug: "sommerfreizeitLandingPage",
  access: {
    read: () => true,
  },
  admin: {
    group: 'Sommerfreizeit',
  },
  label: 'Landing Page',
  fields: [
    {
      name: 'freizeit',
      label: 'Freizeit',
      type: 'relationship',
      relationTo: 'sommerfreizeitEvents',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      label: 'Beschreibung',
      type: 'textarea',
    },
  ],
}
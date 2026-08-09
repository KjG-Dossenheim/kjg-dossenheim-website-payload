import { GlobalConfig } from "payload";

export const sommerfreizeitSettings: GlobalConfig = {
  slug: "sommerfreizeitSettings",
  access: {
    read: () => true,
  },
  admin: {
    group: 'Sommerfreizeit',
  },
  label: 'Einstellungen',
  fields: [
    {
      type: 'tabs',
      tabs: [
      ],
    },
  ],
}
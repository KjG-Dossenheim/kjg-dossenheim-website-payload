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
        {
          label: 'Zahlungsinformationen',
          fields: [
            {
              name: 'bankName',
              label: 'Name der Bank',
              type: 'text',
            },
            {
              name: 'iban',
              label: 'IBAN',
              type: 'text',
            },
            {
              name: 'bic',
              label: 'BIC',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
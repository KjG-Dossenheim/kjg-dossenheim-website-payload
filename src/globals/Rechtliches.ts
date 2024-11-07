import { GlobalConfig } from "payload";

export const Rechtliches: GlobalConfig = {
  slug: "rechtliches",
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Impressum',
          name: 'impressum', 
          fields: [
            {
              name: 'text',
              label: 'Inhalt',
              type: 'richText',
              required: true,
            },
          ],
        },
        {
          label: 'Datenschutz',
          name: 'datenschutz', 
          fields: [
            {
              name: 'text',
              label: 'Inhalt',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
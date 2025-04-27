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
              label: '',
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
              type: 'tabs',
              tabs: [
                {
                  label: 'Allgemein',
                  name: 'allgemein',
                  fields: [
                    {
                      name: 'text',
                      label: '',
                      type: 'richText',
                      required: true,
                    },
                  ],
                },
                {
                  label: 'Sommerfreizeit',
                  name: 'sommerfreizeit',
                  fields: [
                    {
                      name: 'text',
                      label: '',
                      type: 'richText',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'AGB',
          name: 'agb',
          fields: [
            {
              name: 'text',
              label: '',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
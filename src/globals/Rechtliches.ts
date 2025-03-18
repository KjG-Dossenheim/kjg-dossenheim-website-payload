import { GlobalConfig } from "payload";

import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical'

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
              type: 'tabs',
              tabs: [
                {
                  label: 'Allgemein',
                  name: 'allgemein',
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
                  label: 'Sommerfreizeit',
                  name: 'sommerfreizeit',
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
        },
        {
          label: 'AGB',
          name: 'agb',
          fields: [
            {
              name: 'text',
              label: 'Inhalt',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  // The HTMLConverter Feature is the feature which manages the HTML serializers.
                  // If you do not pass any arguments to it, it will use the default serializers.
                  HTMLConverterFeature({}),
                ],
              }),
            },
            lexicalHTML('text', { name: 'html' }),
          ],
        },
      ],
    },
  ],
}
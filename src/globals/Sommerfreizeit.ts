
import { GlobalConfig } from "payload";

import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical';

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Sommerfreizeit: GlobalConfig = {
  slug: "sommerfreizeit",
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allgemein',
          name: 'allgemein',
          fields: [
            {
              name: 'title',
              label: 'Titel',
              type: 'text',
              required: true,
            },
            {
              name: 'motto',
              label: 'Motto',
              type: 'text',
            },
            {
              name: 'background',
              label: 'Hintergrund',
              type: 'upload',
              relationTo: 'media',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  label: 'Startdatum',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'endDate',
                  label: 'Enddatum',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'alter',
              label: 'Alter',
              type: 'text',
              required: true,
            },
            {
              name: "pricing",
              label: "Preisstaffelung",
              labels: {
                singular: "Preisstufe",
                plural: "Preisstufen",
              },
              type: "array",
              fields: [
                {
                  name: "name",
                  label: "Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "beschreibung",
                  label: "Beschreibung",
                  type: "text",
                  required: true,
                },
                {
                  name: "price",
                  label: "Preis",
                  type: "number",
                  required: true,
                },
                {
                  name: "eigenschaften",
                  label: "Eigenschaften",
                  type: "array",
                  required: true,
                  fields: [
                    {
                      name: "name",
                      label: "Name",
                      type: "text",
                      required: true,
                    },
                  ],
                }
              ],
              minRows: 1,
              maxRows: 5,
              required: true,
            },
            {
              name: 'eigenschaften',
              label: 'Eigenschaften',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'title',
                  label: 'Titel',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  label: 'Beschreibung',
                  type: 'richText',
                  editor: lexicalEditor({
                    features: ({ defaultFeatures }) => [
                      ...defaultFeatures,
                      HTMLConverterFeature({}),
                    ],
                  }),
                },
                lexicalHTML('description', { name: 'html' }),
              ],
            }
          ],
        },
        {
          label: 'Unterkunft',
          name: 'unterkunft',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'beschreibung',
              label: 'Beschreibung',
              type: 'textarea',
              required: true,
            },
            {
              name: 'website',
              label: 'Webseite',
              type: 'text',
              required: true,
            },
            {
              name: "bild",
              label: "Bild",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
        {
          label: 'Anmeldung',
          name: 'anmeldung',
          fields: [
            {
              name: 'website',
              label: 'Webseite',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'newsletter',
          label: 'Newsletter',
          fields: [
              {
                  name: 'tes',
                  label: 'test',
                  type: 'text',
              },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
              OverviewField({
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.description',
                  imagePath: 'meta.image',
              }),
              MetaTitleField({
              }),
              MetaDescriptionField({}),
              MetaImageField({
                  relationTo: 'media',
              }),
              PreviewField({
                  // if the `generateUrl` function is configured
                  hasGenerateFn: true,
                  // field paths to match the target field for data
                  titlePath: 'meta.title',
                  descriptionPath: 'meta.description',
              }),
          ],
      },
      ],
    },
  ],
};
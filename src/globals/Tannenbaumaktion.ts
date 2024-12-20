
import { GlobalConfig } from "payload";

import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical';

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Tannenbaumaktion: GlobalConfig = {
  slug: "tannenbaumaktion",
  fields: [
    {
      label: 'Startdatum',
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'allgemein',
          label: 'Allgemein',
          fields: [
            {
              label: 'Verkaufsort',
              name: 'vekaufsort',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'adresse',
                  label: 'Adresse',
                  type: 'text',
                },
                {
                  name: 'website',
                  label: 'Webseite',
                  type: 'text',
                },
              ],
            },
            {
              label: 'Fragen',
              name: 'fragen',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'frage',
                  label: 'Frage',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  label: 'Antwort',
                  type: 'richText',
                  required: true,
                  editor: lexicalEditor({
                    features: ({ defaultFeatures }) => [
                      ...defaultFeatures,
                      HTMLConverterFeature({}),
                    ],
                  }),
                },
                lexicalHTML('answer', { name: 'answerHTML' }),
              ],
            },
          ]
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
}
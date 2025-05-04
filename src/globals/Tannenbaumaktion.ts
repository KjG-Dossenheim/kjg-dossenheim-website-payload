
import { GlobalConfig } from "payload";

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
              labels: {
                singular: 'Verkaufsort',
                plural: 'Verkaufsorte',
              },
              name: 'vekaufsort',
              type: 'array',
              required: true,
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabelName.tsx",
                },
              },
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
              labels: {
                singular: 'Frage',
                plural: 'Fragen',
              },
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
                },
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

import { GlobalConfig } from "payload";

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Tannenbaumaktion: GlobalConfig = {
  slug: "tannenbaumaktion",
  admin: {
    group: 'Aktionen',
  },
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
      type: 'group',
      name: 'meta',
      label: 'Meta',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaDescriptionField({}),
        PreviewField({
          // if the `generateUrl` function is configured
          // field paths to match the target field for URL
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
        }),
      ],
      admin: {
        position: 'sidebar',
        description: 'Meta-Daten für SEO',
      },
    },
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
          required: true,
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
  ],
}

import { GlobalConfig } from "payload";

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Adventsmarkt: GlobalConfig = {
  slug: "adventsmarkt",
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
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      label: 'Enddatum',
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      type: 'group',
      name: 'saturdayTimes',
      label: 'Zeiten (Samstag)',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          label: 'Startzeit',
          name: 'startTime',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              timeFormat: 'HH:mm',
              displayFormat: 'HH:mm',
            },
          },
        },
        {
          label: 'Endzeit',
          name: 'endTime',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              timeFormat: 'HH:mm',
              displayFormat: 'HH:mm',
            },
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'sundayTimes',
      label: 'Zeiten (Sonntag)',
      admin: {
        position: 'sidebar',
      },
      fields: [{
        label: 'Startzeit',
        name: 'startTime',
        type: 'date',
        required: true,
        admin: {
          date: {
            pickerAppearance: 'timeOnly',
            timeFormat: 'HH:mm',
            displayFormat: 'HH:mm',
          },
        },
      },
      {
        label: 'Endzeit',
        name: 'endTime',
        type: 'date',
        required: true,
        admin: {
          date: {
            pickerAppearance: 'timeOnly',
            timeFormat: 'HH:mm',
            displayFormat: 'HH:mm',
          },
        },
      },],
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
      name: 'content',
      label: 'Inhalt',
      type: 'richText',
      required: true,
    },
  ],
};
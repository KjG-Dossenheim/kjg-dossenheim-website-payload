
import { GlobalConfig } from "payload";

import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical';

export const Tannenbaumaktion: GlobalConfig = {
  slug: "tannenbaumaktion",
  fields: [
    {
      type: 'row',
      fields: [
        {
          label: 'Startdatum',
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          label: 'Startzeit',
          name: 'startTime',
          type: 'date',
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'timeOnly',
              displayFormat: 'HH:mm',
            },
          },
        },
      ],
    },
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
  ],
};
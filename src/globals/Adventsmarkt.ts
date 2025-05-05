
import { GlobalConfig } from "payload";

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Adventsmarkt: GlobalConfig = {
  slug: "adventsmarkt",
  fields: [
    {
      label: 'Startdatum',
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      label: 'Enddatum',
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
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
      name: 'content',
      label: 'Inhalt',
      type: 'richText',
      required: true,
    },
  ],
};
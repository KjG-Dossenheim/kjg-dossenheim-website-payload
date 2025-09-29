
import { GlobalConfig } from "payload";

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { revalidatePath } from "next/cache";

export const Martinsumzug: GlobalConfig = {
  slug: "martinsumzug",
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
      label: 'Startort',
      name: 'startLocation',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      label: 'Endort',
      name: 'endLocation',
      type: 'text',
      required: true,
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
    {
      name: 'songs',
      label: 'Lieder',
      type: 'relationship',
      relationTo: 'songs',
      hasMany: true,
      required: true,
      admin: {
        description: 'Wähle die Lieder für den Martinsumzug aus',
      },
    }
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          await revalidatePath('/martinsumzug');
          console.log('Revalidated /martinsumzug successfully');
        } catch (error) {
          console.error('Failed to revalidate path:', error);
        }
      }
    ],
  },
};
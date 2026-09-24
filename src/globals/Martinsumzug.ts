
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
      timezone: true,
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
          label: 'Inhalt',
          fields: [
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
            },
          ],
        },
        {
          label: 'Strecke',
          name: 'route',
          fields: [
            {
              label: 'Startort',
              name: 'startLocation',
              type: 'point',
              required: true,
            },
            {
              label: 'Endort',
              name: 'endLocation',
              type: 'point',
              required: true,
            },
            {
              label: 'Wegpunkt',
              name: 'viaLocation',
              type: 'point',
              defaultValue: [8.672022, 49.450027],
              admin: {
                description:
                  'Zwischenziel des Umzugs, z.B. Friedrichstraße. Bleibt das Feld leer, verwendet die Karte automatisch den Standard-Wegpunkt über die Friedrichstraße.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          name: 'meta',
          description: 'Meta-Daten für SEO',
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
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          await revalidatePath('/martinsumzug', 'page');
          console.log('Revalidated /martinsumzug successfully');
          await revalidatePath('/martinsumzug/lieder', 'page');
          console.log('Revalidated /martinsumzug/lieder successfully');
          await revalidatePath('/martinsumzug/lieder/[slug]', 'page');
          console.log('Revalidated /martinsumzug/lieder/[slug] successfully');
        } catch (error) {
          console.error('Failed to revalidate path:', error);
        }
      }
    ],
  },
};
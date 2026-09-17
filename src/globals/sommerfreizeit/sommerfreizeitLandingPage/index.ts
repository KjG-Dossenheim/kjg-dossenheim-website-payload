import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const sommerfreizeitLandingPage: GlobalConfig = {
  slug: 'sommerfreizeitLandingPage',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Sommerfreizeit',
  },
  label: 'Sommerfreizeit',
  fields: [
    {
      name: 'freizeit',
      label: 'Freizeit',
      type: 'relationship',
      relationTo: 'sommerfreizeitEvents',
      required: true,
      admin: {
        position: 'sidebar',
        description:
          'Die aktuell verknuepfte Freizeit. Nach ihrem Enddatum zeigt die Seite automatisch die allgemeinen Inhalte.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allgemein',
          description: 'Inhalte, die unabhaengig von der aktuellen Freizeit sind.',
          fields: [
            {
              name: 'headline',
              label: 'Ueberschrift',
              type: 'text',
              admin: {
                description:
                  'Wird im Hero angezeigt, sobald die verknuepfte Freizeit vorbei ist. Ohne Angabe wird "Sommerfreizeit" verwendet.',
              },
            },
            {
              name: 'subline',
              label: 'Unterzeile',
              type: 'text',
              admin: {
                description:
                  'Zum Beispiel "Die naechste Freizeit ist in Planung". Nur fuer die allgemeine Ansicht.',
              },
            },
            {
              name: 'heroImage',
              label: 'Hintergrundbild',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Hintergrundbild der allgemeinen Ansicht.',
              },
            },
            {
              name: 'description',
              label: 'Beschreibung',
              type: 'textarea',
              admin: {
                description: 'Einleitender Text der allgemeinen Ansicht.',
              },
            },
            {
              name: 'alter',
              label: 'Alter',
              type: 'text',
              admin: {
                description: 'Zum Beispiel "8 und 14 Jahren". Wird im Alters-Banner angezeigt.',
              },
            },
            {
              name: 'eigenschaften',
              label: 'Eigenschaften',
              type: 'array',
              admin: {
                description: 'Inhalte des Akkordeons "Was uns ausmacht".',
                components: {
                  RowLabel: 'src/components/admin/rowLable/ArrayRowLabel.tsx',
                },
              },
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
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              label: 'Meta',
              type: 'group',
              admin: {
                description: 'Meta-Daten fuer die Suchmaschinen.',
              },
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
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          revalidatePath('/sommerfreizeit')
        } catch (error) {
          console.error('Failed to revalidate:', error)
        }
      },
    ],
  },
}
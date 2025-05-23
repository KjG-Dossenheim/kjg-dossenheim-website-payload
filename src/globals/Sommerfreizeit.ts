
import { GlobalConfig } from "payload";

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Sommerfreizeit: GlobalConfig = {
  slug: "sommerfreizeit",
  access: {
    read: () => true,
  },
  admin: {
    group: 'Aktionen',
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'motto',
      label: 'Motto',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      label: 'Startdatum',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      label: 'Enddatum',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'alter',
      label: 'Alter',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'anmeldungWebsite',
      label: 'Webseite',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allgemein',
          name: 'allgemein',
          fields: [
            {
              name: "pricing",
              label: "Preisstaffelung",
              labels: {
                singular: "Preisstufe",
                plural: "Preisstufen",
              },
              type: "array",
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabelName.tsx",
                },
              },
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
                  admin: {
                    components: {
                      RowLabel: "src/components/admin/rowLable/ArrayRowLabelName.tsx",
                    },
                  },
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
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
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
            {
              label: 'Team',
              name: 'teamFreizeit',
              type: 'relationship',
              relationTo: 'team',
              hasMany: true,
              required: true,
              admin: {
                allowCreate: false,
                allowEdit: false,
              },
            },
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
          label: 'Packliste',
          name: 'packliste',
          fields: [
            {
              name: 'text',
              label: '',
              type: 'richText',
              required: true,
            }
          ],
        },
        {
          label: 'Letzten Informationen',
          name: 'informationen',
          fields: [
            {
              name: 'eintrag',
              label: 'Eintrag',
              labels: {
                singular: "Eintrag",
                plural: "Einträge",
              },
              type: 'array',
              required: true,
              minRows: 1,
              admin: {
                components: {
                  RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
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
                  name: 'text',
                  label: 'Text',
                  type: 'richText',
                  required: true,
                },
                {
                  name: 'links',
                  label: 'Link',
                  labels: {
                    singular: "Link",
                    plural: "Links",
                  },
                  type: 'array',
                  fields: [
                    {
                      name: 'linkText',
                      label: 'Link Text',
                      type: 'text',
                    },
                    {
                      name: 'link',
                      label: 'Link',
                      type: 'text',
                    },
                  ],
                },
              ],
            }
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
};
import { GlobalConfig } from "payload";
import { HTMLConverterFeature, lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical'

export const Aktionen: GlobalConfig = {
  slug: "aktionen",
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sommerfreizeit',
          name: 'sommerfreizeit',
          fields: [
            {
              type: 'tabs',
              tabs: [
                {
                  label: 'Allgemein',
                  name: 'allgemein',
                  fields: [
                    {
                      name: 'title',
                      label: 'Titel',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'motto',
                      label: 'Motto',
                      type: 'text',
                    },
                    {
                      name: 'background',
                      label: 'Hintergrund',
                      type: 'upload',
                      relationTo: 'media',
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'startDate',
                          label: 'Startdatum',
                          type: 'date',
                          required: true,
                          admin: {
                            width: '50%',
                          },
                        },
                        {
                          name: 'endDate',
                          label: 'Enddatum',
                          type: 'date',
                          required: true,
                          admin: {
                            width: '50%',
                          },
                        },
                      ],
                    },
                    {
                      name: 'alter',
                      label: 'Alter',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: "pricing",
                      label: "Preisstaffelung",
                      labels: {
                        singular: "Preisstufe",
                        plural: "Preisstufen",
                      },
                      type: "array",
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
                          editor: lexicalEditor({
                            features: ({ defaultFeatures }) => [
                              ...defaultFeatures,
                              HTMLConverterFeature({}),
                            ],
                          }),
                        },
                        lexicalHTML('description', { name: 'html' }),
                      ],
                    }
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
                  label: 'Anmeldung',
                  name: 'anmeldung',
                  fields: [
                    {
                      name: 'website',
                      label: 'Webseite',
                      type: 'text',
                      required: true,
                    },
                  ],
                }
              ],
            },
          ],
        },
        {
          label: 'Martinsumzug',
          name: 'martinsumzug',
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
                  label: 'Enddatum',
                  name: 'endDate',
                  type: 'date',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'content',
              label: 'Text',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  // The HTMLConverter Feature is the feature which manages the HTML serializers.
                  // If you do not pass any arguments to it, it will use the default serializers.
                  HTMLConverterFeature({}),
                ],
              }),
            },
            lexicalHTML('content', { name: 'html' }),
          ],
        },
        {
          label: 'Adventsmarkt',
          name: 'adventsmarkt',
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
                  label: 'Enddatum',
                  name: 'endDate',
                  type: 'date',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'content',
              label: 'Text',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  // The HTMLConverter Feature is the feature which manages the HTML serializers.
                  // If you do not pass any arguments to it, it will use the default serializers.
                  HTMLConverterFeature({}),
                ],
              }),
            },
            lexicalHTML('content', { name: 'html' }),
          ],
        },
        {
          label: 'Tannenbaumaktion',
          name: 'tannenbaumaktion',
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
        }
      ],
    },
  ],
}
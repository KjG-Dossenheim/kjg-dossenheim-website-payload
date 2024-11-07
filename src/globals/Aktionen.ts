import { GlobalConfig } from "payload";

export const Aktionen: GlobalConfig = {
  slug: "aktionen",
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
                      fields: [
                        {
                          name: 'title',
                          label: 'Titel',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'beschreibung',
                          label: 'Beschreibung',
                          type: 'textarea',
                          required: true,
                        },
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
                      type: 'text',
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
              name: 'Startdatum',
              type: 'date',
            }
          ],
        },
        {
          label: 'Adventsmarkt',
          name: 'adventsmarkt',
          fields: [
            {
              name: 'Startdatum',
              type: 'date',
            }
          ],
        },
        {
          label: 'Tannebaumaktion',
          name: 'tannebaumaktion',
          fields: [
            {
              name: 'Startdatum',
              type: 'date',
            },
            {
              label: 'Verkaufsort',
              name: 'vekaufsort',
              type: 'array',
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
            }
          ],
        }
      ],
    },
  ],
}
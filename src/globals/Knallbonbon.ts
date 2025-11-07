import { GlobalConfig } from "payload";

export const Knallbonbon: GlobalConfig = {
  slug: "knallbonbon",
  label: "Informationen",
  admin: {
    group: 'Knallbonbon',
  },
  fields: [
    {
      label: 'Titel',
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      label: 'Beschreibung',
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Kurze Beschreibung, die auf der Website angezeigt wird.',
        rows: 3,
      },
    },
    {
      label: 'Team',
      name: 'team',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      required: true,
      admin: {
        description: 'Wähle die Teammitglieder aus, die für Knallbonbon verantwortlich sind.',
      },
    },
  ],
};
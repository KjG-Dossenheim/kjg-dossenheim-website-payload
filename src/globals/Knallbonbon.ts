import { GlobalConfig } from "payload";
import { Label } from '@/components/ui/label';

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
  ],
};
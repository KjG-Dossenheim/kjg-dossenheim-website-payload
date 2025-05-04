
import { GlobalConfig } from "payload";


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
      name: 'content',
      label: '',
      type: 'richText',
      required: true,
    },
  ],
};
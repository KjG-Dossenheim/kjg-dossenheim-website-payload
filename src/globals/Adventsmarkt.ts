
import { GlobalConfig } from "payload";


export const Adventsmarkt: GlobalConfig = {
  slug: "adventsmarkt",
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
    },
  ],
};
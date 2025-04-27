
import { GlobalConfig } from "payload";


export const Martinsumzug: GlobalConfig = {
  slug: "martinsumzug",
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
      name: 'content',
      label: 'Text',
      type: 'richText',
      required: true,
    },
  ],
};

import { GlobalConfig } from "payload";

export const aktion72Stunden: GlobalConfig = {
  slug: "72stunden",
  label: "72 Stunden",
  admin: {
    group: 'Aktionen',
  },
  fields: [
    {
      name: 'startDate',
      label: 'Startdatum',
      type: 'date', required: true
    },
    {
      name: 'endDate',
      label: 'Enddatum',
      type: 'date', required: true
    },
    {
      name: 'content',
      label: 'Inhalt',
      type: 'richText',
      required: true,
    },
  ],
};

import { GlobalConfig } from "payload";

export const About: GlobalConfig = {
  slug: "about",
  label: "Über uns",
  admin: {
    group: 'Einstellungen',
  },
  fields: [
    {
      name: 'content',
      label: 'Text',
      type: 'richText',
      required: true,
    },
  ],
};

import { GlobalConfig } from "payload";

export const About: GlobalConfig = {
  slug: "about",
  label: {
    singular: "Über uns",
  },
  fields: [
    {
      name: 'content',
      label: '',
      type: 'richText',
      required: true,
    },
  ],
};
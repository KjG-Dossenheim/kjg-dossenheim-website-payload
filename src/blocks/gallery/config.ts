import { Block } from "payload";

export const Gallery: Block = {
  slug: "gallery",
  labels: {
    singular: "Gallery",
    plural: "Galleries",
  },
  fields: [
    {
      name: "image",
      label: "Image",
      type: "upload",
      relationTo: "media",
      required: true,
      hasMany: true
    },
  ],
}
import { Block } from "payload";

// NOTE: Field name uses plural 'images' to match the Gallery component props
// and the richtext lexical converter. Previously this was 'image' which
// caused the lexical block fields to not match the renderer's expected prop.

export const Gallery: Block = {
  slug: "gallery",
  labels: {
    singular: "Gallery",
    plural: "Galleries",
  },
  fields: [
    {
      name: "images",
      label: "Images",
      type: "upload",
      relationTo: "media",
      required: true,
      hasMany: true,
      minRows: 2,
    },
  ],
}
import { Block } from "payload";

export const Lyrics: Block = {
  slug: "lyrics",
  labels: {
    singular: "Lied mit Text",
    plural: "Lieder mit Text",
  },
  fields: [
    {
      name: "song",
      label: "Lied",
      type: "relationship",
      relationTo: "songs",
      required: true,
    },
    {
      name: "showMetadata",
      label: "Metadaten anzeigen",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Zeigt Künstler, Jahr und Copyright-Informationen an",
      },
    },
  ],
}

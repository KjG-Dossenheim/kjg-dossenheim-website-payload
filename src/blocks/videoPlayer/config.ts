
import { Block } from "payload";

export const videoPlayer: Block = {
  slug: "videoPlayer",
  labels: {
    singular: "Video Player",
    plural: "Video Players",
  },
  fields: [
    {
      name: "videoUrl",
      label: "Video URL",
      type: "text",
      required: true,
    },
  ],
}
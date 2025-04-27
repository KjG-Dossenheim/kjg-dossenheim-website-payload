import { Block } from "payload";

export const Image: Block = {
    slug: "image",
    labels: {
        singular: "Image",
        plural: "Images",
    },
    fields: [
        {
            name: "image",
            label: "Image",
            type: "upload",
            relationTo: "media",
            required: true,
        },
    ],
}
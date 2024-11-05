import { Block } from "payload";

export const RichText: Block = { 
    slug: "richText",
    fields: [
        {
            name: "content",
            label: "Contents",
            type: "richText",
            required: true,
        },
    ],
}
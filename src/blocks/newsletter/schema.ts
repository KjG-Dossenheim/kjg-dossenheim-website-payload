import { Block } from "payload";

export const Newsletter: Block = {
    slug: "newsletter",
    fields: [
        {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
        },
        {
            name: "subtitle",
            label: "Subtitle",
            type: "text",
            required: true,
        },
    ],
}
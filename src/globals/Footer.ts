
import { GlobalConfig } from "payload";

export const Footer: GlobalConfig = {
    slug: "footer",
    fields: [
        {
            name: "socialLinks",
            label: "Social Links",
            type: "array",
            fields: [
                {
                    name: "label",
                    label: "Label",
                    type: "text",
                    required: true,
                },
                {
                    name: "link",
                    label: "Link",
                    type: "text",
                    required: true,
                },
            ],
            minRows: 1,
            maxRows: 3,
            required: true,
        },
        {
            name: "legalLinks",
            label: "Legal Links",
            type: "array",
            fields: [
                {
                    name: "label",
                    label: "Label",
                    type: "text",
                    required: true,
                },
                {
                    name: "link",
                    label: "Link",
                    type: "text",
                    required: true,
                },
            ],
            minRows: 1,
            maxRows: 5,
            required: true,
        }
    ],
};
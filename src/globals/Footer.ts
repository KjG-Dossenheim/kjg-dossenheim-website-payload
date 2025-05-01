
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
                {
                    name: "icon",
                    label: "Icon",
                    type: "select",
                    options: [
                        {
                            label: "Facebook",
                            value: "SiFacebook",
                        },
                        {
                            label: "Instagram",
                            value: "SiInstagram",
                        },
                        {
                            label: "WhatsApp",
                            value: "SiWhatsapp",
                        },
                    ],
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
        },
        {
            name: "logo",
            label: "Logo",
            type: "upload",
            relationTo: "media",
            required: true,
            admin: {
                description: "Das Logo wird im Footer angezeigt.",
                position: "sidebar",
            },
        }
    ],
};

import { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
    slug: "header",
    fields: [
        {
            name: "logo",
            label: "Logo",
            type: "upload",
            relationTo: "media",
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: "cta",
            label: "Call to Action",
            type: 'group',
            fields: [
                {
                    name: "title",
                    label: "Title",
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
                    name: "enabled",
                    label: "Enabled",
                    type: "checkbox",
                },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: "navigation",
            label: "Navigation",
            type: "array",
            index: true,
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
            name: "aktionen",
            label: "Aktionen",
            type: "array",
            required: true,
            index: true,
            fields: [
                {
                    name: "name",
                    label: "Name",
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
        }
    ],
};
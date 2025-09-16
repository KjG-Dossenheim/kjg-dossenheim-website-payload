
import { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
  slug: "header",
  admin: {
    group: 'Einstellungen',
  },
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
          name: "url",
          label: "URL",
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
      required: true,
      minRows: 1,
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
        },
        {
          name: "url",
          label: "URL",
          type: "text",
          required: true,
        },
        {
          type: "array",
          name: "subNavigation",
          label: "Sub-Navigation",
          fields: [
            {
              name: "label",
              label: "Label",
              type: "text",
              required: true,
            },
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
              name: "url",
              label: "URL",
              type: "text",
              required: true,
            },
          ],
          minRows: 0,
          maxRows: 5,
        }
      ],
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
          name: "url",
          label: "URL",
          type: "text",
          required: true,
        },
      ],
    }
  ],
};
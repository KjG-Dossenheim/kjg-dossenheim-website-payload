import { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
  slug: "header",
  admin: {
    group: 'Einstellungen',
  },
  fields: [
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
          admin: {
            components: {
              RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
            },
          },
        }
      ],
      admin: {
        components: {
          RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
        },
      },
    },
    {
      name: "aktionen",
      label: "Aktionen",
      type: "array",
      required: true,
      index: true,
      fields: [
        {
          name: 'icon',
          label: 'Icon (SVG)',
          type: 'text',
          required: true,
          admin: {
            description: 'Name des Icons von https://lucide.dev/icons (z.B. "Calendar" für das Kalender-Icon)',
          },
        },
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
      ],
      admin: {
        components: {
          RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
        },
      },
    }
  ],
};
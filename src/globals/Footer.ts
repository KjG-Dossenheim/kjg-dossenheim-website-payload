
import { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import layout from "@/app/(website)/layout";

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: {
    group: 'Einstellungen',
  },
  fields: [
    {
      name: "socialLinks",
      label: "Social Links",
      type: "array",
      minRows: 1,
      maxRows: 3,
      required: true,
      fields: [
        {
          name: "title",
          label: "Text",
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
      admin: {
        components: {
          RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
        },
      },
    },
    {
      name: "legalLinks",
      label: "Legal Links",
      type: "array",
      minRows: 1,
      maxRows: 5,
      required: true,
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
      ],
      admin: {
        components: {
          RowLabel: "src/components/admin/rowLable/ArrayRowLabel.tsx",
        },
      },
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'phone',
      label: 'Telefonnummer',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },

    },
    {
      name: 'whatsapp',
      label: 'WhatsApp Nummer/Link',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          revalidatePath('/(website)', 'layout');
          console.log('Revalidated successfully');
        } catch (error) {
          console.error('Failed to revalidate:', error);
        }
      }
    ],
  },
};
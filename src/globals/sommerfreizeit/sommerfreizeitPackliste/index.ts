import { GlobalConfig } from "payload";

export const sommerfreizeitPackliste: GlobalConfig = {
  slug: "sommerfreizeitPackliste",
  access: {
    read: () => true,
  },
  admin: {
    group: 'Sommerfreizeit',
  },
  label: 'Packliste',
  fields: [
            {
              name: 'text',
              label: '',
              type: 'richText',
              required: true,
            }
          ],
}
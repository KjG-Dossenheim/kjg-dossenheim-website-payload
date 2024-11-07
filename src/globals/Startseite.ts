
import { GlobalConfig } from "payload";

export const Startseite: GlobalConfig = {
    slug: "startseite",
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Neuigkeiten',
                    name: 'neuigkeiten',
                    fields: [
                        {
                            name: 'title',
                            label: 'Titel',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'link',
                            label: 'Link',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'enabled',
                            label: 'Aktiviert',
                            type: 'checkbox',
                        },
                    ],
                },
            ],
        }
    ],
};
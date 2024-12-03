
import { GlobalConfig } from "payload";

import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'

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
                {
                    label: 'Newsletter',
                    name: 'newsletter',
                    fields: [
                        {
                            name: 'title',
                            label: 'Titel',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'subtitle',
                            label: 'Untertitel',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'list',
                            label: 'Liste',
                            type: 'array',
                            fields: [
                                {
                                    name: 'name',
                                    label: 'Name',
                                    type: 'text',
                                    required: true,
                                },
                                {
                                    name: 'value',
                                    label: 'Wert',
                                    type: 'text',
                                    required: true,
                                },
                                {
                                    name: 'hidden',
                                    label: 'Versteckt',
                                    type: 'checkbox',
                                }
                            ],
                            required: true,
                            minRows: 1,
                        },
                    ]
                },
                {
                    name: 'meta',
                    label: 'SEO',
                    fields: [
                        OverviewField({
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                            imagePath: 'meta.image',
                        }),
                        MetaTitleField({
                        }),
                        MetaImageField({
                            relationTo: 'media',
                        }),
                        MetaDescriptionField({}),
                        PreviewField({
                            // if the `generateUrl` function is configured
                            // field paths to match the target field for data
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                        }),
                    ],
                },
            ],
        }
    ],
};
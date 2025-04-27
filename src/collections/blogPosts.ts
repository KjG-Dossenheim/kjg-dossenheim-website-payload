import type { CollectionConfig } from 'payload'

export const blogPosts: CollectionConfig = {
  slug: 'blogPosts',
  labels: {
    singular: 'Blog Beitrag',
    plural: 'Blog Beiträge',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    }
  ],
}

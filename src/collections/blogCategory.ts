import type { CollectionConfig } from 'payload'

export const blogCategory: CollectionConfig = {
  slug: 'blogCategory',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'relatedPosts',
      type: 'join',
      collection: 'blogPosts',
      on: 'category',
    },
  ],
}
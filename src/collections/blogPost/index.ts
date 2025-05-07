import type { CollectionConfig } from 'payload'
import { formatSlug } from './hooks/formatSlug'

export const blogPosts: CollectionConfig = {
  slug: 'blogPosts',
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Blog Beitrag',
    plural: 'Blog Beiträge',
  },
  admin: {
    useAsTitle: 'title',
    preview: (doc, { req }) => `${req.protocol}//${req.host}/blog/${doc.slug}`
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
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      unique: true,
      required: true,
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'author',
      label: 'Autor',
      type: 'relationship',
      required: true,
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      label: 'Veröffentlichungsdatum',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
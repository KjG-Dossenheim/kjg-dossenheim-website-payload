import type { CollectionConfig } from 'payload'
import { formatSlug } from './hooks/formatSlug'

export const blogPosts: CollectionConfig = {
  slug: 'blogPosts',
  trash: true,
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return true
      }
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: {
      autosave: {
        showSaveDraftButton: true,
      },
      schedulePublish: true,
    },
  },
  labels: {
    singular: 'Blog Beitrag',
    plural: 'Blog Beiträge',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'createdAt', 'updatedAt', 'category'],
    // Live Preview
    // livePreview: {
    //   url: ({ data, req }) => {
    //     const path = generatePreviewPath({
    //       slug: typeof data?.slug === 'string' ? data.slug : '',
    //       collection: 'blogPosts',
    //       req,
    //     })
    //     return path
    //   },
    // },

    // Preview URL
    // preview: (data, { req }) =>
    //   generatePreviewPath({
    //     slug: typeof data?.slug === 'string' ? data.slug : '',
    //     collection: 'blogPosts',
    //     req,
    //   }),
  },
  fields: [
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: true,
    },
    {
      name: 'tableOfContents',
      label: 'Inhaltsverzeichnis',
      type: 'richText',
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
      name: 'category',
      label: 'Kategorie',
      type: 'relationship',
      relationTo: 'blogCategory',
      hasMany: true,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
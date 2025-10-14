import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { revalidatePost } from './hooks/revalidatePost'

export const blogPosts: CollectionConfig = {
  slug: 'blogPosts',
  trash: true,
  access: {
    read: ({ req }) => {
      // If there is a user logged in,
      // let them retrieve all documents
      if (req.user) return true

      // If there is no user,
      // restrict the documents that are returned
      // to only those where `_status` is equal to `published`
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  hooks: {
    afterChange: [revalidatePost],
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
    singular: 'Beitrag',
    plural: 'Beiträge',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'createdAt', 'updatedAt', 'category'],
    group: 'Blog',
    // Live Preview
    livePreview: {
      url: ({ data }) => {
        return data?.slug
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${data.slug}`
          : ''
      },
    },

    // Preview URL
    preview: (data) => {
      if (data?.slug) {
        return `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${data.slug}`
      }
      return null
    }
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
      name: 'publishedAt',
      label: 'Veröffentlicht am',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
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
    slugField({ fieldToUse: 'title' }),
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
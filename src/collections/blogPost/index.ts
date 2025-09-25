import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns';

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
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath('/blog/' + doc.slug);
      },
    ],
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
          displayFormat: 'DD.MM.YYYY HH:mm',
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
    ...slugField(),
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
    {
      name: 'relatedPosts',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        appearance: 'drawer',
        allowEdit: false,
        allowCreate: false,
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        }
      },
      hasMany: true,
      relationTo: 'blogPosts',
    },
  ],
}
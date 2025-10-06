import { getPayload } from 'payload'
import config from '@payload-config'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const payload = await getPayload({ config })
  const blogPosts = await payload.find({
    collection: 'blogPosts',
    limit: 100,
  })

  return [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...blogPosts.docs.map((post) => ({
      url: `https://acme.com/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      priority: 0.8,
    }))
  ]
}
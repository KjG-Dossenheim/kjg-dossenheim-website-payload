// app/server-sitemap-index.xml/route.ts
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'


export async function GET() {
  // Method to source urls from cms
  const payload = await getPayload({ config })
  const blogPosts = await payload.find({
    collection: 'blogPosts',
    limit: 100,
  })

  return getServerSideSitemap([
    ...blogPosts.docs.map((post) => ({
      loc: `${process.env.SITE_URL}/blog/${post.slug}`,
      lastmod: post.updatedAt,
    })),
  ])
}
// app/server-sitemap-index.xml/route.ts
import { getServerSideSitemapIndex } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'


export async function GET(request: Request) {
  // Method to source urls from cms
  const payload = await getPayload({ config })
  const blogPosts = await payload.find({
    collection: 'blogPosts',
    limit: 100,
  })

  return getServerSideSitemapIndex([
    ...blogPosts.docs.map((post) => `${process.env.SITE_URL}/blog/${post.slug}`),
  ])
}
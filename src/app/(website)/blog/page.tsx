// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { BlogPost } from '@/payload-types'

// Icons
import { Calendar } from 'lucide-react'

// Custom Components
import { BlogCard } from '@/components/features/blog/BlogCard'

// Fetch blog posts from Payload CMS
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'blogPosts',
      where: { _status: { equals: 'published' } },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        content: true,
        category: true,
        publishedAt: true,
        featuredImage: true,
      },
      sort: '-publishedAt',
      limit: 50,
    })
    // Pre-format date for each post, ensure slug is string
    return (docs || []).map((post) => ({
      ...post,
      publishedAt: post.publishedAt ? formatDate(post.publishedAt) : '',
    }))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// Format date to a readable string
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await getBlogPosts()
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="from-primary/10 to-secondary/10 relative overflow-hidden bg-gradient-to-r py-20">
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-primary mb-6 text-5xl font-bold md:text-6xl">Unser Blog</h1>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Calendar className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Noch keine Blog-Einträge</h3>
            <p className="text-muted-foreground">
              Es wurden noch keine Blog-Einträge veröffentlicht. Schauen Sie bald wieder vorbei!
            </p>
          </div>
        ) : (
          <section>
            {/* All Posts Grid */}
            <div className="mb-8">
              <h2 className="text-primary text-2xl font-bold">Alle Beiträge</h2>
              <p className="text-muted-foreground">
                {posts.length} {posts.length === 1 ? 'Beitrag' : 'Beiträge'} gefunden
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

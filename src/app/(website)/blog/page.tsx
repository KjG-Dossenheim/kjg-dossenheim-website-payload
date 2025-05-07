import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { BlogPost } from '@/payload-types' // Adjust the import path as necessary

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Calendar, Contact } from 'lucide-react'

// Fetch blog posts from Payload CMS
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Use Payload client directly
    const payload = await getPayload({
      config,
    })

    // Query posts collection
    const { docs } = await payload.find({
      collection: 'blogPosts',
      limit: 100,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    return docs || []
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
  const posts = await getBlogPosts()

  return (
    <main className="mx-auto max-w-screen-lg px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-gray-600">Keine Blog-Einträge gefunden.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="group block">
              <Card>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription className="flex flex-row gap-2">
                    {post.publishedDate && (
                      <span className="flex items-center gap-2">
                        <Calendar className="size-4" /> {formatDate(post.publishedDate)}
                      </span>
                    )}
                    {post.author && (
                      <span className="flex items-center gap-2">
                        <Contact className="size-4" />
                        {typeof post.author === 'string' ? post.author : post.author.firstName}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { BlogPost } from '@/payload-types' // Adjust the import path as necessary

import { BlogCard } from '@/components/blog/BlogCard'

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
        createdAt: true,
        author: true,
        content: true,
        category: true,
        updatedAt: true,
      },
    })
    // Pre-format date for each post, ensure slug is string
    return (docs || []).map((post) => ({
      ...post,
      createdAt: post.createdAt ? formatDate(post.createdAt) : '',
      slug: post.slug ? String(post.slug) : '',
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
  let errorMsg: string | null = null
  try {
    posts = await getBlogPosts()
  } catch (error) {
    errorMsg = 'Fehler beim Laden der Blog-Einträge.'
  }
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      {errorMsg ? (
        <p className="text-red-600">{errorMsg}</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-600">Keine Blog-Einträge gefunden.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}

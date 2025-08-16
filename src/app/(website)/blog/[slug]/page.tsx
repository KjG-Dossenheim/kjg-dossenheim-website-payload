// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { BlogPost } from '@/payload-types'

// Create a React component for the blog post page
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    // Await the params if they are a Promise
    const resolvedParams = await params
    const { slug } = resolvedParams

    const payload = await getPayload({ config })

    // Fetch the blog post using the slug
    const result = await payload.find({
      collection: 'blogPosts',
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: 'published',
        },
      },
      depth: 1,
    })

    // If no post is found, use Next.js's notFound() for proper 404 handling
    if (!result.docs.length) {
      return notFound()
    }

    const post = result.docs[0] as BlogPost

    return (
      <article className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
          {post.publishedDate && (
            <div className="mb-2 text-gray-600">
              Veröffentlichungsdatum:{' '}
              {new Date(post.publishedDate).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
          {post.author && typeof post.author !== 'string' && (
            <div className="text-gray-600">Von: {post.author.firstName}</div>
          )}
        </header>

        <div className="prose max-w-none">
          <RichText data={post.content} />
        </div>
      </article>
    )
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Error Loading Post</h1>
        <p>Sorry, there was a problem loading this blog post. Please try again later.</p>
      </div>
    )
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs: blogPosts } = await payload.find({
    collection: 'blogPosts',
    where: {
      _status: {
        equals: 'published',
      },
      slug: {
        exists: true,
      },
    },
  })

  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

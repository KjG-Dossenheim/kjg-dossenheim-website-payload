// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'

// Third-party libraries
import { RichText } from '@payloadcms/richtext-lexical/react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { BlogPost } from '@/payload-types'

// UI Components
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card'

// Create a React component for the blog post page
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  try {
    const posts = await payload.find({
      collection: 'blogPosts',
      limit: 1,
      pagination: false,
      where: {
        slug: { equals: slug },
      },
      select: {
        publishedAt: true,
        author: true,
        content: true,
        title: true,
        slug: true,
        _status: true,
      },
    })
    if (!posts?.docs?.length) return notFound()

    const post = posts.docs[0] as BlogPost

    return (
      <div className="container mx-auto">
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author:
                post.author && typeof post.author !== 'string'
                  ? {
                      '@type': 'Person',
                      name: `${post.author.firstName} ${post.author.lastName}`,
                    }
                  : undefined,
              articleBody: typeof post.content === 'string' ? post.content : undefined,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
              },
            }),
          }}
        />
        <CardHeader>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {post.publishedAt && (
            <CardDescription>
              Veröffentlicht am:{' '}
              {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          )}
          {post.author && typeof post.author !== 'string' && (
            <CardDescription>
              Autor: {post.author.firstName} {post.author.lastName}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <RichText data={post.content} />
        </CardContent>
      </div>
    )
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return notFound()
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs: blogPosts } = await payload.find({
    collection: 'blogPosts',
    pagination: false,
    where: {
      slug: {
        exists: true,
      },
      _status: {
        equals: 'published',
      },
    },
    select: {
      slug: true,
      _status: true,
    },
  })

  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

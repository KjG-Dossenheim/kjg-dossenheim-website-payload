// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'

import { CardContent, CardDescription, CardHeader } from '@/components/ui/card'

import type { BlogPost } from '@/payload-types'

// Create a React component for the blog post page
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  let post: BlogPost | undefined
  try {
    const posts = await payload.find({
      collection: 'blogPosts',
      draft,
      limit: 1,
      overrideAccess: draft,
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      select: {
        publishedAt: true,
        author: true,
        content: true,
        title: true,
        slug: true,
      },
    })
    if (!posts?.docs?.length) return notFound()
    post = posts.docs[0] as BlogPost
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return notFound()
  }

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
            datePublished: post.createdAt,
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
              '@id': `${process.env.SITE_URL}/blog/${post.slug}`,
            },
          }),
        }}
      />
      {draft && <RefreshRouteOnSave />}
      <CardHeader>
        <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
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

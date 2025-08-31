// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { BlogPost } from '@/payload-types'

// Create a React component for the blog post page
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params if they are a Promise
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams

    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config })

    // Fetch the blog post using the slug
    const posts = await payload.find({
      collection: 'blogPosts',
      // overrideAccess: false,
      draft,
      limit: 1,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: 'published',
        },
      },
    })

    if (!posts?.docs?.length) {
      notFound()
    }

    const post = posts.docs[0] as BlogPost

    return (
      <Card className="mx-auto my-12 w-full max-w-3xl">
        {draft && <RefreshRouteOnSave />}
        <CardHeader>
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
          {post.createdAt && (
            <CardDescription>
              Datum:{' '}
              {new Date(post.createdAt).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          )}
          {post.updatedAt && (
            <CardDescription>
              Aktualisiert am:{' '}
              {new Date(post.updatedAt).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
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
          {post.tableOfContents && post.tableOfContents?.root?.direction !== null && (
            <Card>
              <CardHeader>
                <CardDescription>Inhaltsverzeichnis</CardDescription>
              </CardHeader>
              <CardContent>
                <RichText data={post.tableOfContents} />
              </CardContent>
            </Card>
          )}
          <RichText data={post.content} />
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error fetching blog post:', error)
    notFound()
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

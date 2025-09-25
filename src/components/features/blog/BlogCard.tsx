import React from 'react'
import Link from 'next/link'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Calendar, Contact } from 'lucide-react'

import type { BlogPost } from '@/payload-types'

export function BlogCard({ post }: { post: BlogPost }) {
  const { slug, id, publishedAt, title, author } = post
  return (
    <div key={id}>
      <CardHeader>
        <CardTitle className="hover:underline">
          <Link href={`/blog/${slug}`}>{title}</Link>
        </CardTitle>
        <CardDescription className="flex flex-row gap-2">
          {publishedAt && (
            <span className="flex items-center gap-2">
              <Calendar className="size-4" /> {publishedAt}
            </span>
          )}
          {author && (
            <span className="flex items-center gap-2">
              <Contact className="size-4" />
              {typeof author === 'string' ? author : author.firstName}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href={`/blog/${slug}`}
          target="_blank"
          className="text-foreground flex items-center hover:underline"
        >
          Mehr lesen
          <ArrowRight className="ml-2 size-4" />
        </a>
      </CardFooter>
    </div>
  )
}

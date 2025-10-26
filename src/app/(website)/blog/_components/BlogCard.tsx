import React from 'react'
import Link from 'next/link'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, User } from 'lucide-react'

import type { BlogPost } from '@/payload-types'

export function BlogCard({ post }: { post: BlogPost }) {
  const { slug, publishedAt, title, author } = post

  return (
    <Card className="hover:shadow-x h-full overflow-hidden shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
      {/* Card Image Placeholder */}
      <div className="from-primary/10 to-accent/10 aspect-4/3 overflow-hidden bg-linear-to-br">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="bg-primary/20 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full">
              <Calendar className="text-primary h-4 w-4" />
            </div>
            <p className="text-muted-foreground text-xs">Bild</p>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight">
          <Link
            href={`/blog/${slug}`}
            className="text-foreground hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </CardTitle>
        {/* Meta Information */}
        <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
          {publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {publishedAt}
            </span>
          )}
          {author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {typeof author === 'string' ? author : author.firstName || 'Autor'}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="group w-full justify-between">
          <Link href={`/blog/${slug}`}>
            Mehr lesen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Media } from '@/payload-types'

interface AccommodationSectionProps {
  unterkunft: {
    name: string
    beschreibung: string
    website: string
    bild: string | Media
  }
}

export default function AccommodationSection({ unterkunft }: AccommodationSectionProps) {
  return (
    <section className="mx-auto max-w-(--breakpoint-md) p-6">
      <Card className="mx-auto w-full max-w-sm pt-0">
        {unterkunft.bild && typeof unterkunft.bild !== 'string' && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={unterkunft.bild.url || ''}
              alt={unterkunft.bild.alt || 'Unterkunft Bild'}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              priority
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{unterkunft.name}</CardTitle>
          <CardDescription>{unterkunft.beschreibung}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={unterkunft.website} target="_blank">
              Weitere Informationen
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}

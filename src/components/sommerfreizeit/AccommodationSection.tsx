import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <section className="mx-auto max-w-(--breakpoint-md)">
      <Card className="flex h-full w-full flex-col md:flex-row">
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Unterkunft</CardTitle>
          </CardHeader>
          <CardContent className="grow">
            <p>{unterkunft.beschreibung}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={unterkunft.website} target="_blank">
                {unterkunft.name}
              </Link>
            </Button>
          </CardFooter>
        </div>
        <div className="relative m-6 h-64 md:h-auto md:w-1/2">
          {unterkunft.bild && typeof unterkunft.bild !== 'string' && (
            <Image
              src={unterkunft.bild.url || ''}
              alt={unterkunft.bild.alt || 'Unterkunft Bild'}
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fill
              priority
            />
          )}
        </div>
      </Card>
    </section>
  )
}

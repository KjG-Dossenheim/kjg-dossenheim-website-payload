import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Media } from '@/payload-types'
import { SommerfreizeitMap } from './SommerfreizeitMap'

interface AccommodationSectionProps {
  unterkunft: {
    name: string
    beschreibung: string
    website: string
    bild: string | Media
    location?: [number, number] | null
  }
}

export default function AccommodationSection({ unterkunft }: AccommodationSectionProps) {
  return (
    <section className="">
      <section className="mx-auto max-w-(--breakpoint-md) space-y-6 p-6">
        <h2 className="text-center text-4xl font-bold sm:text-5xl">Unsere Unterkunft</h2>
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
            <Link
              href={unterkunft.website}
              target="_blank"
              className={buttonVariants({ variant: 'default' })}
            >
              Weitere Informationen
            </Link>
          </CardFooter>
        </Card>
      </section>
      {/* {unterkunft.location && (
        <section>
          <SommerfreizeitMap
            lng={unterkunft.location[1]}
            lat={unterkunft.location[0]}
            name={unterkunft.name}
          />
        </section>
      )} */}
    </section>
  )
}

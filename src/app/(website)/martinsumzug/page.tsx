// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Song, Martinsumzug } from '@/payload-types'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

// UI Components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'
import { buttonVariants } from '@/components/ui/button'

// Icons
import { ArrowRight } from 'lucide-react'

// Custom Components
import Countdown from '@/components/common/Countdown'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { formatInTimeZone } from 'date-fns-tz'
import { MartinsumzugMap } from './MartinsumzugMap'

export function generateMetadata(): Metadata {
  return {
    title: `Martinsumzug | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Der Martinsumzug der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  }
}

export default async function Page() {
  const payload = await getPayload({ config })

  const martinsumzug = (await payload.findGlobal({
    slug: 'martinsumzug',
  })) as {
    startDate: Martinsumzug['startDate']
    //startLocation: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any
    songs: Song[]
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Martinsumzug ${formatDateLocale(martinsumzug.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(
      martinsumzug.startDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      "yyyy-MM-dd'T'HH:mm:ssxxx",
    ),
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Dossenheim',
    },
    description: `Der Martinsumzug der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    organizer: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Hero Section */}
      <div className="relative flex h-160 w-full flex-col items-center justify-center bg-neutral-900">
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center text-white">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              Martinsumzug {formatDateLocale(martinsumzug.startDate, 'yyyy')}
            </h1>
          </div>
          <div>
            <p className="mx-auto text-xl">
              {formatDateLocale(martinsumzug.startDate, 'EEEE, d. MMMM')}
              {' ab '}
              {formatDateLocale(martinsumzug.startDate, 'HH:mm')}
            </p>
          </div>
          <div>
            <Countdown targetDate={martinsumzug.startDate} />
          </div>
        </div>
        <ShootingStars
          minSpeed={10}
          maxSpeed={30}
          minDelay={1200}
          maxDelay={4200}
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          starWidth={10}
          starHeight={1}
        />
        <StarsBackground
          starDensity={0.0005}
          allStarsTwinkle={true}
          twinkleProbability={0.7}
          minTwinkleSpeed={0.5}
          maxTwinkleSpeed={1}
        />
      </div>
      <section className="flex flex-col justify-center md:flex-row md:items-stretch">
        <Card className="mx-auto max-w-md rounded-none md:self-start">
          <CardHeader>
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <span className="bg-primary h-8 w-1 rounded-full"></span>
              Über die Veranstaltung
            </h2>
          </CardHeader>
          <CardContent>
            <RichText data={martinsumzug.content} />
          </CardContent>
        </Card>
        <MartinsumzugMap />
      </section>
    </section>
  )
}

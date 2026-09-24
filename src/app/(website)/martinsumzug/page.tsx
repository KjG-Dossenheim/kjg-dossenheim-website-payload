// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Song } from '@/payload-types'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

// UI Components
import { ArrowRight, Music } from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'
import { buttonVariants } from '@/components/ui/button'

// Custom Components
import Countdown from '@/components/common/Countdown'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { formatInTimeZone } from 'date-fns-tz'
import { MartinsumzugMap } from './MartinsumzugMap'

// Utilities
import { isMartinsumzugToday, MARTINSUMZUG_DEFAULT_ROUTE } from '@/utilities/martinsumzug'
import { getWalkingRoute } from '@/utilities/valhalla'

export function generateMetadata(): Metadata {
  return {
    title: `Martinsumzug | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Der Martinsumzug der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  }
}

export default async function Page() {
  const payload = await getPayload({ config })

  const martinsumzug = await payload.findGlobal({
    slug: 'martinsumzug',
  })

  /*
   * The walking route is resolved here rather than in the map component: the
   * routing API then never has to send CORS headers, and Next.js caches the
   * response with the page instead of calling upstream on every visit.
   *
   * Each point falls back to the coordinate the map used to hardcode, so a
   * point field that was never filled in can't strip the route from the map.
   * `route` itself is optional too: documents saved before the "Strecke" tab
   * existed carry no `route` group at all.
   */
  const routeStart = martinsumzug.route?.startLocation ?? MARTINSUMZUG_DEFAULT_ROUTE.start
  const routeVia = martinsumzug.route?.viaLocation ?? MARTINSUMZUG_DEFAULT_ROUTE.via
  const routeEnd = martinsumzug.route?.endLocation ?? MARTINSUMZUG_DEFAULT_ROUTE.end
  const route = await getWalkingRoute([routeStart, routeVia, routeEnd])

  // `songs` is a populated relationship, but Payload still types it as a union
  // with the raw IDs — keep only the documents we can link to.
  const songs = martinsumzug.songs.filter(
    (song): song is Song => typeof song === 'object' && song !== null,
  )

  // The song pages only resolve on the day of the event.
  const isToday = isMartinsumzugToday(martinsumzug.startDate)

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
      <section className="relative flex h-screen w-full flex-col items-center justify-center gap-8 bg-neutral-900 px-6 py-24">
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
        {/*
         * Outside the `text-center` block above so the card's own copy stays
         * left-aligned.
         */}
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
      </section>
      <section>
        <Card className="mx-auto w-full gap-0 py-0 md:flex-row md:items-stretch">
          {/* Text column — CardHeader/CardContent keep their built-in `px-6`. */}
          <div className="flex flex-col gap-6 py-6 md:w-full md:max-w-md">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <span className="bg-primary h-8 w-1 rounded-full"></span>
                Über die Veranstaltung
              </h2>
            </CardHeader>
            <CardContent>
              <RichText data={martinsumzug.content} />
            </CardContent>
            {songs.length > 0 && (
              <div className="flex flex-col items-stretch gap-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold">Lieder</CardTitle>
                  <CardAction>
                    <Link
                      href="/martinsumzug/lieder"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
                    >
                      Alle Lieder
                      <ArrowRight className="size-4" />
                    </Link>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    {songs.map((song) => (
                      <li key={song.id}>
                        <Link
                          href={`/martinsumzug/lieder/${song.slug}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          <Music />
                          {song.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {!isToday && (
                  <CardFooter>
                    <p className="text-muted-foreground text-xs">
                      Die Liedertexte sind am Umzugstag verfügbar.
                    </p>
                  </CardFooter>
                )}
              </div>
            )}
          </div>
          {/* Map column — stretched to the text column's height from `md` up. */}
          <MartinsumzugMap
            className="md:min-w-0 md:flex-1"
            route={route}
            start={routeStart}
            end={routeEnd}
          />
        </Card>
      </section>
    </section>
  )
}

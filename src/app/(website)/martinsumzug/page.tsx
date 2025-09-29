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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShootingStars } from '@/components/ui/shooting-stars'
import { StarsBackground } from '@/components/ui/stars-background'
import { Button } from '@/components/ui/button'

// Icons
import { MapPin } from 'lucide-react'

// Custom Components
import Date from '@/components/common/date'
import Countdown from '@/components/common/Countdown'

export function generateMetadata(): Metadata {
  return {
    title: 'Martinsumzug | KjG Dossenheim',
    description: 'Der Martinsumzug der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })

  const martinsumzug = (await payload.findGlobal({
    slug: 'martinsumzug',
  })) as {
    startDate: string
    startLocation: string
    content: any
    songs: Song[]
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative flex h-[40rem] w-full flex-col items-center justify-center bg-neutral-900">
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Martinsumzug <Date dateString={martinsumzug.startDate} formatString="yyyy" />
            </h1>
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="mx-auto text-xl">
                <Date dateString={martinsumzug.startDate} formatString="EEEE, d. MMMM" />
                {' ab '}
                <Date dateString={martinsumzug.startDate} formatString="HH:mm" />
              </p>
              <p className="mx-auto flex items-center justify-center gap-2 text-xl">
                <MapPin className="size-5" />
                {martinsumzug.startLocation}
              </p>
              <p className="mx-auto text-center text-xl">
                Begleiten Sie uns bei unserem traditionellen Martinsumzug durch Dossenheim
              </p>
              <Countdown targetDate={martinsumzug.startDate} />
            </div>
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
      <div className="container mx-auto flex flex-col gap-6 p-6">
        <Card className="mx-auto max-w-lg">
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
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Lieder</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {martinsumzug.songs?.map((song) => (
              <Card key={song.id}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{song.title}</h3>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href={`/songs/${song.slug}`}>Zum Lied</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

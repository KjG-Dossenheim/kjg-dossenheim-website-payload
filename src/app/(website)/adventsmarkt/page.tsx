// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Third-party libraries
import { parseISO } from 'date-fns'
import { Snowflake, MapPin } from 'lucide-react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// Custom Components
import Date from '@/components/common/date'
import { RichText } from '@/components/utils/RichText'
import Countdown from '@/components/common/Countdown'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SparklesCore } from '@/components/ui/sparkles'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'adventsmarkt',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const adventsmarkt = await getData()
  return {
    title: `${adventsmarkt.meta?.title} | KjG Dossenheim`,
    description: `${adventsmarkt.meta?.description}`,
  }
}

export default async function Page() {
  const adventsmarkt = await getData()

  // Check if the event date has passed
  const eventStartDate = parseISO(adventsmarkt.startDate)
  const currentDate = new globalThis.Date()
  const isUpcoming = eventStartDate > currentDate

  return (
    <div>
      {/* Hero Section */}
      <div className="relative flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden bg-radial from-red-700 from-40% to-red-900">
        <div className="absolute inset-0 h-screen w-full">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="h-full w-full"
          />
        </div>
        <div className="relative container mx-auto flex flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          {/* Main Title */}
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl">
              Adventsmarkt <Date dateString={adventsmarkt.startDate} formatString="yyyy" />
            </h1>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex flex-col items-center justify-center text-2xl font-medium md:flex-row md:gap-2 md:text-3xl">
                <Date dateString={adventsmarkt.startDate} formatString="d. MMMM" />
                <span>bis</span>
                <Date dateString={adventsmarkt.endDate} formatString="d. MMMM yyyy" />
              </div>
              <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
                <MapPin className="size-6" />
                <span>Vorplatz der kath. Kirche in Dossenheim</span>
              </div>
            </div>
          </div>

          {/* Countdown (only show if upcoming) */}
          {isUpcoming && (
            <div className="mb-8">
              <Countdown
                targetDate={adventsmarkt.startDate}
                bgColor="bg-emerald-700"
                textColor="text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <section className="container mx-auto p-6">
        <Card>
          <CardHeader className="rounded-t-lg bg-gradient-to-r from-red-700 to-emerald-700 text-white">
            <CardTitle className="flex items-center gap-3">
              <Snowflake className="size-6" />
              Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  <Date dateString={adventsmarkt.startDate} formatString="EEEE, d. MMMM" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Start:{' '}
                  <Date dateString={adventsmarkt.saturdayTimes.startTime} formatString="HH:mm" />{' '}
                  Uhr
                </p>
                <p>
                  Ende:{' '}
                  <Date dateString={adventsmarkt.saturdayTimes.endTime} formatString="HH:mm" /> Uhr
                </p>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  <Date dateString={adventsmarkt.endDate} formatString="EEEE, d. MMMM" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Start:{' '}
                  <Date dateString={adventsmarkt.sundayTimes.startTime} formatString="HH:mm" /> Uhr
                </p>
                <p>
                  Ende: <Date dateString={adventsmarkt.sundayTimes.endTime} formatString="HH:mm" />{' '}
                  Uhr
                </p>
              </CardContent>
            </Card>
          </CardContent>
          <CardContent className="p-6">
            <div>
              <RichText data={adventsmarkt.content} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

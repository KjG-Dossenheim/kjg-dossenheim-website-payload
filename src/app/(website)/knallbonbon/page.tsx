export const revalidate = 60 // seconds (regenerate every 1 minute)

// React and Next.js
import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Knallbonbon, KnallbonbonEvent } from '@/payload-types'

// UI Components
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QRCode } from '@/components/ui/shadcn-io/qr-code'

// Custom Components
import { formatDateLocale } from '@/components/common/formatDateLocale'
import LogoEvangelisch from '@/graphics/logo/LogoEvangelisch'
import { User, QrCode, Mail } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function generateMetadata(): Metadata {
  return {
    title: `Knallbonbon | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Der Knallbonbon der Evangelischen Kirchengemeinde Dossenheim',
  }
}

// Extracted event card component for better readability and performance
function EventCard({ event }: { event: KnallbonbonEvent }) {
  return (
    <Card key={event.id} className="mb-4">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          {formatDateLocale(event.date, "EEEE, d. MMMM yyyy 'um' H:mm")}
        </CardDescription>
        <CardDescription>Ort: {event.location}</CardDescription>
      </CardHeader>
      {event.additionalInfo && (
        <div className="px-6 pb-4">
          <h3 className="font-medium">Zusätzliche Informationen:</h3>
          <p className="text-muted-foreground text-sm">{event.additionalInfo}</p>
        </div>
      )}
      <CardFooter>
        <Button asChild>
          <Link href="/knallbonbon/anmeldung">
            <User />
            Anmelden
          </Link>
        </Button>
        <Dialog>
          <Button asChild variant="outline" className="ml-2">
            <DialogTrigger>
              <QrCode />
              QR Code
            </DialogTrigger>
          </Button>
          <DialogContent className="w-sm">
            <DialogHeader>
              <DialogTitle>Scanne den QR-Code</DialogTitle>
            </DialogHeader>
            <div>
              <QRCode data={`${process.env.NEXT_PUBLIC_SITE_URL}/knallbonbon/anmeldung`} />
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

// Empty state component
function NoEventsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keine Veranstaltungen</CardTitle>
        <CardDescription>
          Aktuell sind keine Knallbonbon-Veranstaltungen geplant. Schaue bald wieder vorbei!
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export default async function Page() {
  const payload = await getPayload({ config })

  // Fetch data in parallel for better performance
  const [knallbonbon, knallbonbonEvents] = await Promise.all([
    payload.findGlobal({
      slug: 'knallbonbon',
    }) as Promise<Knallbonbon>,
    payload.find({
      collection: 'knallbonbonEvents',
      sort: '-date',
      limit: 100,
    }),
  ])

  return (
    <section>
      {/* Hero Section */}
      <section className="container mx-auto p-6">
        <div className="flex flex-col items-center text-center">
          <LogoEvangelisch className="h-auto w-40 pb-8 md:w-52" />
          <h1 className="mb-4 text-4xl leading-none font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            {knallbonbon.title}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl text-lg font-normal sm:px-16 lg:text-xl">
            {knallbonbon.description}
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/knallbonbon/anmeldung">
              <User />
              Jetzt anmelden
            </Link>
          </Button>
          <Button asChild variant="outline" className="ml-4">
            <Link href="mailto:info@evangelischejugend.org">
              <Mail />
              Kontaktieren
            </Link>
          </Button>
        </div>
      </section>

      {/* Events Section */}
      <section id="veranstaltungen" className="container mx-auto p-6">
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Kommende Veranstaltungen</h2>
        <div className="max-w-md">
          {knallbonbonEvents.docs.length > 0 ? (
            knallbonbonEvents.docs.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <NoEventsCard />
          )}
        </div>
      </section>
    </section>
  )
}

export const revalidate = 60 // seconds (regenerate every 1 minute)

// React and Next.js
import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Custom Components
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { Button } from '@/components/ui/button'
import LogoEvangelisch from '@/graphics/logo/LogoEvangelisch'
import { User } from 'lucide-react'

export function generateMetadata(): Metadata {
  return {
    title: `Knallbonbon | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Der Knallbonbon der Evangelischen Kirchengemeinde Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const knallbonbon = await payload.findGlobal({
    slug: 'knallbonbon',
  })
  const knallbonbonEvents = await payload.find({
    collection: 'knallbonbonEvents',
    sort: '-date',
    limit: 100,
  })

  return (
    <section className="container mx-auto">
      <CardHeader>
        <LogoEvangelisch className="mb-3 h-auto w-50" />
        <CardTitle>{knallbonbon.title}</CardTitle>
        <p>{knallbonbon.description}</p>
      </CardHeader>
      <div className="max-w-md px-6">
        {knallbonbonEvents.docs.length > 0 ? (
          knallbonbonEvents.docs.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {formatDateLocale(event.date, "EEEE, d. MMMM yyyy 'um' H:mm")}
                </CardDescription>
                <CardDescription>Ort: {event.location}</CardDescription>
              </CardHeader>
              {event.additionalInfo && (
                <div className="mt-2">
                  <h3 className="font-medium">Zusätzliche Informationen:</h3>
                  <p>{event.additionalInfo}</p>
                </div>
              )}
              <CardFooter>
                <Button asChild>
                  <Link href="/knallbonbon/anmeldung" className="space-y-2">
                    <User />
                    Anmelden
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Keine Veranstaltungen</CardTitle>
              <CardDescription>
                Aktuell sind keine Knallbonbon-Veranstaltungen geplant. Schaue bald wieder vorbei!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </section>
  )
}

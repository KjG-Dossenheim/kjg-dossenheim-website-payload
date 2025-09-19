import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

import Date from '@/components/date'

import type { Metadata } from 'next'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 60 // seconds (regenerate every 1 minute)

export function generateMetadata(): Metadata {
  return {
    title: 'Knallbonbon | KjG Dossenheim',
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
    <section className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{knallbonbon.title}</CardTitle>
        <p>{knallbonbon.description}</p>
      </CardHeader>
      <div className="mx-auto max-w-md px-6">
        {knallbonbonEvents.docs.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                <Date dateString={event.date} formatString="EEEE, d. MMMM yyyy 'um' H:mm" />
              </CardDescription>
              <CardDescription>Ort: {event.location}</CardDescription>
            </CardHeader>
            {event.additionalInfo && (
              <div className="mt-2">
                <h3 className="font-medium">Zusätzliche Informationen:</h3>
                <p>{event.additionalInfo}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}

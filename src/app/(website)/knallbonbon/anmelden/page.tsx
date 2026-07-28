// React
import React from 'react'
import dynamic from 'next/dynamic'

// Payload
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { Metadata } from 'next'
import type { EventOption } from './schema'

// ISR: revalidate every 60 seconds — events change infrequently
export const revalidate = 60

// Form Component - dynamically imported for better performance
const KnallbonbonAnmeldungForm = dynamic(
  () => import('./form').then((mod) => ({ default: mod.KnallbonbonAnmeldungForm })),
  {
    loading: () => (
      <>
        <CardHeader>
          <CardTitle>Knallbonbon Anmeldung</CardTitle>
          <CardDescription>
            Hier können Sie sich für unser Knallbonbon Event anmelden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </>
    ),
  },
)

export function generateMetadata(): Metadata {
  return {
    title: 'Knallbonbon Anmeldung | ' + process.env.NEXT_PUBLIC_SITE_NAME,
    description: 'Melden Sie sich für das Knallbonbon Event an',
  }
}

/**
 * Server Component — fetches event data at request time (ISR'd for 60s)
 * so the form renders with pre-populated event options, eliminating the
 * client-side REST API waterfall.
 */
export default async function KnallbonbonAnmeldungPage() {
  const eventDateFormatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  let initialEvents: EventOption[] = []

  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'knallbonbonEvents',
      where: {
        date: { greater_than: new Date().toISOString() },
      },
      sort: 'date',
      depth: 0, // Prevents the 'participants' join field from resolving all registration docs
    })

    initialEvents = docs.map((event) => {
      const eventDate = event.date ? new Date(event.date) : null
      const dateLabel = eventDate ? eventDateFormatter.format(eventDate) : 'Datum unbekannt'

      return {
        id: event.id,
        title: String(event.title || 'Unbekannte Veranstaltung'),
        dateLabel,
        date: event.date ?? undefined,
        isFull: event.isFull || false,
        freeSpots: event.maxParticipants
          ? Math.max(event.maxParticipants - (event.participantCount || 0), 0)
          : 0,
        maxParticipants: event.maxParticipants ?? undefined,
        minAge: event.minAge ?? undefined,
        maxAge: event.maxAge ?? undefined,
      } satisfies EventOption
    })
  } catch (error) {
    console.error('Failed to fetch Knallbonbon events (server-side):', error)
    // initialEvents stays [] — the client hook will fall back to its own fetch
  }

  return (
    <section className="mx-auto max-w-md">
      <KnallbonbonAnmeldungForm initialEvents={initialEvents} />
    </section>
  )
}

export const revalidate = 300 // 5 minutes - more frequent updates for events

// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Third-party libraries
import { MapPin, Calendar, ArrowRight } from 'lucide-react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Jahresplan, KnallbonbonEvent } from '@/payload-types'

// UI Components
import { buttonVariants } from '@/components/ui/button'
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline'

// Custom Components
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { cn } from '@/lib/utils'

export function generateMetadata(): Metadata {
  return {
    title: `Aktionen | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Hier findest du alle Aktionen der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  }
}

// Unified event type for timeline display
type TimelineEvent = {
  id: string | number
  title: string
  date: string
  description?: string | null
  location?: string | null
  url?: string | null
  source: 'jahresplan' | 'knallbonbon'
}

export default async function Page() {
  try {
    const payload = await getPayload({ config })

    // Fetch Jahresplan events
    const { docs: jahresplanEvents } = await payload.find({
      collection: 'jahresplan',
      where: {
        startDate: {
          greater_than_equal: new Date().toISOString(),
        },
      },
      sort: 'startDate',
      limit: 50,
      select: {
        id: true,
        title: true,
        startDate: true,
        description: true,
        location: true,
        url: true,
      },
    })

    // Fetch Knallbonbon events
    const { docs: knallbonbonEvents } = await payload.find({
      collection: 'knallbonbonEvents',
      where: {
        date: {
          greater_than_equal: new Date().toISOString(),
        },
      },
      sort: 'date',
      limit: 50,
      select: {
        id: true,
        title: true,
        date: true,
        additionalInfo: true,
        location: true,
      },
    })

    // Normalize events to unified format
    const normalizedJahresplan: TimelineEvent[] = jahresplanEvents.map((event: Jahresplan) => ({
      id: event.id,
      title: event.title,
      date: event.startDate,
      description: event.description,
      location: event.location,
      url: event.url,
      source: 'jahresplan' as const,
    }))

    const normalizedKnallbonbon: TimelineEvent[] = knallbonbonEvents.map(
      (event: KnallbonbonEvent) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        description: event.additionalInfo,
        location: event.location,
        url: '/knallbonbon',
        source: 'knallbonbon' as const,
      }),
    )

    // Merge and sort all events by date
    const allEvents = [...normalizedJahresplan, ...normalizedKnallbonbon].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // Find the index of the first future event (defaultValue is 1-based)
    const now = new Date()
    const firstFutureEventIndex = allEvents.findIndex((event) => new Date(event.date) > now)
    // If no future events found, default to the last event, otherwise use the future event index + 1 (1-based)
    const defaultTimelineValue =
      firstFutureEventIndex === -1 ? allEvents.length : firstFutureEventIndex + 1

    return (
      <section className="mx-auto space-y-6 p-6">
        <div>
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            Aktionen
          </h1>
        </div>
        <div>
          {allEvents.length > 0 ? (
            <Timeline
              defaultValue={defaultTimelineValue}
              orientation="vertical"
              className="mx-auto max-w-md"
            >
              {allEvents.map((event: TimelineEvent, index: number) => (
                <TimelineItem key={`${event.source}-${event.id}`} step={index + 1}>
                  <TimelineHeader>
                    <TimelineSeparator />
                    <TimelineDate className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDateLocale(event.date, 'EEEE, d. MMMM yyyy')}
                    </TimelineDate>
                    <TimelineTitle>{event.title}</TimelineTitle>
                    {event.location && (
                      <TimelineDate>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" /> {event.location}
                        </div>
                      </TimelineDate>
                    )}
                    <TimelineIndicator />
                  </TimelineHeader>
                  <TimelineContent>
                    {event.description && <p className="mb-3">{event.description}</p>}
                  </TimelineContent>
                  {event.url && (
                    <Link
                      href={event.url}
                      className={cn(buttonVariants({ variant: 'outline' }), 'self-start')}
                      data-umami-event="Event More Info CTA"
                      data-umami-event-event={event.title}
                    >
                      Mehr erfahren <ArrowRight data-icon="inline-end" />
                    </Link>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <p className="text-center text-lg">
              Aktuell sind keine Aktionen aus den letzten 6 Monaten oder für die Zukunft geplant.
            </p>
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error loading events:', error)
    return (
      <section className="mx-auto space-y-6 p-6">
        <div>
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            Aktionen
          </h1>
        </div>
        <div>
          <p className="text-center text-lg text-red-600">
            Fehler beim Laden der Aktionen. Bitte versuchen Sie es später erneut.
          </p>
        </div>
      </section>
    )
  }
}

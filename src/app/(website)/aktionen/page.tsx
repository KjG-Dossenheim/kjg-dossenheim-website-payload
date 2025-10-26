export const revalidate = 300 // 5 minutes - more frequent updates for events
export const dynamic = 'force-static' // Force static generation for better performance

// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Third-party libraries
import { MapPin, Calendar, ArrowRight } from 'lucide-react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Jahresplan } from '@/payload-types'

// UI Components
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import DateComponent from '@/components/common/date'
import { formatDateLocale } from '@/components/common/formatDateLocale'

export function generateMetadata(): Metadata {
  return {
    title: 'Aktionen | KjG Dossenheim',
    description: 'Hier findest du alle Aktionen der KjG Dossenheim',
  }
}

export default async function Page() {
  try {
    const payload = await getPayload({ config })

    // Filter events from the last 6 months or in the future at database level
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { docs: relevantEvents } = await payload.find({
      collection: 'jahresplan',
      where: {
        startDate: {
          greater_than_equal: sixMonthsAgo.toISOString(),
        },
      },
      sort: 'startDate',
      limit: 50, // Add reasonable limit to prevent excessive data fetching
      select: {
        id: true,
        name: true,
        startDate: true,
        description: true,
        location: true,
        link: true,
      },
    })

    // Find the index of the first future event (defaultValue is 1-based)
    const now = new Date()
    const firstFutureEventIndex = relevantEvents.findIndex(
      (event: Jahresplan) => new Date(event.startDate) > now,
    )
    // If no future events found, default to the last event, otherwise use the future event index + 1 (1-based)
    const defaultTimelineValue =
      firstFutureEventIndex === -1 ? relevantEvents.length : firstFutureEventIndex + 1

    return (
      <section className="container mx-auto">
        <CardHeader>
          <CardTitle>Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          {relevantEvents.length > 0 ? (
            <Timeline defaultValue={defaultTimelineValue} orientation="vertical">
              {relevantEvents.map((event: Jahresplan, index: number) => (
                <TimelineItem key={event.id} step={index + 1}>
                  <TimelineHeader>
                    <TimelineSeparator />
                    <TimelineDate className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDateLocale(event.startDate, 'EEEE, d. MMMM yyyy')}
                    </TimelineDate>
                    <TimelineTitle>{event.name}</TimelineTitle>
                    <TimelineIndicator />
                  </TimelineHeader>
                  <TimelineContent className="max-w-sm">
                    {event.location && (
                      <div className="mb-2 flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> {event.location}
                      </div>
                    )}
                    {event.description && <p className="mb-3">{event.description}</p>}
                    {event.link && (
                      <Button
                        asChild
                        variant="outline"
                        data-umami-event="Event More Info CTA"
                        data-umami-event-event={event.name}
                      >
                        <Link href={event.link} className="gap-1.5">
                          Mehr erfahren <ArrowRight className="size-5" />
                        </Link>
                      </Button>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <p className="text-center text-lg">
              Aktuell sind keine Aktionen aus den letzten 6 Monaten oder für die Zukunft geplant.
            </p>
          )}
        </CardContent>
      </section>
    )
  } catch (error) {
    console.error('Error loading events:', error)
    return (
      <section className="container mx-auto">
        <CardHeader>
          <CardTitle>Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-red-600">
            Fehler beim Laden der Aktionen. Bitte versuchen Sie es später erneut.
          </p>
        </CardContent>
      </section>
    )
  }
}

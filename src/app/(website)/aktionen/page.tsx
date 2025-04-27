import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import {
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from 'flowbite-react'
import { HiArrowNarrowRight } from 'react-icons/hi'
import { MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import DateComponent from '@/components/date'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

import type { Jahresplan } from '@/payload-types'

export function generateMetadata(): Metadata {
  return {
    title: 'Aktionen | KjG Dossenheim',
    description: 'Hier findest du alle Aktionen der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const { docs: events } = await payload.find({
    collection: 'jahresplan',
    sort: 'startDate',
  })

  // Filter future events once before rendering
  const futureEvents = events.filter((event: Jahresplan) => new Date(event.startDate) > new Date())

  return (
    <section className="mx-auto p-5">
      <h1 className="text-center text-3xl font-bold sm:text-5xl">Aktionen</h1>
      <div className="mx-auto w-fit max-w-md py-8">
        {futureEvents.length > 0 ? (
          <Timeline>
            {futureEvents.map((event: Jahresplan) => (
              <TimelineItem key={event.id}>
                <TimelinePoint />
                <TimelineContent className="flex flex-col space-y-2">
                  <TimelineTitle>{event.name}</TimelineTitle>
                  <span>
                    <TimelineTime className="flex items-center gap-2">
                      <Calendar className="size-3.5" />
                      <DateComponent
                        dateString={event.startDate}
                        formatString="EEEE, d. MMMM yyyy"
                      />
                    </TimelineTime>
                    {event.location && (
                      <TimelineTime className="flex items-center gap-2">
                        <MapPin className="size-3.5" /> {event.location}
                      </TimelineTime>
                    )}
                  </span>
                  {event.description && <TimelineBody>{event.description}</TimelineBody>}
                  {event.link && (
                    <Button asChild variant="outline" className="w-fit">
                      <Link href={event.link}>
                        Mehr erfahren <HiArrowNarrowRight className="ml-2 size-3" />
                      </Link>
                    </Button>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <p className="text-center text-lg">Aktuell sind keine bevorstehenden Aktionen geplant.</p>
        )}
      </div>
    </section>
  )
}

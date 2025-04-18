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

import Link from 'next/link'
import DateComponent from '@/components/date'

import { Button } from '@/components/ui/button'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Aktionen | KjG Dossenheim',
    description: 'Hier findest du alle Aktionen der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const jahresplan = await payload.find({
    collection: 'jahresplan',
    sort: 'startDate',
  })

  return (
    <section className="mx-auto w-full max-w-screen-xl p-5">
      <h1 className="text-center text-3xl font-bold sm:text-5xl">Aktionen</h1>
      <div className="mx-auto flex max-w-screen-sm items-center justify-center py-5">
        <Timeline>
          {jahresplan.docs
            .filter((event) => new Date(event.startDate) > new Date())
            .map((event) => (
              <TimelineItem key={event.id}>
                <TimelinePoint />
                <TimelineContent>
                  <TimelineTime>
                    <DateComponent
                      dateString={event.startDate}
                      formatString="EEEE, d. MMMM yyyy"
                    ></DateComponent>
                  </TimelineTime>
                  <TimelineTitle>{event.name}</TimelineTitle>
                  <TimelineTime>{event.location}</TimelineTime>
                  <TimelineBody>{event.description}</TimelineBody>
                  {event.link && (
                    <Button asChild variant="link" className="pl-0">
                      <Link href={event.link}>
                        Mehr erfahren <HiArrowNarrowRight />
                      </Link>
                    </Button>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
        </Timeline>
      </div>
    </section>
  )
}

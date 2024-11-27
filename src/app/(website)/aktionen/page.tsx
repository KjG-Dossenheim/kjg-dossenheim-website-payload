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

export default async function Page() {
  const payload = await getPayload({ config })
  const jahresplan = await payload.find({
    collection: 'jahresplan',
  })

  // Sort events by startDate
  const sortedEvents = jahresplan.docs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <section className="mx-auto p-5 max-w-screen-xl w-full">
      <h1 className="text-3xl sm:text-5xl text-secondary dark:text-primary text-center font-bold">
        Jahresplan
      </h1>
      <div className="mx-auto flex items-center justify-center py-5 max-w-screen-sm">
        <Timeline>
            {sortedEvents.map((event) => (
              <TimelineItem key={event.id}>
              <TimelinePoint />
              <TimelineContent>
                <TimelineTime>
                <DateComponent dateString={event.startDate} formatString="EEEE, d. MMMM yyyy"></DateComponent>
                </TimelineTime>
                <TimelineTitle className='text-secondary'>{event.name}</TimelineTitle>
                <TimelineTime>{event.location}</TimelineTime>
                <TimelineBody>{event.description}</TimelineBody>
                <Button asChild variant='link'>
                  <Link href={event.link || '#'}>Mehr erfahren <HiArrowNarrowRight/></Link>
                </Button>
              </TimelineContent>
              </TimelineItem>
            ))}
        </Timeline>
      </div>
    </section>
  )
}

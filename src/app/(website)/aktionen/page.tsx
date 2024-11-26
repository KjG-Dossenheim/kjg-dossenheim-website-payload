import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import {
  Button,
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
import Date from '@/components/date'

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section className="mx-auto p-5 max-w-screen-xl w-full">
      <h1 className="text-3xl sm:text-5xl text-secondary-500 dark:text-primary-500 text-center font-bold">
        Jahresplan
      </h1>
      <div className="mx-auto flex items-center justify-center py-5 max-w-screen-sm">
        <Timeline>
          {aktionen.jahresplan.events.map((event) => (
            <TimelineItem key={event.id}>
              <TimelinePoint />
              <TimelineContent>
                <TimelineTime>
                  <Date dateString={event.startDate} formatString="EEEE, d. MMMM yyyy"></Date>
                </TimelineTime>
                <TimelineTitle>{event.title}</TimelineTitle>
                <TimelineTime>{event.location}</TimelineTime>
                <TimelineBody>{event.description}</TimelineBody>
                <Button as={Link} href={event.website || '#'} color="gray" className="w-fit">
                  Mehr erfahren
                  <HiArrowNarrowRight className="ml-2 h-full" />
                </Button>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </section>
  )
}

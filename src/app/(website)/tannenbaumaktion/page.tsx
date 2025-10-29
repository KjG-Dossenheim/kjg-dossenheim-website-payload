// React and Next.js
import React from 'react'

// Third-party libraries
import { RichText } from '@payloadcms/richtext-lexical/react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Types
import type { Metadata } from 'next'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'
import Countdown from '@/components/common/Countdown'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'tannenbaumaktion',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const tannenbaumaktion = await getData()
  return {
    title: `${tannenbaumaktion.meta?.title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `${tannenbaumaktion.meta?.description}`,
  }
}

export default async function Page() {
  const tannenbaumaktion = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Tannenbaumaktion ${formatDateLocale(tannenbaumaktion.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(
      tannenbaumaktion.startDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      "yyyy-MM-dd'T'HH:mm:ssxxx",
    ),
    location: {
      '@type': 'Place',
      name: 'Dossenheim',
    },
    eventStatus: 'https://schema.org/EventScheduled',
    description: `Die Tannenbaumaktion der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    organizer: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="flex flex-col gap-4 p-6 py-20">
        <h1 className="text-center text-3xl font-bold sm:text-5xl">Tannenbaumaktion</h1>
        <h2 className="text-center text-lg sm:text-2xl">
          {formatDateLocale(tannenbaumaktion.startDate, 'EEEE, d. MMMM yyyy')} ab{' '}
          {formatDateLocale(tannenbaumaktion.startDate, 'H:mm')} Uhr
        </h2>
        <Countdown targetDate={tannenbaumaktion.startDate} />
      </div>
      <section className="bg-primary py-5" id="verkaufstellen">
        <h2 className="text-primary-foreground dark:text-foreground text-center text-2xl font-bold sm:text-4xl">
          Unsere Verkaufsstellen
        </h2>
        {/* Mobile: Accordion */}
        <div className="mx-auto max-w-2xl p-5 sm:hidden">
          <Accordion type="single" collapsible>
            {tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <AccordionItem key={vekaufsort.id} value={vekaufsort.id ?? ''}>
                <AccordionTrigger className="text-primary-foreground dark:text-foreground">
                  {vekaufsort.name}
                </AccordionTrigger>
                <AccordionContent className="text-primary-foreground dark:text-foreground">
                  {vekaufsort.adresse}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {/* Desktop: Cards */}
        <div className="hidden flex-wrap justify-center p-5 sm:flex">
          {tannenbaumaktion.vekaufsort.map((vekaufsort) => (
            <Card key={vekaufsort.id} className="m-3 w-fit max-w-sm">
              <CardHeader>
                <CardTitle id={`${vekaufsort.name}`}>{vekaufsort.name}</CardTitle>
                <CardDescription id={`${vekaufsort.adresse}`}>{vekaufsort.adresse}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-(--breakpoint-md) p-6">
        <h1 className="pb-5 text-center text-3xl font-bold">FAQ</h1>
        <Accordion type="single" collapsible>
          {tannenbaumaktion.fragen.map((fragen) => (
            <AccordionItem key={fragen.id} value={fragen.id ?? ''}>
              <AccordionTrigger>{fragen.frage}</AccordionTrigger>
              <AccordionContent>
                <RichText data={fragen.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </section>
  )
}

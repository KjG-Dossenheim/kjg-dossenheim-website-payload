import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { Carousel } from 'flowbite-react'
import Date from '@/components/date'
import { RichText } from '@payloadcms/richtext-lexical/react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Tannenbaumaktion | KjG Dossenheim',
    description: 'Die Tannenbaumaktion der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const tannenbaumaktion = await payload.findGlobal({
    slug: 'tannenbaumaktion',
  })

  return (
    <section>
      <div className="py-20">
        <h1 className="text-3xl sm:text-5xl text-center font-bold">
          Tannenbaumaktion
        </h1>
        <h2 className="text-lg sm:text-2xl text-center">
          <Date
            dateString={tannenbaumaktion.allgemein.startDate}
            formatString="EEEE, d. MMMM yyyy"
          ></Date>{' '}
          ab <Date dateString={tannenbaumaktion.allgemein.startTime} formatString="H:mm"></Date> Uhr
        </h2>
      </div>
      <section className="py-5 bg-primary" id='verkaufstellen'>
        <h2 className="text-xl sm:text-4xl text-center font-bold text-primary-foreground dark:text-foreground">
          Unsere Verkaufsstellen
        </h2>
        <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 max-w-screen-lg mx-auto">
          <Carousel>
            {tannenbaumaktion.allgemein.vekaufsort.map((vekaufsort) => (
              <div key={vekaufsort.id} className="flex h-full items-center justify-center">
                <div className="text-center text-primary-foreground dark:text-foreground">
                  <h3 className="text-xl sm:text-4xl font-bold">{vekaufsort.name}</h3>
                  <p className="text-lg sm:text-2xl">{vekaufsort.adresse}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <Accordion type="single" collapsible className="max-w-screen-sm mx-auto text-primary-foreground dark:text-foreground">
          <AccordionItem value="vekaufsort">
            <AccordionTrigger>Verkaufsstellen</AccordionTrigger>
            {tannenbaumaktion.allgemein.vekaufsort.map((vekaufsort) => (
              <AccordionContent key={vekaufsort.id}>
                {vekaufsort.name} / {vekaufsort.adresse}
              </AccordionContent>
            ))}
          </AccordionItem>
        </Accordion>
      </section>
      <section className="max-w-screen-md mx-auto p-5">
        <h1 className="text-center text-3xl font-bold pb-5">
          FAQ
        </h1>
        <Accordion type="single" collapsible>
          {tannenbaumaktion.allgemein.fragen.map((fragen) => (
            <AccordionItem key={fragen.id} value={fragen.id ?? ''}>
              <AccordionTrigger>{fragen.frage}</AccordionTrigger>
              <AccordionContent>
              <RichText className='RichText' data={fragen.answer} /></AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </section>
  )
}

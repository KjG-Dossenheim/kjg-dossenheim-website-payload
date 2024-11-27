import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { Carousel } from 'flowbite-react'
import Date from '@/components/date'

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
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section>
      <div className="py-20">
        <h1 className="text-3xl sm:text-5xl text-secondary dark:text-primary text-center font-bold">
          Tannenbaumaktion
        </h1>
        <h2 className="text-lg sm:text-2xl text-secondary dark:text-primary text-center">
          <Date
            dateString={aktionen.tannenbaumaktion.startDate}
            formatString="EEEE, d. MMMM yyyy"
          ></Date>{' '}
          ab <Date dateString={aktionen.tannenbaumaktion.startTime} formatString="H:mm"></Date> Uhr
        </h2>
      </div>
      <section className="py-5 bg-secondary" id='verkaufstellen'>
        <h2 className="text-xl sm:text-4xl text-white text-center font-bold">
          Unsere Verkaufsstellen
        </h2>
        <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 max-w-screen-lg mx-auto">
          <Carousel>
            {aktionen.tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <div key={vekaufsort.id} className="flex h-full items-center justify-center ">
                <div className="text-center text-white">
                  <h3 className="text-xl sm:text-4xl font-bold">{vekaufsort.name}</h3>
                  <p className="text-lg sm:text-2xl">{vekaufsort.adresse}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <Accordion type="single" collapsible className="max-w-screen-sm mx-auto">
          <AccordionItem value="vekaufsort">
            <AccordionTrigger className="text-white">Verkaufsstellen</AccordionTrigger>
            {aktionen.tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <AccordionContent key={vekaufsort.id} className="text-white">
                {vekaufsort.name} / {vekaufsort.adresse}
              </AccordionContent>
            ))}
          </AccordionItem>
        </Accordion>
      </section>
      <section className="max-w-screen-md mx-auto py-5">
        <h1 className="text-center text-secondary dark:text-primary text-3xl font-bold pb-5">
          FAQ
        </h1>
        <Accordion type="single" collapsible>
          {aktionen.tannenbaumaktion.fragen.map((aktion) => (
            <AccordionItem key={aktion.id} value={aktion.id ?? ''}>
              <AccordionTrigger className='dark:text-white'>{aktion.frage}</AccordionTrigger>
              <AccordionContent className='dark:text-white'><div id='RichText' dangerouslySetInnerHTML={{ __html: aktion.answerHTML || '' }} /></AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </section>
  )
}

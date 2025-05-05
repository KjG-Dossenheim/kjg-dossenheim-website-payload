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

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'tannenbaumaktion',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const tannenbaumaktion = await getData()
  return {
    title: `${tannenbaumaktion.meta?.title} | KjG Dossenheim`,
    description: `${tannenbaumaktion.meta?.description}`,
  }
}

export default async function Page() {
  const tannenbaumaktion = await getData()

  return (
    <section>
      <div className="py-20">
        <h1 className="text-center text-3xl font-bold sm:text-5xl">Tannenbaumaktion</h1>
        <h2 className="text-center text-lg sm:text-2xl">
          <Date dateString={tannenbaumaktion.startDate} formatString="EEEE, d. MMMM yyyy"></Date> ab{' '}
          <Date dateString={tannenbaumaktion.startDate} formatString="H:mm"></Date> Uhr
        </h2>
      </div>
      <section className="bg-primary py-5" id="verkaufstellen">
        <h2 className="text-center text-xl font-bold text-primary-foreground dark:text-foreground sm:text-4xl">
          Unsere Verkaufsstellen
        </h2>
        <div className="mx-auto h-56 max-w-screen-lg sm:h-64 xl:h-80 2xl:h-96">
          <Carousel>
            {tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <div key={vekaufsort.id} className="flex h-full items-center justify-center">
                <div className="text-center text-primary-foreground dark:text-foreground">
                  <h3 className="text-xl font-bold sm:text-4xl">{vekaufsort.name}</h3>
                  <p className="text-lg sm:text-2xl">{vekaufsort.adresse}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-screen-sm p-4 text-primary-foreground dark:text-foreground"
        >
          <AccordionItem value="vekaufsort">
            <AccordionTrigger>Verkaufsstellen</AccordionTrigger>
            {tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <AccordionContent key={vekaufsort.id}>
                {vekaufsort.name} / {vekaufsort.adresse}
              </AccordionContent>
            ))}
          </AccordionItem>
        </Accordion>
      </section>
      <section className="mx-auto max-w-screen-md p-3">
        <h1 className="pb-5 text-center text-3xl font-bold">FAQ</h1>
        <Accordion type="single" collapsible>
          {tannenbaumaktion.fragen.map((fragen) => (
            <AccordionItem key={fragen.id} value={fragen.id ?? ''}>
              <AccordionTrigger>{fragen.frage}</AccordionTrigger>
              <AccordionContent>
                <RichText className="RichText" data={fragen.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </section>
  )
}

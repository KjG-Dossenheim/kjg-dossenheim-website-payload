import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
        <h2 className="text-primary-foreground dark:text-foreground text-center text-xl font-bold sm:text-4xl">
          Unsere Verkaufsstellen
        </h2>
        <div className="flex flex-wrap justify-center p-5">
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
      <section className="mx-auto max-w-(--breakpoint-md) p-3">
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

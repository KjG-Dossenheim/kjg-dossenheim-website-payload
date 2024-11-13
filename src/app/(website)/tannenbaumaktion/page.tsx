import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from 'flowbite-react'
import { Carousel } from 'flowbite-react'
import Date from '@/components/date'
import Time from '@/components/time'

export default async function Page() {
  const payload = await getPayloadHMR({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section className="max-w-screen-lg mx-auto">
      <h1 className='text-3xl sm:text-5xl text-secondary-500 dark:text-primary-500 text-center font-bold py-5'>Tannenbaumaktion</h1>
      <h2 className="text-lg sm:text-2xl text-secondary-500 dark:text-primary-500 text-center"><Date dateString={aktionen.tannenbaumaktion.startDate}></Date> ab <Time dateString={aktionen.tannenbaumaktion.startTime}></Time> Uhr</h2>
      <section className="py-5">
        <h2 className="text-xl sm:text-4xl text-secondary-500 dark:text-primary-500 text-center font-bold py-5">
          Unsere Verkaufstellen
        </h2>
        <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
          <Carousel slide={false}>
            {aktionen.tannenbaumaktion.vekaufsort.map((vekaufsort) => (
              <div
                key={vekaufsort.id}
                className="flex h-full items-center justify-center bg-secondary-500 dark:bg-primary-500"
              >
                <div className='text-center text-white'>
                  <h3 className="text-xl sm:text-4xl font-bold">{vekaufsort.name}</h3>
                  <p className='text-lg sm:text-2xl'>{vekaufsort.adresse}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
      <Accordion>
        {aktionen.tannenbaumaktion.fragen.map((aktion) => (
        <AccordionPanel key={aktion.id}>
          <AccordionTitle>{aktion.frage}</AccordionTitle>
          <AccordionContent>
            {aktion.antwort}
          </AccordionContent>
        </AccordionPanel>
        ))}
      </Accordion>
      
    </section>
  )
}

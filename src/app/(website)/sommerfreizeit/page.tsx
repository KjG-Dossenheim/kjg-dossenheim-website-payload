import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Date from 'src/components/date'
import Image from 'next/image'
import Link from 'next/link'

import { ChevronDown, ChevronRight } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Sommerfreizeit | KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section className="pb-4">
      <section className="px-4 mx-auto text-center py-24 lg:py-56">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-secondary-500 md:text-5xl lg:text-6xl">
          {aktionen.sommerfreizeit.allgemein.title}
        </h1>
        <h2>{aktionen.sommerfreizeit.allgemein.motto}</h2>
        <p className="mb-8 text-lg font-normal text-secondary-500 lg:text-xl sm:px-16 lg:px-48">
          <Date
            dateString={aktionen.sommerfreizeit.allgemein.startDate}
            formatString="EEEE, d. MMMM yyyy"
          />{' '}
          bis{' '}
          <Date
            dateString={aktionen.sommerfreizeit.allgemein.endDate}
            formatString="EEEE, d. MMMM yyyy"
          />
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Button asChild className="rounded-full">
            <Link href={aktionen.sommerfreizeit.anmeldung.website}>
              Jetzt anmelden <ChevronRight />
            </Link>
          </Button>
          <Button asChild className="rounded-full border" variant="outline">
            <Link href="#info">
              Informationen <ChevronDown />
            </Link>
          </Button>
        </div>
      </section>
      <section id="info">
        <div className="py-4 sm:py-16 px-4 text-center bg-secondary-500">
          <h2 className="text-3xl sm:text-4xl text-white mb-4 font-extrabold leading-loose tracking-tight">
            Für <span className="underline decoration-8 decoration-accent-500">alle</span> Kinder
            zwischen {aktionen.sommerfreizeit.allgemein.alter}
          </h2>
        </div>
      </section>
      <section className="overflow-hidden md:grid md:grid-cols-2">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:md:text-left rtl:md:text-right">
            <h2 className="text-2xl font-bold md:text-3xl text-secondary-500">Unterkunft</h2>
            <p className="text-secondary-500 dark:text-primary-500 md:mt-4">
              {aktionen.sommerfreizeit.unterkunft.beschreibung}
            </p>
            <div className="mt-4 md:mt-8">
              <Button asChild className="rounded-full mx-auto">
                <Link href={aktionen.sommerfreizeit.unterkunft.website}>
                  {aktionen.sommerfreizeit.unterkunft.name}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative w-full sm:h-full">
          {typeof aktionen.sommerfreizeit.unterkunft.bild !== 'string' &&
            aktionen.sommerfreizeit.unterkunft.bild && (
              <Image
                src={aktionen.sommerfreizeit.unterkunft.bild.url || ''}
                alt={aktionen.sommerfreizeit.unterkunft.bild.alt || 'Unterkunft Bild'}
                fill
                className="object-cover"
              />
            )}
        </div>
      </section>
      <section className="max-w-screen-xl p-6 sm:p-8 lg:p-10 mx-auto">
        <h1 className="text-center pb-8 text-4xl text-secondary-500 dark:text-primary-500 font-bold">
          Teilnehmerbeitrag
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-3 md:gap-8">
          {aktionen.sommerfreizeit.allgemein.pricing.map((item) => {
            return (
              <Card key={item.name}>
                <CardHeader className="h-28">
                  <CardTitle className="text-secondary-500">{item.name}</CardTitle>
                  <CardDescription>{item.beschreibung}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mt-2 sm:mt-4">
                    <strong className="text-3xl font-bold text-secondary-500 sm:text-4xl">
                      {item.price}€
                    </strong>
                    <span className="text-sm font-medium text-secondary-500">
                      /pro Teilnehmer
                    </span>
                  </p>
                </CardContent>
                <CardContent>
                  <Button asChild className="rounded-full mx-auto w-full">
                    <Link href={aktionen.sommerfreizeit.anmeldung.website}> Jetzt anmelden</Link>
                  </Button>
                </CardContent>
                <CardFooter>
                  <div>
                    <p className="text-lg font-medium text-secondary-500 sm:text-xl">
                      Inklusive:
                    </p>
                    <ul className="mt-2 space-y-2 sm:mt-4">
                      {item.eigenschaften.map((eigenschaft) => {
                        return (
                          <li className="flex" id={eigenschaft.id || ''} key={eigenschaft.id}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-5 w-5 text-secondary-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            <span className="text-secondary-500">
                              {eigenschaft.name}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>
      <section className="max-w-screen-md mx-auto">
        <h2 className="text-center text-4xl font-bold text-secondary-500 dark:text-primary-500 mb-5">
          Was uns ausmacht
        </h2>
        <Accordion type="single" collapsible>
          {aktionen.sommerfreizeit.allgemein.eigenschaften.map((eigenschaft) => (
            <AccordionItem key={eigenschaft.id} value={eigenschaft.id || ''}>
              <AccordionTrigger className="dark:text-white">{eigenschaft.title}</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2 text-secondary-500 dark:text-white">
                  {eigenschaft.beschreibung}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </section>
  )
}

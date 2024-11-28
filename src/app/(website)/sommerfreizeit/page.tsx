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

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config });
  const sommerfreizeit = await payload.findGlobal({
    slug: 'sommerfreizeit',
  });

  return {
    title: sommerfreizeit.meta?.title + ' | KjG Dossenheim',
    description: sommerfreizeit.meta?.description ?? '',
  };
}

const Page = async () => {
  const payload = await getPayload({ config })
  const sommerfreizeit = await payload.findGlobal({
    slug: 'sommerfreizeit',
  })

  return (
    <section>
      <section className="px-4 mx-auto text-center py-24 lg:py-56 bg-[image:var(--image-url)] bg-cover bg-center bg-blend-multiply bg-primary" style={{'--image-url': `url(${typeof sommerfreizeit.allgemein.background !== 'string' ? sommerfreizeit.allgemein.background?.url : ''})`} as React.CSSProperties} >
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-primary-foreground">
          {sommerfreizeit.allgemein.title}
        </h1>
        <h2>{sommerfreizeit.allgemein.motto}</h2>
        <p className="mb-8 text-lg font-normal lg:text-xl sm:px-16 lg:px-48 text-primary-foreground">
          <Date
            dateString={sommerfreizeit.allgemein.startDate}
            formatString="EEEE, d. MMMM yyyy"
          />{' '}
          bis{' '}
          <Date
            dateString={sommerfreizeit.allgemein.endDate}
            formatString="EEEE, d. MMMM yyyy"
          />
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Button asChild>
            <Link href={sommerfreizeit.anmeldung.website} target='_blank'>
              Jetzt anmelden <ChevronRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#info">
              Informationen <ChevronDown />
            </Link>
          </Button>
        </div>
      </section>
      <section id="info">
        <div className="py-4 sm:py-10 px-4 text-center bg-primary">
          <h2 className="text-2xl sm:text-4xl text-white mb-4 font-extrabold leading-loose tracking-tight">
            Für <span className="underline decoration-8 decoration-accent-500">alle</span> Kinder
            zwischen {sommerfreizeit.allgemein.alter}
          </h2>
        </div>
      </section>
      <section className="overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Unterkunft</h2>
            <p className="md:mt-4">
              {sommerfreizeit.unterkunft.beschreibung}
            </p>
            <div className="my-auto">
              <Button asChild className="mx-auto m-4">
                <Link href={sommerfreizeit.unterkunft.website} target='_blank'>
                  {sommerfreizeit.unterkunft.name}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative w-full">
          {typeof sommerfreizeit.unterkunft.bild !== 'string' &&
            sommerfreizeit.unterkunft.bild && (
              <Image
                src={sommerfreizeit.unterkunft.bild.url || ''}
                alt={sommerfreizeit.unterkunft.bild.alt || 'Unterkunft Bild'}
                fill
                className="object-cover"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
        </div>
      </section>
      <section>
        <div className="max-w-screen-xl p-6 sm:p-8 lg:p-10 mx-auto">
        <h1 className="text-center pb-8 text-4xl font-bold">
          Teilnehmerbeitrag
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-3 md:gap-8">
          {sommerfreizeit.allgemein.pricing.map((item) => {
            return (
              <Card key={item.name}>
                <CardHeader className="h-28">
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.beschreibung}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mt-2 sm:mt-4">
                    <strong className="text-3xl font-bold text-primary sm:text-4xl">
                      {item.price}€
                    </strong>
                    <span className="text-sm font-medium text-primary">
                      /pro Teilnehmer
                    </span>
                  </p>
                </CardContent>
                <CardContent>
                  <Button asChild className="mx-auto w-full">
                    <Link href={sommerfreizeit.anmeldung.website} target='_blank'> Jetzt anmelden</Link>
                  </Button>
                </CardContent>
                <CardFooter>
                  <div>
                    <p className="text-lg font-medium sm:text-xl">
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
                              className="size-5 text-primary"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            <span>
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
        </div>
      </section>
      <section>
        <div className="max-w-screen-lg p-6 sm:p-8 lg:p-10 mx-auto">
        <h2 className="text-center text-4xl font-bold mb-5">
          Was uns ausmacht
        </h2>
        <Accordion type="single" collapsible>
          {sommerfreizeit.allgemein.eigenschaften.map((eigenschaft) => (
            <AccordionItem key={eigenschaft.id} value={eigenschaft.id || ''}>
              <AccordionTrigger>{eigenschaft.title}</AccordionTrigger>
              <AccordionContent className="mb-2">
                <div id='RichText' dangerouslySetInnerHTML={{ __html: eigenschaft.html || '' }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>
      </section>
    </section>
  )
}

export default Page;

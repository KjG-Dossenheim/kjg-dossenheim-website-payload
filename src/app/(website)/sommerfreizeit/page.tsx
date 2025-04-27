import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Date from 'src/components/date'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { ChevronDown, ChevronRight, Mail } from 'lucide-react'

import Countdown from '@/components/Countdown'

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

import { badgeVariants } from '@/components/ui/badge'

import { Metadata } from 'next'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'sommerfreizeit',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const sommerfreizeit = await getData()
  return {
    title: `${sommerfreizeit.meta?.title} | KjG Dossenheim`,
    description: sommerfreizeit.meta?.description ?? '',
  }
}

export default async function Page() {
  const sommerfreizeit = await getData()

  return (
    <section>
      <section className="mx-auto space-y-12 px-4 py-24 text-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
            {sommerfreizeit.allgemein.title}
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl">{sommerfreizeit.allgemein.motto}</h2>
        </div>
        <div className="space-y-2">
          <Countdown targetDate={sommerfreizeit.allgemein.startDate} />

          <p className="text-lg font-normal sm:px-16 lg:px-48 lg:text-xl">
            <Date
              dateString={sommerfreizeit.allgemein.startDate}
              formatString="EEEE, d. MMMM yyyy"
            />{' '}
            bis{' '}
            <Date dateString={sommerfreizeit.allgemein.endDate} formatString="EEEE, d. MMMM yyyy" />
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={sommerfreizeit.allgemein.anmeldungWebsite} target="_blank">
              <span className="flex items-center gap-2">
                Jetzt anmelden <ChevronRight />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#info">
              <span className="flex items-center gap-2">
                Informationen <ChevronDown />
              </span>
            </Link>
          </Button>
        </div>
      </section>
      <section>
        <div className="bg-primary p-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Für{' '}
            <span className="underline decoration-accent-500 decoration-4 md:decoration-8">
              alle
            </span>{' '}
            Kinder zwischen {sommerfreizeit.allgemein.alter}
          </h2>
        </div>
      </section>
      <section
        className="mx-auto max-w-screen-xl space-y-6 p-6 sm:space-y-8 sm:p-8 lg:space-y-10 lg:p-10"
        id="info"
      >
        <section>
          <h1 className="py-8 text-center text-4xl font-bold">Teilnehmerbeitrag</h1>
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
                      <span className="text-sm font-medium text-primary">/pro Teilnehmer</span>
                    </p>
                  </CardContent>
                  <CardContent>
                    <Button asChild className="mx-auto w-full">
                      <Link href={sommerfreizeit.allgemein.anmeldungWebsite} target="_blank">
                        Jetzt anmelden
                      </Link>
                    </Button>
                  </CardContent>
                  <CardFooter>
                    <div>
                      <p className="text-lg font-medium sm:text-xl">Inklusive:</p>
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
                              <span>{eigenschaft.name}</span>
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
        <section className="mx-auto max-w-screen-md">
          <Card className="flex h-full w-full flex-col md:flex-row">
            <div className="flex flex-1 flex-col">
              <CardHeader>
                <CardTitle>Unterkunft</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{sommerfreizeit.unterkunft.beschreibung}</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={sommerfreizeit.unterkunft.website} target="_blank">
                    {sommerfreizeit.unterkunft.name}
                  </Link>
                </Button>
              </CardFooter>
            </div>
            <div className="relative m-6 h-64 md:h-auto md:w-1/2">
              {sommerfreizeit.unterkunft.bild &&
                typeof sommerfreizeit.unterkunft.bild !== 'string' && (
                  <Image
                    src={sommerfreizeit.unterkunft.bild.url || ''}
                    alt={sommerfreizeit.unterkunft.bild.alt || 'Unterkunft Bild'}
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    fill
                    priority
                  />
                )}
            </div>
          </Card>
        </section>
        <section id="team">
          <h1 className="p-6 text-center text-4xl font-bold">Unser Team</h1>
          <div className="flex flex-wrap justify-center gap-4">
            {sommerfreizeit.allgemein.teamFreizeit.map((member, index) => (
              <Link
                key={typeof member === 'string' ? `member-${index}` : member.id}
                href={typeof member !== 'string' ? `/team/${member.id}` : '#'}
                className="block"
              >
                <Card className="my-auto cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader className="max-w-sm">
                    {typeof member !== 'string' && (
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold">
                          {`${member.firstName} ${member.lastName}`}
                        </div>
                        {member.email && <Mail className="size-5" />}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-screen-sm">
          <h2 className="mb-5 text-center text-4xl font-bold">Was uns ausmacht</h2>
          <Accordion type="single" collapsible>
            {sommerfreizeit.allgemein.eigenschaften.map((eigenschaft) => (
              <AccordionItem key={eigenschaft.id} value={eigenschaft.id || ''}>
                <AccordionTrigger>{eigenschaft.title}</AccordionTrigger>
                <AccordionContent className="mb-2">
                  {eigenschaft.description && (
                    <RichText className="RichText" data={eigenschaft.description} />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className="mx-auto w-full px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter">Kontakt</h1>
              <div className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                <p>Hast du Fragen oder möchtest du mehr erfahren?</p>
                <p>Wir würden uns freuen, von Dir zu hören.</p>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-center">
                <Button asChild size="lg">
                  <Link href="mailto:sommerfreizeit@kjg-dossenheim.org">
                    <span className="flex items-center gap-2">
                      <Mail className="size-5" />
                      <span>sommerfreizeit@kjg-dossenheim.org</span>
                    </span>
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Wir antworten in der Regel innerhalb von 24-48 Stunden.
              </p>
            </div>
          </div>
        </section>
      </section>
    </section>
  )
}

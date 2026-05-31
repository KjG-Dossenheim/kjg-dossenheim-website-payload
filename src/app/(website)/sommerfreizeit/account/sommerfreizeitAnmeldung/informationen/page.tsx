// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Third-party libraries
import { RichText } from '@payloadcms/richtext-lexical/react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // alle 60s neue Daten abrufen

type InformationenPageProps = {
  searchParams?: Promise<{
    eventID?: string | string[]
  }>
}

async function getData(eventID: string) {
  const payload = await getPayload({ config })
  return payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventID,
    select: {
      informationen: true,
    },
  })
}

export const metadata: Metadata = {
  title: 'Informationen',
  description: 'Informationen für die Sommerfreizeit',
  openGraph: {
    title: 'Informationen',
    description: 'Informationen für die Sommerfreizeit',
  },
  twitter: {
    title: 'Informationen',
    description: 'Informationen für die Sommerfreizeit',
  },
}

export default async function Page({ searchParams }: InformationenPageProps) {
  const resolvedSearchParams = await searchParams
  const eventIDParam = Array.isArray(resolvedSearchParams?.eventID)
    ? resolvedSearchParams?.eventID[0]
    : resolvedSearchParams?.eventID
  const eventID = eventIDParam ?? 'sommerfreizeit-2024' // Fallback für direkte Aufrufe
  const eventData = await getData(eventID)
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Informationen</h1>
      <div className="flex flex-col gap-4">
        {eventData.informationen?.eintrag?.length ? (
          eventData.informationen.eintrag.map((eintrag) => (
            <Card key={eintrag.id ?? eintrag.title}>
              {eintrag.title ? (
                <CardHeader>
                  <CardTitle>{eintrag.title}</CardTitle>
                </CardHeader>
              ) : null}
              {eintrag.text && eintrag.text.root?.direction !== null && (
                <CardContent>
                  <RichText data={eintrag.text} />
                </CardContent>
              )}
              {eintrag.links?.length ? (
                <CardFooter className="flex flex-wrap gap-2">
                  {eintrag.links.map((link) => (
                    <Link
                      key={link.id}
                      href={link.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: 'default' })}
                    >
                      {link.linkText}
                    </Link>
                  ))}
                </CardFooter>
              ) : null}
            </Card>
          ))
        ) : (
          <p>Keine Informationen verfügbar.</p>
        )}
      </div>
    </div>
  )
}

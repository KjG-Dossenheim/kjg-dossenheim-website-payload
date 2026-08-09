// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Third-party libraries
import { RichText } from '@payloadcms/richtext-lexical/react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { Card, CardContent } from '@/components/ui/card'

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // alle 60s neue Daten abrufen

type PacklistePageProps = {
  searchParams?: Promise<{
    eventID?: string | string[]
  }>
}

async function getData(eventID: string | undefined) {
  if (!eventID) return null
  const payload = await getPayload({ config })
  return payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventID,
    select: {
      packliste: true,
    },
  })
}

export const metadata: Metadata = {
  title: 'Packliste',
  description: 'Packliste für die Sommerfreizeit',
  openGraph: {
    title: 'Packliste',
    description: 'Packliste für die Sommerfreizeit',
  },
  twitter: {
    title: 'Packliste',
    description: 'Packliste für die Sommerfreizeit',
  },
}

export default async function Page({ searchParams }: PacklistePageProps) {
  const resolvedSearchParams = await searchParams
  const eventIDParam = Array.isArray(resolvedSearchParams?.eventID)
    ? resolvedSearchParams?.eventID[0]
    : resolvedSearchParams?.eventID
  const eventData = await getData(eventIDParam)
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Packliste</h1>
      <div className="flex flex-col gap-4">
        {eventData?.packliste?.text ? (
          <Card>
            <CardContent>
              <RichText data={eventData.packliste.text} />
            </CardContent>
          </Card>
        ) : (
          <p>Keine Packliste verfügbar.</p>
        )}
      </div>
    </div>
  )
}

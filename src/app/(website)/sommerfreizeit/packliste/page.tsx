// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Metadata } from 'next'
import { PacklisteDownloadButton } from '@/components/common/PacklisteDownloadButton'

async function getData() {
  const payload = await getPayload({ config })

  const landingPageData = await payload.findGlobal({
    slug: 'sommerfreizeitLandingPage',
    select: {
      freizeit: true,
    },
  })

  const eventId =
    typeof landingPageData.freizeit === 'string'
      ? landingPageData.freizeit
      : landingPageData.freizeit?.id

  if (!eventId) {
    throw new Error('Keine Sommerfreizeit im Landing-Global verknuepft.')
  }

  const eventData = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    select: {
      packliste: true,
    },
  })

  return { text: eventData.packliste.text }
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

export default async function Page() {
  const packliste = await getData()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Packliste</h1>
        {packliste.text && <PacklisteDownloadButton packlisteText={packliste.text} />}
      </div>
      {packliste.text && (
        <div className="RichText">
          <RichText data={packliste.text} />
        </div>
      )}
    </div>
  )
}

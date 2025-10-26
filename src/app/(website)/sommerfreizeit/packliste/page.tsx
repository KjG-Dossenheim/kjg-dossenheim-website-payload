// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Metadata } from 'next'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'sommerfreizeit',
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

export default async function Page() {
  const sommerfreizeit = await getData()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Packliste</h1>
      {sommerfreizeit.packliste.text && (
        <div className="RichText">
          <RichText data={sommerfreizeit.packliste.text} />
        </div>
      )}
    </div>
  )
}

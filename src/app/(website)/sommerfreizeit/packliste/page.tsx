// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PacklisteDownloadButton } from '@/components/common/PacklisteDownloadButton'
import { getSommerfreizeitPage } from '@/utilities/sommerfreizeitPage'

async function getData() {
  const data = await getSommerfreizeitPage()

  if (data.mode !== 'event') {
    redirect('/sommerfreizeit')
  }

  return { text: data.event.packliste.text }
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

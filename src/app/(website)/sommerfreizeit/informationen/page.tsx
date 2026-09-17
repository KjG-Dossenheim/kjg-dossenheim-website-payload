// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

// Third-party libraries
import { RichText } from '@payloadcms/richtext-lexical/react'

// UI Components
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getSommerfreizeitPage } from '@/utilities/sommerfreizeitPage'

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // alle 60s neue Daten abrufen

async function getData() {
  const data = await getSommerfreizeitPage()

  if (data.mode !== 'event') {
    redirect('/sommerfreizeit')
  }

  return { informationen: data.event.informationen }
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

export default async function Page() {
  const sommerfreizeit = await getData()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Informationen</h1>
      <div className="flex flex-col gap-4">
        {sommerfreizeit.informationen.eintrag.map((eintrag) => (
          <Card key={eintrag.title}>
            <CardHeader>
              <CardTitle>{eintrag.title}</CardTitle>
            </CardHeader>
            {eintrag.text && (
              <CardContent>
                <RichText data={eintrag.text} />
              </CardContent>
            )}
            {eintrag.links && eintrag.links.length > 0 && (
              <CardFooter className="flex flex-wrap gap-2">
                {eintrag.links.map((link) => (
                  <Link
                    key={link.linkText}
                    href={link.link || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({})}
                  >
                    {link.linkText}
                  </Link>
                ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

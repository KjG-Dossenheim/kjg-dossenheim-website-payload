import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'

import Link from 'next/link'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'sommerfreizeit',
  })
}

export const metadata: Metadata = {
  title: 'Letzten Informationen',
  description: 'Letzten Informationen für die Sommerfreizeit',
  openGraph: {
    title: 'Letzten Informationen',
    description: 'Letzten Informationen für die Sommerfreizeit',
  },
  twitter: {
    title: 'Letzten Informationen',
    description: 'Letzten Informationen für die Sommerfreizeit',
  },
}

export default async function Page() {
  const sommerfreizeit = await getData()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Letzten Informationen</h1>
      <div className="flex flex-col gap-4">
        {sommerfreizeit.informationen.eintrag.map((eintrag) => (
          <Card key={eintrag.title}>
            <CardHeader>
              <CardTitle>{eintrag.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <RichText data={eintrag.text} className="RichText" />
            </CardContent>
            {eintrag.links && eintrag.links.length > 0 && (
              <CardFooter className="flex flex-wrap gap-2">
                {eintrag.links.map((link) => (
                  <Button key={link.linkText} asChild>
                    <Link
                      href={link.link ? link.link : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.linkText}
                    </Link>
                  </Button>
                ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

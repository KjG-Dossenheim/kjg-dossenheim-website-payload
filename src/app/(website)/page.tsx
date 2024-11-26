import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { ChevronRight, Newspaper, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Startseite | KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const startseite = await payload.findGlobal({
    slug: 'startseite',
  })

  return (
    <section>
      <section>
        <div className="py-20 px-4 mx-auto max-w-screen-xl lg:py-32">
          {startseite.neuigkeiten.enabled && (
            <Link href={startseite.neuigkeiten.link}>
              <Alert className="w-fit mx-auto hover:text-secondary">
                <Newspaper className="h-4 w-4"/>
                <AlertTitle>Neuigkeiten</AlertTitle>
                <AlertDescription className="inline-flex">
                  {startseite.neuigkeiten.title} <ChevronRight className="size-5" />{' '}
                </AlertDescription>
              </Alert>
            </Link>
          )}
          <h1 className="pt-5 mb-4 text-4xl font-extrabold text-center tracking-tight leading-none md:text-5xl lg:text-6xl text-secondary dark:text-primary">
            Willkommen bei der KjG
          </h1>
          <p className="mb-8 text-lg font-normal text-center text-secondary lg:text-xl sm:px-16 lg:px-48 dark:text-primary">
            Die KjG Dossenheim vertritt die Interessen der Kinder und Jugendlichen in der
            katholischen Gemeinden Dossenheim
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 md:space-x-6">
            <Button asChild variant='secondary'>
              <Link href="/aktionen">
                Unsere Aktionen
                <Calendar />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href="/about/">
                Über uns
                <ChevronRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </section>
  )
}

import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

import { Newspaper } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { ChevronRight } from 'lucide-react'

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
                <Alert className="w-fit mx-auto">
                  <Newspaper className="h-4 w-4" />
                  <AlertTitle>Neuigkeiten</AlertTitle>
                  <AlertDescription className='inline-flex'>{startseite.neuigkeiten.title} <ChevronRight className='size-5'/> </AlertDescription>
                </Alert>
              </Link>
          )}
          <h1 className="pt-5 mb-4 text-4xl font-extrabold text-center tracking-tight leading-none md:text-5xl lg:text-6xl text-secondary-500 dark:text-primary-500">
            Willkommen bei der KjG
          </h1>
          <p className="mb-8 text-lg font-normal text-center text-secondary-500 lg:text-xl sm:px-16 lg:px-48 dark:text-primary-500">
            Die KjG Dossenheim vertritt die Interessen der Kinder und Jugendlichen in der
            katholischen Gemeinden Dossenheim
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <Link
              href="/aktionen"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-full bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300"
            >
              Unsere Aktionen
              <svg
                className="ml-2.5 w-4 h-4 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm14-7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
              </svg>
            </Link>
            <Link
              href="/about/"
              className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-secondary-900 rounded-full border border-primary-500 hover:bg-primary-100 focus:ring-4 focus:ring-white dark:bg-white dark:hover:bg-transparent dark:hover:text-white"
            >
              Über uns
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}

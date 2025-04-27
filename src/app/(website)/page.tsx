import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ChevronRight, Newspaper, Calendar } from 'lucide-react'
import { Metadata } from 'next'

// Reusable function to get page data
async function getPageData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'startseite' })
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageData()

  return {
    title: `${page.meta?.title || 'Startseite'} | KjG Dossenheim`,
    description: page.meta?.description || '',
  }
}

export default async function Page() {
  const page = await getPageData()

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20 lg:py-32">
      {page.neuigkeiten?.enabled && (
        <Link href={page.neuigkeiten.link}>
          <Alert className="mx-auto w-fit hover:underline">
            <Newspaper className="size-4" />
            <AlertTitle>Neuigkeiten</AlertTitle>
            <AlertDescription className="inline-flex">
              {page.neuigkeiten.title} <ChevronRight className="size-5" />
            </AlertDescription>
          </Alert>
        </Link>
      )}

      <h1 className="mb-4 pt-5 text-center text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
        Willkommen bei der KjG
      </h1>

      <p className="mb-8 text-center text-lg font-normal sm:px-16 lg:px-48 lg:text-xl">
        Die KjG Dossenheim vertritt die Interessen der Kinder und Jugendlichen in der katholischen
        Gemeinde Dossenheim
      </p>

      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 md:space-x-6">
        <Button asChild>
          <Link href="/aktionen">
            Unsere Aktionen
            <Calendar className="ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/about/">
            Über uns
            <ChevronRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

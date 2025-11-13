// React and Next.js
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

// Third-party libraries
import { ChevronRight, Newspaper, Calendar, Users, Heart, Globe } from 'lucide-react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

// Reusable function to get page data
async function getPageData() {
  const payload = await getPayload({ config })
  const [page, team] = await Promise.all([
    payload.findGlobal({ slug: 'startseite' }),
    payload.find({
      collection: 'team',
      limit: 50,
    }),
  ])

  return { page, team }
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getPageData()

  return {
    title: `${page.meta?.title || 'Startseite'} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: page.meta?.description || '',
  }
}

export default async function Page() {
  const { page, team } = await getPageData()

  return (
    <section className="container mx-auto px-4 py-20 lg:py-32">
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

      <h1 className="mb-4 pt-5 text-center text-4xl leading-none font-extrabold tracking-tight md:text-5xl lg:text-6xl">
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

      {/* Team Section */}
      {team.docs.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Unser Team
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {team.docs.map((member) => (
              <Link key={member.id} href={`/team/${member.id}`}>
                <Card className="hover:bg-accent">
                  <CardHeader>
                    <CardTitle>
                      {member.firstName} {member.lastName}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Profilthemen Section */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Unsere Profilthemen
        </h2>
        <p className="text-muted-foreground mb-8 text-center text-lg sm:px-16 lg:px-48">
          Die KjG Bundesebene setzt sich für wichtige gesellschaftliche Themen ein, die auch unsere
          Arbeit vor Ort prägen.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <Users className="text-primary mx-auto mb-4 size-12" />
            <h3 className="mb-2 text-xl font-semibold">Demokratie & Partizipation</h3>
            <p className="text-muted-foreground">
              Wir fördern demokratische Teilhabe und ermutigen Kinder und Jugendliche, ihre Stimme
              zu erheben und gesellschaftliche Verantwortung zu übernehmen.
            </p>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <Heart className="text-primary mx-auto mb-4 size-12" />
            <h3 className="mb-2 text-xl font-semibold">Geschlechtergerechtigkeit</h3>
            <p className="text-muted-foreground">
              Gleichberechtigung aller Geschlechter ist uns wichtig. Wir setzen uns für eine offene
              und inklusive Gesellschaft ein, in der alle ihre Potentiale entfalten können.
            </p>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <Globe className="text-primary mx-auto mb-4 size-12" />
            <h3 className="mb-2 text-xl font-semibold">Glaube und Kirche</h3>
            <p className="text-muted-foreground">
              Wir setzen uns für die Belange von Kindern und Jugendlichen in der Kirche ein und
              fördern deren Mitbestimmung.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

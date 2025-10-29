import React from 'react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import Countdown from '@/components/common/Countdown'
import Logo72Stunden from './Logo72Stunden'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: '72stunden',
  })
}

export default async function Aktion72StundenPage() {
  const aktion72Stunden = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Adventsmarkt ${formatDateLocale(aktion72Stunden.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(
      aktion72Stunden.startDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    endDate: formatInTimeZone(
      aktion72Stunden.endDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    location: {
      '@type': 'Place',
      name: 'kath. Kirche Dossenheim',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Schlüsselweg 5, 69221 Dossenheim',
        addressLocality: 'Dossenheim',
        postalCode: '69221',
        addressRegion: 'Baden-Württemberg',
        addressCountry: 'DE',
      },
    },
    eventStatus: 'https://schema.org/EventScheduled',
    description: `Die Tannenbaumaktion der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    organizer: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="container mx-auto p-6">
        <Logo72Stunden className="mx-auto mb-8 h-auto max-w-sm" />
        <Countdown targetDate={aktion72Stunden.startDate} />
      </section>
      <section className="container mx-auto flex justify-center">
        <Button asChild size="lg" className="bg-bdkj-green">
          <Link href="https://www.72stunden.de/" target="_blank" rel="noopener noreferrer">
            Mehr erfahren <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}

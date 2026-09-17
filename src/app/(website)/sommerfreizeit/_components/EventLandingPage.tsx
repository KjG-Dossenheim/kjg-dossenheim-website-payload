import React from 'react'
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'

import type { SommerfreizeitEvent, SommerfreizeitSetting } from '@/payload-types'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import AccommodationSection from './AccommodationSection'
import AgeRangeSection from './AgeRangeSection'
import ContactSection from './ContactSection'
import FeaturesSection from './FeaturesSection'
import HeroSection from './HeroSection'
import PricingSection from './PricingSection'
import TeamSection from './TeamSection'

interface EventLandingPageProps {
  event: SommerfreizeitEvent
  alter?: string | null
  eigenschaften: SommerfreizeitSetting['eigenschaften']
}

const timezone = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC'

/**
 * Landing Page der laufenden oder bevorstehenden Freizeit.
 * Alle Inhalte stammen aus der verknuepften Freizeit.
 */
export default function EventLandingPage({ event, alter, eigenschaften }: EventLandingPageProps) {
  const endDate = event.endDate ?? event.startDate

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Sommerfreizeit ${formatDateLocale(event.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(event.startDate, timezone, 'yyyy-MM-dd'),
    endDate: formatInTimeZone(endDate, timezone, 'yyyy-MM-dd'),
    location: {
      '@type': 'Place',
      name: event.unterkunft.name,
      url: event.unterkunft.website,
    },
    offers: event.preise.priceTiers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: formatInTimeZone(event.startDate, timezone, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    })),
    eventStatus: 'https://schema.org/EventScheduled',
    description: `Die Sommerfreizeit der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    organizer: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HeroSection
        title={event.name}
        motto={event.motto}
        startDate={event.startDate}
        endDate={endDate}
        backgroundImage={event.backgroundImage}
      />

      {alter && <AgeRangeSection alter={alter} />}

      <section className="mx-auto" id="info">
        <PricingSection
          pricing={event.preise.priceTiers}
          signupStartDate={event.signupStartDate ?? null}
        />

        <AccommodationSection unterkunft={event.unterkunft} />

        <TeamSection team={event.team} />

        {eigenschaften && eigenschaften.length > 0 && (
          <FeaturesSection eigenschaften={eigenschaften} />
        )}

        <ContactSection />
      </section>
    </section>
  )
}

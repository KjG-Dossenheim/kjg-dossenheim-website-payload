// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// Custom Components
import AccommodationSection from './_components/AccommodationSection'
import AgeRangeSection from './_components/AgeRangeSection'
import ContactSection from './_components/ContactSection'
import FeaturesSection from './_components/FeaturesSection'
import HeroSection from './_components/HeroSection'
import PricingSection from './_components/PricingSection'
import TeamSection from './_components/TeamSection'
import { formatInTimeZone } from 'date-fns-tz/formatInTimeZone'
import { formatDateLocale } from '@/components/common/formatDateLocale'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'sommerfreizeit',
    select: {
      title: true,
      motto: true,
      startDate: true,
      endDate: true,
      alter: true,
      unterkunft: true,
      allgemein: {
        teamFreizeit: true,
        eigenschaften: true,
        pricing: true,
      },
      anmeldungWebsite: true,
      meta: {
        title: true,
        description: true,
      },
    },
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const sommerfreizeit = await getData()
  return {
    title: `${sommerfreizeit.meta?.title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: sommerfreizeit.meta?.description ?? '',
  }
}

export default async function Page() {
  const sommerfreizeit = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Sommerfreizeit ${formatDateLocale(sommerfreizeit.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(
      sommerfreizeit.startDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    endDate: formatInTimeZone(
      sommerfreizeit.endDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    location: {
      '@type': 'Place',
      name: sommerfreizeit.unterkunft.name,
      url: sommerfreizeit.unterkunft.website,
    },
    offers: sommerfreizeit.allgemein.pricing.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: formatInTimeZone(
        sommerfreizeit.startDate,
        process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
        "yyyy-MM-dd'T'HH:mm:ssxxx",
      ),
    })),
    eventStatus: 'https://schema.org/EventScheduled',
    description: `Die Tannenbaumaktion der ${process.env.NEXT_PUBLIC_SITE_NAME}`,
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
      <HeroSection {...sommerfreizeit} />

      <AgeRangeSection {...sommerfreizeit} />

      <section
        className="container mx-auto space-y-6 p-6 sm:space-y-8 sm:p-8 lg:space-y-10 lg:p-10"
        id="info"
      >
        <PricingSection
          pricing={sommerfreizeit.allgemein.pricing}
          anmeldungWebsite={sommerfreizeit.anmeldungWebsite}
        />

        <AccommodationSection {...sommerfreizeit} />

        <TeamSection team={sommerfreizeit.allgemein.teamFreizeit} />

        <FeaturesSection eigenschaften={sommerfreizeit.allgemein.eigenschaften} />

        <ContactSection />
      </section>
    </section>
  )
}

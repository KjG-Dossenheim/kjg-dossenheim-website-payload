// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { SommerfreizeitEvent } from '@/payload-types'

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

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 600

async function getData() {
  const payload = await getPayload({ config })

  const [landingPageData, sommerfreizeit] = await Promise.all([
    payload.findGlobal({
      slug: 'sommerfreizeitLandingPage',
      select: {
        freizeit: true,
        description: true,
      },
    }),
    payload.findGlobal({
      slug: 'sommerfreizeit',
      select: {
        alter: true,
        allgemein: {
          eigenschaften: true,
        },
        meta: {
          title: true,
          description: true,
        },
      },
    }),
  ])

  const eventId =
    typeof landingPageData.freizeit === 'string'
      ? landingPageData.freizeit
      : landingPageData.freizeit?.id

  if (!eventId) {
    throw new Error('Keine Sommerfreizeit im Landing-Global verknuepft.')
  }

  const eventData: SommerfreizeitEvent = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    depth: 2,
  })

  return {
    ...sommerfreizeit,
    teamFreizeit: eventData.team,
    title: eventData.name,
    motto: eventData.motto,
    startDate: eventData.startDate,
    endDate: eventData.endDate ?? eventData.startDate,
    signupStartDate: eventData.signupStartDate,
    landingDescription: landingPageData.description,
    unterkunft: eventData.unterkunft,
    pricing: eventData.preise,
    pretixEventId: eventData.pretixEventId,
    backgroundImage: eventData.backgroundImage,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const sommerfreizeit = await getData()
  return {
    title: `${sommerfreizeit.meta?.title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: sommerfreizeit.meta?.description ?? '',
  }
}

export default async function SommerfreizeitPage() {
  const eventData = await getData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Sommerfreizeit ${formatDateLocale(eventData.startDate, 'yyyy')}`,
    startDate: formatInTimeZone(
      eventData.startDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    endDate: formatInTimeZone(
      eventData.endDate,
      process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
      'yyyy-MM-dd',
    ),
    location: {
      '@type': 'Place',
      name: eventData.unterkunft.name,
      url: eventData.unterkunft.website,
    },
    offers: eventData.pricing.priceTiers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: formatInTimeZone(
        eventData.startDate,
        process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
        "yyyy-MM-dd'T'HH:mm:ssxxx",
      ),
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
      <HeroSection {...eventData} signupStartDate={eventData.signupStartDate ?? null} />

      <AgeRangeSection {...eventData} />

      <section className="container mx-auto" id="info">
        <PricingSection
          pricing={eventData.pricing.priceTiers}
          signupStartDate={eventData.signupStartDate ?? null}
        />

        <AccommodationSection {...eventData} />

        <TeamSection team={eventData.teamFreizeit} />

        <FeaturesSection eigenschaften={eventData.allgemein.eigenschaften} />

        <ContactSection />
      </section>
    </section>
  )
}

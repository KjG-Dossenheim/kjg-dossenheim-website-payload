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
    title: `${sommerfreizeit.meta?.title} | KjG Dossenheim`,
    description: sommerfreizeit.meta?.description ?? '',
  }
}

export default async function Page() {
  const sommerfreizeit = await getData()

  return (
    <section>
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

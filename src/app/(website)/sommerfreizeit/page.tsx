// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// Custom Components
import AccommodationSection from '@/components/features/sommerfreizeit/AccommodationSection'
import AgeRangeSection from '@/components/features/sommerfreizeit/AgeRangeSection'
import ContactSection from '@/components/features/sommerfreizeit/ContactSection'
import FeaturesSection from '@/components/features/sommerfreizeit/FeaturesSection'
import HeroSection from '@/components/features/sommerfreizeit/HeroSection'
import PricingSection from '@/components/features/sommerfreizeit/PricingSection'
import TeamSection from '@/components/features/sommerfreizeit/TeamSection'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'sommerfreizeit',
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
      <HeroSection
        title={sommerfreizeit.title}
        motto={sommerfreizeit.motto}
        startDate={sommerfreizeit.startDate}
        endDate={sommerfreizeit.endDate}
        anmeldungWebsite={sommerfreizeit.anmeldungWebsite}
      />

      <AgeRangeSection alter={sommerfreizeit.alter} />

      <section
        className="container mx-auto space-y-6 p-6 sm:space-y-8 sm:p-8 lg:space-y-10 lg:p-10"
        id="info"
      >
        <PricingSection
          pricing={sommerfreizeit.allgemein.pricing}
          anmeldungWebsite={sommerfreizeit.anmeldungWebsite}
        />

        <AccommodationSection unterkunft={sommerfreizeit.unterkunft} />

        <TeamSection team={sommerfreizeit.allgemein.teamFreizeit} />

        <FeaturesSection eigenschaften={sommerfreizeit.allgemein.eigenschaften} />

        <ContactSection />
      </section>
    </section>
  )
}

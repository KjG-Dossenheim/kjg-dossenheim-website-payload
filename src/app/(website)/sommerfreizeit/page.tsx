import React from 'react'

import { getPayload } from 'payload'
import config from '@payload-config'

import { Metadata } from 'next'

import HeroSection from '@/components/sommerfreizeit/HeroSection'
import AgeRangeSection from '@/components/sommerfreizeit/AgeRangeSection'
import PricingSection from '@/components/sommerfreizeit/PricingSection'
import AccommodationSection from '@/components/sommerfreizeit/AccommodationSection'
import TeamSection from '@/components/sommerfreizeit/TeamSection'
import FeaturesSection from '@/components/sommerfreizeit/FeaturesSection'
import ContactSection from '@/components/sommerfreizeit/ContactSection'

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
        className="mx-auto max-w-(--breakpoint-xl) space-y-6 p-6 sm:space-y-8 sm:p-8 lg:space-y-10 lg:p-10"
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

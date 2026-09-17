// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Custom Components
import EventLandingPage from './_components/EventLandingPage'
import UniversalLandingPage from './_components/UniversalLandingPage'
import { getSommerfreizeitPage } from '@/utilities/sommerfreizeitPage'

// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const { settings, meta } = await getSommerfreizeitPage()

  return {
    title: `${meta?.title || settings.headline || 'Sommerfreizeit'} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: meta?.description ?? '',
  }
}

export default async function SommerfreizeitPage() {
  const data = await getSommerfreizeitPage()

  if (data.mode === 'event') {
    return (
      <EventLandingPage event={data.event} alter={data.alter} eigenschaften={data.eigenschaften} />
    )
  }

  return (
    <UniversalLandingPage
      headline={data.settings.headline}
      subline={data.settings.subline}
      description={data.settings.description}
      heroImage={data.settings.heroImage}
      alter={data.alter}
      eigenschaften={data.eigenschaften}
      nextYear={data.nextYear}
    />
  )
}

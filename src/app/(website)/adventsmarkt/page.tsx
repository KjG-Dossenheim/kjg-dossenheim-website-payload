// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// Custom Components
import Date from '@/components/date'
import { RichText } from '@/components/RichText'

async function getData() {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'adventsmarkt',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const adventsmarkt = await getData()
  return {
    title: `${adventsmarkt.meta?.title} | KjG Dossenheim`,
    description: `${adventsmarkt.meta?.description}`,
  }
}

export default async function Page() {
  const adventsmarkt = await getData()

  return (
    <section className="container mx-auto p-5 text-center">
      <h1 className="text-3xl font-bold">Adventsmarkt</h1>
      <p className="p-2 text-lg">
        <Date dateString={adventsmarkt.startDate} formatString="EEEE, d. MMMM yyyy" /> bis{' '}
        <Date dateString={adventsmarkt.endDate} formatString="EEEE, d. MMMM yyyy" />{' '}
      </p>
      <RichText data={adventsmarkt.content} />
    </section>
  )
}

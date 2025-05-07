import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Date from '@/components/date'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Metadata } from 'next'

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
    <section className="mx-auto max-w-(--breakpoint-lg) p-5 text-center">
      <h1 className="text-3xl font-bold">Adventsmarkt</h1>
      <p className="p-2 text-lg">
        <Date dateString={adventsmarkt.startDate} formatString="EEEE, d. MMMM yyyy" /> bis{' '}
        <Date dateString={adventsmarkt.endDate} formatString="EEEE, d. MMMM yyyy" />{' '}
      </p>
      <RichText className="RichText" data={adventsmarkt.content} />
    </section>
  )
}

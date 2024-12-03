import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Date from '@/components/date'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Adventsmarkt | KjG Dossenheim',
    description: 'Der Adventsmarkt der kath. Kirchengemeinde Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const adventsmarkt = await payload.findGlobal({
    slug: 'adventsmarkt',
  })

  return (
    <section className='text-center p-5 max-w-screen-lg mx-auto'>
      <h1 className='text-3xl font-bold'>Adventsmarkt</h1>
      <p className='p-2 text-lg'><Date dateString={adventsmarkt.startDate} formatString='EEEE, d. MMMM yyyy'/> bis <Date dateString={adventsmarkt.endDate} formatString='EEEE, d. MMMM yyyy'/> </p>
      <RichText className='RichText' data={adventsmarkt.content} />
    </section>
  )
}

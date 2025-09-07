import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

import Date from '@/components/date'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Martinsumzug | KjG Dossenheim',
    description: 'Der Martinsumzug der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const martinsumzug = await payload.findGlobal({
    slug: 'martinsumzug',
  })

  return (
    <section className="mx-auto max-w-(--breakpoint-lg) p-5">
      <h1 className="text-center text-3xl font-bold">Martinsumzug</h1>
      <p className="p-2 text-center text-lg">
        <Date dateString={martinsumzug.startDate} formatString="EEEE, d. MMMM yyyy" /> ab{' '}
        <Date dateString={martinsumzug.startDate} formatString="H:mm" />{' '}
      </p>
      <RichTextdata={martinsumzug.content} />
    </section>
  )
}

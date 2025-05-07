import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Über uns | KjG Dossenheim',
    description: 'Erfahre mehr über die KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const about = await payload.findGlobal({
    slug: 'about',
  })

  return (
    <section
      className="sm:max-w-(--breakpoint-lg) mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="text-3xl font-bold text-center mb-8">Über uns</h1>
        <RichText className='RichText' data={about.content} />
    </section>
  )
}

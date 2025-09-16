import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@/components/RichText'

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
    <section className="mx-auto px-4 py-8 sm:container sm:px-6 lg:px-8 lg:py-14">
      <h1 className="mb-8 text-center text-3xl font-bold">Über uns</h1>
      <RichText data={about.content} />
    </section>
  )
}

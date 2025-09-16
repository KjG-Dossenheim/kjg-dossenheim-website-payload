import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@/components/RichText'

import type { Metadata } from 'next'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <section className="container mx-auto">
      <CardHeader>
        <CardTitle>Über uns</CardTitle>
      </CardHeader>
      <CardContent>
        <RichText data={about.content} />
      </CardContent>
    </section>
  )
}

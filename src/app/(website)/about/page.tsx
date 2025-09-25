// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// UI Components
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Custom Components
import { RichText } from '@/components/utils/RichText'
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

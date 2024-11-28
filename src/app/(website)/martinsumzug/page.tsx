import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Martinsumzug | KjG Dossenheim',
    description: 'Der Martinsumzug der KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section>R</section>
  )
}

import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@/components/RichText'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
    select: {
      agb: true,
    },
  })

  return (
    <section className="mx-auto px-4 py-8 sm:container sm:px-6 lg:px-8 lg:py-14">
      <RichText data={rechtliches.agb.text} />
    </section>
  )
}

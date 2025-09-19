import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
    select: {
      datenschutz: {
        sommerfreizeit: true,
      },
    },
  })

  return (
    <section className="container mx-auto p-6">
      <RichText data={rechtliches.datenschutz.sommerfreizeit.text} />
    </section>
  )
}

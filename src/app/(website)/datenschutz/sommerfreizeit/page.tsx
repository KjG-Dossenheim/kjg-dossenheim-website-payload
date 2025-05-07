import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
  })

  return (
    <section className="mx-auto px-4 py-8 sm:max-w-(--breakpoint-lg) sm:px-6 lg:px-8 lg:py-14">
      <RichText className="RichText" data={rechtliches.datenschutz.sommerfreizeit.text} />
    </section>
  )
}

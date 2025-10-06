import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
    select: {
      impressum: true,
    },
  })

  return (
    <section className="container mx-auto">
      <CardContent>
        <CardHeader>
          <CardTitle>Impressum</CardTitle>
        </CardHeader>
        <CardContent>
          <RichText data={rechtliches.impressum.text} />
        </CardContent>
      </CardContent>
    </section>
  )
}

import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const rechtliches = await payload.findGlobal({
    slug: 'rechtliches',
  })

  return (
    <div
      className="sm:max-w-screen-lg mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div id='RichText' dangerouslySetInnerHTML={{ __html: rechtliches.agb.html || '' }} />
    </div>
  )
}

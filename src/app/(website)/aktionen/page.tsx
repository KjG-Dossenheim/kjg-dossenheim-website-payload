import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayloadHMR({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <h1 className='dark:text-white'>Test</h1>
  )
}
import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section className='h-screen flex items-center justify-center'>
      <h1 className='text-center text-3xl'>Test</h1>
    </section>
  )
}

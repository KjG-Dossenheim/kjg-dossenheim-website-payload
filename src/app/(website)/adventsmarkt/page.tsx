import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Date from '@/components/date'

export default async function Page() {
  const payload = await getPayload({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <section className='text-center p-5 max-w-screen-lg mx-auto'>
      <h1 className='text-3xl font-bold'>Adventsmarkt</h1>
      <p className='p-2 text-lg'><Date dateString={aktionen?.adventsmarkt.startDate} formatString='EEEE, d. MMMM yyyy'/> bis <Date dateString={aktionen?.adventsmarkt.endDate} formatString='EEEE, d. MMMM yyyy'/> </p>
      <div id='RichText' dangerouslySetInnerHTML={{ __html: aktionen.adventsmarkt.html || '' }} />
    </section>
  )
}

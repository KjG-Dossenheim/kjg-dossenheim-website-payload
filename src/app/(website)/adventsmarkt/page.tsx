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
    <div className='text-center py-5 '>
      <h1 className='text-3xl text-secondary-500 font-bold'>Adventsmarkt</h1>
      <p><Date dateString={aktionen?.adventsmarkt.startDate} formatString='EEEE, d. MMMM yyyy'></Date></p>
    </div>
  )
}

import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { getSommerfreizeitPage } from '@/utilities/sommerfreizeitPage'
import { OrderLookupForm } from './OrderLookupForm'

export default async function AnmeldungPage() {
  const data = await getSommerfreizeitPage()

  if (data.mode !== 'event') {
    redirect('/sommerfreizeit')
  }

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <Suspense fallback={null}>
        <OrderLookupForm />
      </Suspense>
    </section>
  )
}

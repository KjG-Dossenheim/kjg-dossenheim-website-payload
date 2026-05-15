import { Suspense } from 'react'

import { OrderLookupForm } from './OrderLookupForm'

export default async function AnmeldungPage() {
  return (
    <section className="container mx-auto max-w-4xl p-6">
      <Suspense fallback={null}>
        <OrderLookupForm />
      </Suspense>
    </section>
  )
}

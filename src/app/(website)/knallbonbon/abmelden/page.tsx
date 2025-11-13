import React from 'react'
import { KnallbonbonAbmeldenForm } from './form'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Von Knallbonbon abmelden | ' + process.env.NEXT_PUBLIC_SITE_NAME,
    description: 'Melden Sie sich von einem Knallbonbon Event ab',
  }
}

export default function KnallbonbonAbmeldenPage() {
  return (
    <section className="mx-auto max-w-2xl p-6">
      <KnallbonbonAbmeldenForm />
    </section>
  )
}

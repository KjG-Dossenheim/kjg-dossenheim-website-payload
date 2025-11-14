import React from 'react'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const ContactForm = dynamic(() => import('./form'), {
  loading: () => (
    <div className="container mx-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  ),
})

export function generateMetadata(): Metadata {
  return {
    title: `Kontakt | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Kontaktiere die ${process.env.NEXT_PUBLIC_SITE_NAME} für Fragen, Anregungen oder Informationen.`,
  }
}

export default function KontaktPage() {
  return <ContactForm />
}

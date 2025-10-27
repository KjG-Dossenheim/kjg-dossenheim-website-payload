import React from 'react'
import ContactForm from './form'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: `Kontakt | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Kontaktiere die ${process.env.NEXT_PUBLIC_SITE_NAME} für Fragen, Anregungen oder Informationen.`,
  }
}

export default function KontaktPage() {
  return <ContactForm />
}

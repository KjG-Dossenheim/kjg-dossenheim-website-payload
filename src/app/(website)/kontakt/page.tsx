import React from 'react'
import ContactForm from './form'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Kontakt | KjG Dossenheim',
    description: 'Kontaktiere die KjG Dossenheim für Fragen, Anregungen oder Informationen.',
  }
}

export default function KontaktPage() {
  return <ContactForm />
}

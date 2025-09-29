// External libraries
import React from 'react'
import MitgliedForm from './form'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Mitglied werden | KjG Dossenheim',
    description: 'Stelle einen Antrag auf Mitgliedschaft bei der KjG Dossenheim.',
  }
}

export default function MitgliedPage() {
  return <MitgliedForm />
}

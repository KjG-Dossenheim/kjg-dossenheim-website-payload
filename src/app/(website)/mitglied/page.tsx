// External libraries
import React from 'react'
import MitgliedForm from './form'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: `Mitglied werden | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Stelle einen Antrag auf Mitgliedschaft bei der ${process.env.NEXT_PUBLIC_SITE_NAME}.`,
  }
}

export default function MitgliedPage() {
  return <MitgliedForm />
}

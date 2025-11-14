// External libraries
import React from 'react'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const MitgliedForm = dynamic(() => import('./form'), {
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
    title: `Mitglied werden | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Stelle einen Antrag auf Mitgliedschaft bei der ${process.env.NEXT_PUBLIC_SITE_NAME}.`,
  }
}

export default function MitgliedPage() {
  return <MitgliedForm />
}

import React from 'react'
import type { Metadata } from 'next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'KjG Dossenheim',
  }
}
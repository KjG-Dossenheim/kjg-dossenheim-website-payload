import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import React, { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { PayloadAdminBar } from '@payloadcms/admin-bar'

import '@/styles/globals.css'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'KjG Dossenheim',
    description: 'Die KjG Dossenheim ist ein katholischer Jugendverband in Dossenheim',
    openGraph: {
      title: 'KjG Dossenheim',
      description: 'Die KjG Dossenheim ist ein katholischer Jugendverband in Dossenheim',
      url: 'https://kjg-dossenheim.org',
      siteName: 'KjG Dossenheim',
      locale: 'de_DE',
      type: 'website',
    },
  }
}

export default function layout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="de">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="relative min-h-svh">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

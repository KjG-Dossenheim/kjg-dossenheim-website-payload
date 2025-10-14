// React and Next.js
import React, { ReactNode } from 'react'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

// Custom Components
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { ThemeProvider } from '@/components/common/theme-provider'

// Styles
import '@/styles/globals.css'

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

export default async function layout({ children }: { children: ReactNode }) {
  const payload = await getPayload({ config })
  const header = await payload.findGlobal({
    slug: 'header',
  })
  return (
    <html lang="de">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar headerData={header} />
          <main className="relative min-h-svh">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

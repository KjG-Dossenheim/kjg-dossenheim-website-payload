import HeaderServer from '@/blocks/global/Header/Server'
import FooterServer from '@/blocks/global/Footer/Server'
import React, { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

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
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeaderServer />
            <main className="relative min-h-screen">{children}</main>
          <FooterServer />
        </ThemeProvider>
      </body>
    </html>
  )
}

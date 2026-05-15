// React and Next.js
import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'

// Custom Components
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { ThemeProvider } from '@/components/common/theme-provider'

// Styles
import '@/styles/globals.css'

// Fonts
import { Caveat } from 'next/font/google'
import { WebVitals } from '@/utilities/web-vitals'
import { Toaster } from 'sonner'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caveat',
  display: 'swap',
  preload: true,
})

export function generateMetadata(): Metadata {
  return {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Die ${process.env.NEXT_PUBLIC_SITE_NAME} ist ein katholischer Jugendverband in Dossenheim`,
    openGraph: {
      title: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: `Die ${process.env.NEXT_PUBLIC_SITE_NAME} ist ein katholischer Jugendverband in Dossenheim`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      siteName: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
      locale: 'de_DE',
      type: 'website',
    },
  }
}

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${caveat.variable}`}>
      <head>
        <Script
          strategy="lazyOnload"
          src="https://umami.kjg-dossenheim.org/getinfo"
          data-website-id="28ba9cdf-64ba-4208-b563-ae563b100185"
        />
      </head>
      <body>
        {process.env.NODE_ENV === 'development' && <WebVitals />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="relative min-h-svh">{children}</main>
          <Toaster />
          <Toaster id="form" richColors />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

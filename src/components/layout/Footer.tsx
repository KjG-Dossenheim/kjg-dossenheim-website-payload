export const revalidate = 600 // seconds (regenerate every 1 minute)

import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

import { SiWhatsapp, SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons'

import { Copyright, Mail, Phone } from 'lucide-react'

import { CardContent, CardFooter, CardHeader, CardDescription } from '@/components/ui/card'

export default async function FooterServer() {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({
    slug: 'footer',
  })

  return (
    <footer className="container mx-auto max-h-fit">
      <div className="flex flex-wrap md:flex-row md:justify-between">
        <div>
          <CardHeader className="max-h-fit space-y-1">
            <h2 className="font-semibold uppercase">Spendenkonto</h2>
            <p className="font-mono">Katholische junge Gemeinde Dossenheim n.e.V.</p>
            <p className="font-mono">DE56 6725 0020 0009 3866 61</p>
            <p className="font-mono">SOLADES1HDB</p>
          </CardHeader>
        </div>
        <div className="flex flex-wrap md:flex-row md:justify-end">
          <CardHeader className="max-h-fit space-y-1">
            <h2 className="font-semibold uppercase">Folge uns</h2>
            <ul className="list-none space-y-2">
              {footer.socialLinks.map((socialLink) => (
                <li key={socialLink.id}>
                  <a href={socialLink.url} className="flex items-center gap-2 hover:underline">
                    {(() => {
                      const IconMap = {
                        SiWhatsapp: SiWhatsapp,
                        SiFacebook: SiFacebook,
                        SiInstagram: SiInstagram,
                      }
                      const IconComponent = IconMap[socialLink.icon]
                      return IconComponent ? <IconComponent className="size-4" /> : null
                    })()}
                    {socialLink.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardHeader>
          <CardHeader className="max-h-fit space-y-1">
            <h2 className="font-semibold uppercase">Kontakt</h2>
            <ul className="list-none space-y-2">
              <li>
                <a
                  href={`mailto:${footer.email}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Mail className="size-4" />
                  E-Mail
                </a>
              </li>
              <li>
                <a href={`tel:${footer.phone}`} className="flex items-center gap-2 hover:underline">
                  <Phone className="size-4" /> Telefon
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${footer.whatsapp}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <SiWhatsapp className="size-4" /> WhatsApp
                </a>
              </li>
            </ul>
          </CardHeader>
          <CardHeader className="max-h-fit space-y-1">
            <h2 className="gap-2 font-semibold uppercase">Rechtliches</h2>
            <ul className="list-none space-y-2">
              <li>
                <a href="/agb" className="hover:underline">
                  AGB
                </a>
              </li>
              <li>
                <a href="/datenschutz" className="hover:underline">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="/impressum" className="hover:underline">
                  Impressum
                </a>
              </li>
            </ul>
          </CardHeader>
        </div>
      </div>
      <CardFooter>
        <span className="flex flex-wrap items-center justify-start gap-1">
          <Copyright className="size-4" /> {new Date().getFullYear()}
          <Link href="/" className="hover:underline">
            Katholische junge Gemeinde Dossenheim n.e.V.
          </Link>
        </span>
      </CardFooter>
    </footer>
  )
}

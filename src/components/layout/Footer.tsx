import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'

import { SiWhatsapp, SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons'

import { Mail, Phone } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default async function FooterServer() {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({
    slug: 'footer',
  })

  return (
    <footer className="container mx-auto max-h-fit">
      <div className="flex flex-wrap md:flex-row md:justify-end">
        <CardContent className="max-h-fit space-y-1 p-6">
          <h2 className="font-semibold uppercase">Folge uns</h2>
          <ul className="list-none space-y-2">
            {footer.socialLinks.map((socialLink) => (
              <li key={socialLink.id}>
                <a href={socialLink.link} className="flex items-center gap-2 hover:underline">
                  {(() => {
                    const IconMap = {
                      SiWhatsapp: SiWhatsapp,
                      SiFacebook: SiFacebook,
                      SiInstagram: SiInstagram,
                    }
                    const IconComponent = IconMap[socialLink.icon]
                    return IconComponent ? <IconComponent className="size-4" /> : null
                  })()}
                  {socialLink.label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardContent className="max-h-fit space-y-1 p-6">
          <h2 className="font-semibold uppercase">Kontakt</h2>
          <ul className="list-none space-y-2">
            <li>
              <a
                href="mailto:kontakt@kjg-dossenheim.org"
                className="flex items-center gap-2 hover:underline"
              >
                <Mail className="size-4" />
                E-Mail
              </a>
            </li>
            <li>
              <a href="tel:072161906054" className="flex items-center gap-2 hover:underline">
                <Phone className="size-4" /> Telefon
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/4972161906054"
                className="flex items-center gap-2 hover:underline"
              >
                <SiWhatsapp className="size-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </CardContent>
        <CardContent className="max-h-fit space-y-1 p-6">
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
        </CardContent>
      </div>
      <CardFooter>
        <span>
          © {new Date().getFullYear()}{' '}
          <Link href="/" className="hover:underline">
            KjG Dossenheim
          </Link>
        </span>
      </CardFooter>
    </footer>
  )
}

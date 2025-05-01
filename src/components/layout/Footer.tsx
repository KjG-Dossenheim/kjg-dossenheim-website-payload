import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'

import { SiWhatsapp } from '@icons-pack/react-simple-icons'

import { Mail, Phone } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default async function FooterServer() {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({
    slug: 'footer',
  })

  return (
    <footer className="mx-auto max-w-screen-xl p-4">
      <Card className="max-h-fit">
        <div className="flex flex-wrap md:flex-row md:justify-end">
          <CardContent className="max-h-fit space-y-1 p-6">
            <h2 className="font-semibold uppercase">Folge uns</h2>
            <ul className="list-none space-y-2">
              {footer.socialLinks.map((socialLink) => (
                <li key={socialLink.id}>
                  <a href={socialLink.link} className="hover:underline">
                    {socialLink.label}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardContent className="max-h-fit space-y-1 p-6">
            <h2 className="font-semibold uppercase">Kontakt</h2>
            <ul className="list-none space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <a href="mailto:kontakt@kjg-dossenheim.org" className="hover:underline">
                  E-Mail
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <a href="tel:072161906054" className="hover:underline">
                  Telefon
                </a>
              </li>
              <li className="flex items-center gap-2">
                <SiWhatsapp className="size-4" />
                <a href="https://wa.me/4972161906054" className="hover:underline">
                  WhatsApp
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
      </Card>
    </footer>
  )
}

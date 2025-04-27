import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

export default async function FooterServer() {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({
    slug: 'footer',
  })

  return (
    <footer className="bg-primary p-4 sm:p-6">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between">
          <div className="mb-6 grid content-between md:mb-0"></div>
          <div className="sm:gap-6d grid min-w-fit grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h2 className="mb-2 py-0 text-sm font-semibold uppercase text-primary-foreground dark:text-foreground">
                Folge uns
              </h2>
              <ul className="space-y-2">
                {footer.socialLinks.map((socialLink) => (
                  <li key={socialLink.id} className="list-none">
                    <a
                      href={socialLink.link}
                      className="text-primary-foreground hover:underline dark:text-foreground"
                    >
                      {socialLink.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-2 py-0 text-sm font-semibold uppercase text-primary-foreground dark:text-foreground">
                Kontakt
              </h2>
              <ul className="space-y-2">
                <li className="list-none">
                  <a
                    href="mailto:kontakt@kjg-dossenheim.org"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    E-Mail
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="tel:072161906054"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    Telefon
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="https://wa.me/4972161906054"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 py-0 text-sm font-semibold uppercase text-primary-foreground dark:text-foreground">
                Rechtliches
              </h2>
              <ul className="space-y-2 text-secondary-600">
                <li className="list-none">
                  <a
                    href="/agb"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    AGB
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="/datenschutz"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    Datenschutz
                  </a>
                </li>
                <li className="list-none">
                  <a
                    href="/impressum"
                    className="text-primary-foreground hover:underline dark:text-foreground"
                  >
                    Impressum
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-primary-foreground dark:text-foreground sm:text-center">
            © {new Date().getFullYear()}{' '}
            <Link href="/" className="hover:underline">
              KjG Dossenheim
            </Link>
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

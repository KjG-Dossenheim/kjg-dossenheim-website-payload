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
      <footer className="p-4 bg-primary sm:p-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0 grid content-between"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-6d text-sm min-w-fit">
              <div>
                <h2 className="py-0 mb-2 text-sm font-semibold text-primary-foreground dark:text-foreground uppercase">Folge uns</h2>
                <ul className="space-y-2">
                  {footer.socialLinks.map((socialLink) => (
                    <li key={socialLink.id} className="list-none">
                      <a href={socialLink.link} className="hover:underline text-primary-foreground dark:text-foreground">
                        {socialLink.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="py-0 mb-2 text-sm font-semibold text-primary-foreground dark:text-foreground uppercase">Kontakt</h2>
                <ul className="space-y-2">
                  <li className="list-none">
                    <a
                      href="mailto:kontakt@kjg-dossenheim.org"
                      className="hover:underline text-primary-foreground dark:text-foreground"
                    >
                      E-Mail
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="tel:072161906054" className="hover:underline text-primary-foreground dark:text-foreground">
                      Telefon
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="https://wa.me/4972161906054" className="hover:underline text-primary-foreground dark:text-foreground">
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="py-0 mb-2 text-sm font-semibold text-primary-foreground dark:text-foreground uppercase">
                  Rechtliches
                </h2>
                <ul className="text-secondary-600 space-y-2">
                  <li className="list-none">
                    <a href="agb" className="hover:underline text-primary-foreground dark:text-foreground">
                      AGB
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="datenschutz" className="hover:underline text-primary-foreground dark:text-foreground">
                      Datenschutz
                    </a>
                  </li>
                  <li className="list-none">
                    <a href="impressum" className="hover:underline text-primary-foreground dark:text-foreground">
                      Impressum
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 sm:mx-auto lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm sm:text-center text-primary-foreground dark:text-foreground">
              © {new Date().getFullYear()} <Link href="/" className="hover:underline">KjG Dossenheim</Link>. All Rights
              Reserved.
            </span>
          </div>
        </div>
      </footer>
  )
}

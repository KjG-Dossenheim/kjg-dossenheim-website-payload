import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'

export default async function HeaderServer() {
  const payload = await getPayloadHMR({ config })
  const header = await payload.findGlobal({
    slug: 'header',
  })

  return (
    <nav className="bg-primary-500 dark:bg-secondary-500 px-4 lg:px-6 py-2 h-content fixed w-full z-20 top-0 start-0">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <Link href="/" className="flex items-center text-white">
          <div className="h-4 relative">
            <Image alt={header.logo.alt} src={header.logo.url} fill className="object-cover" />
          </div>
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            KjG Dossenheim
          </span>
        </Link>
        <button data-collapse-toggle="mega-menu-full" type="button"
      className="inline-flex items-center p-2 size-10 justify-center text-sm text-white rounded-lg md:hidden hover:text-primary-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-200   "
      aria-controls="mega-menu-full" aria-expanded="true">
      <span className="sr-only">Open main menu</span>
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M1 1h15M1 7h15M1 13h15" />
      </svg>
    </button>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
        <ol role="menu" aria-label="menu"
        className="flex flex-col md:p-0 mt-4 md:flex-row md:space-x-4 lg:space-x-12 md:mt-0 text-white">
          <li>
            <Link href="/" className="block text-white font-medium py-2">Startseite</Link>
          </li>
            {header.navigation.map((item) => {
              return (
                <li key={item.id} className="relative group">
                  <Link
                  href={item.link}
                  className="block text-white font-medium py-2"
                >
                  {item.label}
                </Link>
                {item.dropdown && item.dropdown.length > 0 && (
                  <ul className="absolute hidden group-hover:block bg-primary-500 dark:bg-secondary-500 mt-2 py-2 rounded shadow-lg">
                    {item.dropdown.map((dropdown) => (
                      <li key={dropdown.id}>
                        <Link
                          href={dropdown.link}
                          className="block text-white font-medium py-2 px-4 hover:bg-primary-600 dark:hover:bg-secondary-600"
                        >
                          {dropdown.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </nav>
  )
}

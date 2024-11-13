import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

export default async function Page() {
  const payload = await getPayloadHMR({ config })
  const startseite = await payload.findGlobal({
    slug: 'startseite',
  })

  return (
    <section>
      <section>
        <div className="py-20 px-4 mx-auto max-w-screen-xl text-center lg:py-32">
          {startseite.neuigkeiten.enabled && (
            <a
              href={startseite.neuigkeiten.link}
              className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-secondary-700 bg-secondary-100 rounded-full dark:bg-secondary-800 dark:text-white hover:bg-secondary-200 dark:hover:bg-secondary-700"
              role="alert"
            >
              <span className="text-xs bg-primary-500 rounded-full text-white px-4 py-1.5 mr-3">
                Neuigkeiten{' '}
              </span>
              <span className="text-sm font-medium">{startseite.neuigkeiten.title}</span>
              <svg
                className="animate-pulse ml-2 size-5 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          )}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-secondary-500 dark:text-primary-500">
            Willkommen bei der KjG
          </h1>
          <p className="mb-8 text-lg font-normal text-secondary-500 lg:text-xl sm:px-16 lg:px-48 dark:text-primary-500">
            Die KjG Dossenheim vertritt die Interessen der Kinder und Jugendlichen in der
            katholischen Gemeinden Dossenheim
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <Link href="/aktionen" className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-full bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300'>Unsere Aktionen
              <svg
                className="ml-2.5 w-4 h-4 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm14-7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-5-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
              </svg></Link>
            <Link
              href="/about/"
              className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-secondary-900 rounded-full border border-primary-500 hover:bg-primary-100 focus:ring-4 focus:ring-white dark:bg-white dark:hover:bg-transparent dark:hover:text-white"
            >
              Über uns
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}

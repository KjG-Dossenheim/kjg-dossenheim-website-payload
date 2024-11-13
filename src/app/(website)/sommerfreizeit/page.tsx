import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import Date from 'src/components/date'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from 'flowbite-react'
import type { CustomFlowbiteTheme } from 'flowbite-react'
import { Flowbite } from 'flowbite-react'

const accordionTheme: CustomFlowbiteTheme = {
  accordion: {
    root: {
      base: 'max-w-screen-xl mx-auto divide-y divide-gray-200 border-gray-200 dark:divide-gray-700 dark:border-gray-700',
      flush: {
        off: 'rounded-lg border',
        on: 'border-b',
      },
    },
    content: {
      base: 'p-5 first:rounded-t-lg last:rounded-b-lg',
    },
    title: {
      arrow: {
        base: 'h-6 w-6 shrink-0',
        open: {
          off: '',
          on: 'rotate-180',
        },
      },
      base: 'flex w-full items-center justify-between p-5 text-left font-medium text-secondary-500 first:rounded-t-lg last:rounded-b-lg dark:text-primary-500',
      flush: {
        off: 'hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-800',
        on: 'bg-transparent dark:bg-transparent',
      },
      heading: '',
      open: {
        off: '',
        on: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white',
      },
    },
  },
  megaMenu: {
    root: {
      "base": "bg-primary-500 px-4 lg:px-6 py-3 dark:border-gray-700 dark:bg-secondary-500 sm:px-4",
      "rounded": {
        "on": "rounded",
        "off": ""
      },
      "bordered": {
        "on": "border",
        "off": ""
      },
      "inner": {
        "base": "mx-auto flex flex-wrap items-center justify-between",
        "fluid": {
          "on": "",
          "off": "container"
        }
      }
    },
    brand: {
      base: "flex items-center"
    },
    collapse: {
      base: "w-full md:block md:w-auto",
      list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8 md:text-sm md:font-medium",
      hidden: {
        on: "hidden",
        off: ""
      }
    },
    link: {
      base: "block py-2 pl-3 pr-4 md:p-0 text-nowrap",
      active: {
        on: "bg-cyan-700 text-white dark:text-white md:bg-transparent md:text-cyan-700",
        off: "border-b border-gray-100 text-white hover:bg-gray-50 dark:border-gray-700 dark:text-white  dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white"
      },
      disabled: {
        on: "text-gray-400 hover:cursor-not-allowed dark:text-gray-600",
        off: ""
      }
    },
    toggle: {
      base: "inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-white  dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden",
      icon: "h-6 w-6 shrink-0"
    },
    dropdown: {
      base: "",
      toggle: {
        arrowIcon: "ml-2 h-4 w-4",
        content: "py-1 focus:outline-none",
        floating: {
          animation: "transition-opacity",
          arrow: {
            base: "absolute z-10 h-2 w-2 rotate-45",
            style: {
              dark: "bg-gray-900 dark:bg-gray-700",
              light: "bg-white",
              auto: "bg-white dark:bg-gray-700"
            },
            placement: "-4px"
          },
          base: "z-10 w-fit divide-y divide-gray-100 rounded shadow focus:outline-none mt-2 block",
          content: "py-1 text-sm text-gray-500 dark:text-white ",
          divider: "my-1 h-px bg-gray-100 dark:bg-gray-600",
          header: "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200",
          hidden: "invisible opacity-0",
          item: {
            container: "",
            base: "flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-white dark:hover:bg-white dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white",
            icon: "mr-2 h-4 w-4"
          },
          style: {
            dark: "bg-gray-900 text-white dark:bg-gray-700",
            light: "border border-gray-200 bg-white text-gray-900",
            auto: "border border-gray-200 bg-white dark:border-none dark:bg-gray-700 text-gray-500 dark:text-white "
          },
          target: "w-fit"
        },
        inlineWrapper: "flex w-full items-center justify-between"
      }
    },
    dropdownToggle: {
      base: "py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-white hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white flex w-full items-center justify-between"
    }
  }
}

export default async function Page() {
  const payload = await getPayloadHMR({ config })
  const aktionen = await payload.findGlobal({
    slug: 'aktionen',
  })

  return (
    <div className="pb-4">
      <section>
        <div className="px-4 mx-auto text-center py-24 lg:py-56">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-primary-500 md:text-5xl lg:text-6xl">
            {aktionen.sommerfreizeit.allgemein.title}
          </h1>
          <h2>{aktionen.sommerfreizeit.allgemein.motto}</h2>
          <p className="mb-8 text-lg font-normal text-primary-500 lg:text-xl sm:px-16 lg:px-48">
            <Date dateString={aktionen.sommerfreizeit.allgemein.startDate} /> bis{' '}
            <Date dateString={aktionen.sommerfreizeit.allgemein.endDate} />
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <a
              href={aktionen.sommerfreizeit.anmeldung.website}
              target="_blank"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-full bg-primary-500 dark:bg-secondary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-700"
            >
              Jetzt anmelden
              <svg
                className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                ></path>
              </svg>
            </a>
            <a
              href="#info"
              className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-primary-500 rounded-full border-primary-500 border hover:bg-gray-100 focus:ring-4 focus:ring-primary-500"
            >
              Informationen
            </a>
          </div>
        </div>
      </section>
      <section id="info">
        <div className="py-4 sm:py-16 px-4 text-center bg-primary-500 dark:bg-secondary-500">
          <h2 className="text-3xl sm:text-4xl text-white mb-4 font-extrabold leading-loose tracking-tight">
            Für <span className="underline decoration-8 decoration-accent-500">alle</span> Kinder
            zwischen {aktionen.sommerfreizeit.allgemein.alter}
          </h2>
        </div>
      </section>
      <section className="overflow-hidden md:grid md:grid-cols-2">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:md:text-left rtl:md:text-right">
            <h2 className="text-2xl font-bold md:text-3xl text-secondary-500 dark:text-primary-500">
              Unterkunft
            </h2>
            <p className="text-secondary-500 dark:text-primary-500 md:mt-4">
              {aktionen.sommerfreizeit.unterkunft.beschreibung}
            </p>
            <div className="mt-4 md:mt-8">
              <a
                href={aktionen.sommerfreizeit.unterkunft.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-primary-500 dark:bg-secondary-500 px-12 py-3 text-sm font-medium text-white transition hover:bg-primary-600 focus:outline-none focus:ring focus:ring-yellow-400"
              >
                {aktionen.sommerfreizeit.unterkunft.name}
              </a>
            </div>
          </div>
        </div>
        <div className="relative w-full sm:h-full">
          {typeof aktionen.sommerfreizeit.unterkunft.bild !== 'string' &&
            aktionen.sommerfreizeit.unterkunft.bild && (
              <Image
                src={aktionen.sommerfreizeit.unterkunft.bild.url || ''}
                alt={aktionen.sommerfreizeit.unterkunft.bild.alt || 'Unterkunft Bild'}
                fill
                className="object-cover"
              />
            )}
        </div>
      </section>
      <section className="max-w-screen-xl p-6 sm:p-8 lg:p-10 mx-auto">
        <h1 className="text-center pb-8 text-4xl text-secondary-500 dark:text-primary-500 font-bold">
          Teilnehmerbeitrag
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-3 md:gap-8">
          {aktionen.sommerfreizeit.allgemein.pricing.map((item) => {
            return (
              <div
                key={item.name}
                className="bg-secondary-50 dark:bg-secondary-500 border border-secondary-200 dark:border-secondary-700 divide-y divide-secondary-200 rounded-2xl shadow-sm"
              >
                <div className="p-6 sm:px-8">
                  <h2 className="text-lg font-medium text-primary-500 dark:text-white">
                    {item.name}
                    <span className="sr-only">Plan</span>
                  </h2>
                  <p className="mt-2 text-secondary-500 dark:text-white">{item.beschreibung}</p>
                  <p className="mt-2 sm:mt-4">
                    <strong className="text-3xl font-bold text-primary-500 dark:text-white sm:text-4xl">
                      {item.price}€
                    </strong>
                    <span className="text-sm font-medium text-primary-500 dark:text-white">
                      /pro Teilnehmer
                    </span>
                  </p>
                  <a
                    className="mt-4 block rounded-full border border-primary-500 bg-primary-500 dark:text-white px-12 py-3 text-center text-sm font-medium text-white hover:bg-transparent hover:text-primary-500 focus:outline-none focus:ring active:text-primary-400 sm:mt-6"
                    target="_blank"
                    href={aktionen.sommerfreizeit.anmeldung.website}
                  >
                    Jetzt anmelden
                  </a>
                </div>
                <div className="p-6 sm:px-8">
                  <p className="text-lg font-medium text-primary-500 dark:text-white sm:text-xl">
                    Inklusive:
                  </p>
                  <ul className="mt-2 space-y-2 sm:mt-4">
                    {item.eigenschaften.map((eigenschaft) => {
                      return (
                        <li className="flex" id={eigenschaft.id || ''} key={eigenschaft.id}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-primary-500 dark:text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          <span className="text-secondary-500 dark:text-white">
                            {eigenschaft.name}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <section>
        <h2 className="text-center text-4xl font-bold text-secondary-500 dark:text-primary-500 mb-5">
          Was uns ausmacht
        </h2>
        <Flowbite theme={{ theme: accordionTheme }}>
          <Accordion>
            {aktionen.sommerfreizeit.allgemein.eigenschaften.map((eigenschaft) => {
              return (
                <AccordionPanel key={eigenschaft.id}>
                  <AccordionTitle>{eigenschaft.title}</AccordionTitle>
                  <AccordionContent>
                    <p className="mb-2 text-secondary-500 dark:text-primary-500">
                      {eigenschaft.beschreibung}
                    </p>
                  </AccordionContent>
                </AccordionPanel>
              )
            })}
          </Accordion>
        </Flowbite>
      </section>
    </div>
  )
}

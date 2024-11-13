import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import {
  MegaMenu,
  MegaMenuDropdown,
  MegaMenuDropdownToggle,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react'
import { Flowbite } from 'flowbite-react'
import type { CustomFlowbiteTheme } from 'flowbite-react'
import { HiArrowRight, HiChevronDown } from 'react-icons/hi'

export default async function HeaderServer() {
  const payload = await getPayloadHMR({ config })
  const header = await payload.findGlobal({
    slug: 'header',
  })

  const navTheme: CustomFlowbiteTheme = {
    megaMenu: {
      root: {
        base: "bg-primary-500 px-4 lg:px-6 py-3 dark:border-gray-700 dark:bg-secondary-500 sm:px-4",
        rounded: {
          on: "rounded",
          off: ""
        },
        bordered: {
          on: "border",
          off: ""
        },
        inner: {
          base: "mx-auto flex flex-wrap items-center justify-between",
          fluid: {
            on: "",
            off: "container"
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

  return (
    <div>
      <Flowbite theme={{ theme: navTheme }}>
        <MegaMenu>
          <NavbarBrand as={Link} href="/">
            <span className="self-center whitespace-nowrap text-xl font-semibold text-white dark:text-white">
              KjG Dossenheim
            </span>
          </NavbarBrand>
          <NavbarToggle />
          <NavbarCollapse>
            <NavbarLink href="/">Startseite</NavbarLink>
            <MegaMenuDropdownToggle>
            Aktionen
              <HiChevronDown className="ml-2 text-white" />
            </MegaMenuDropdownToggle>
            {header.navigation.map((item) => {
              return (
                <NavbarLink key={item.id} href={item.link}>
                  {item.label}
                </NavbarLink>
              )
            })}
          </NavbarCollapse>
          <MegaMenuDropdown className="w-full mt-3 hidden">
            <div className="p-2 mx-auto bg-secondary-500 dark:bg-primary-500 rounded-xl border-0">
              <div className="grid grid-cols-1 grid-flow-row sm:flex space-x-2">
                <div className="min-w-fit text-white bg-primary-500 dark:bg-secondary-500 rounded-xl hover:bg-primary-600 dark:hover:bg-secondary-600 sm:flex-1">
                  <Link href="/aktionen/" className="block text-white py-2 px-4">
                    <div className="font-medium md:text-center whitespace-nowrap">Jahresplan</div>
                  </Link>
                </div>
                {header.aktionen.map((aktion) => {
                  return (
                    <div key={aktion.id} className="min-w-fit text-white rounded-xl hover:bg-secondary-600 dark:hover:bg-secondary-600 sm:flex-1">
                      <Link href={aktion.link} className="block text-white py-2 px-4">
                        <div className="font-medium md:text-center whitespace-nowrap hover:underline">
                          {aktion.name}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </MegaMenuDropdown>
        </MegaMenu>
      </Flowbite>
    </div>
  )
}

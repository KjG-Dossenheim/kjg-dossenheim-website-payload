import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Menu } from 'lucide-react'
import { ModeToggle } from '@/components/theme-toggle'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import CtaButton from '@/components/ctaButton'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../ui/dropdown-menu'

import type { Header } from '@/payload-types'
import { it } from 'node:test'

async function getHeaderData() {
  const payload = await getPayload({ config })
  const header: Header = await payload.findGlobal({
    slug: 'header',
  })
  return header
}

// Mobile navigation component
async function MobileNavigation() {
  const headerData = await getHeaderData()
  return (
    <Sheet>
      <SheetTrigger asChild className="m-2 md:hidden">
        <Button variant="outline" size="icon" aria-label="Toggle menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="text-left">KjG Dossenheim</SheetTitle>
        </SheetHeader>
        <div className="space-y-0.5">
          <NavigationMenuItem className="list-none">
            <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
              Startseite
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="list-none">
            <NavigationMenuLink href="/aktionen" className={navigationMenuTriggerStyle()}>
              Jahresplan
            </NavigationMenuLink>
          </NavigationMenuItem>
          {headerData.aktionen.map((component) => (
            <NavigationMenuItem key={component.id} className="list-none">
              <NavigationMenuLink
                href={`/${component.link}`}
                className={navigationMenuTriggerStyle()}
              >
                {component.name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          {headerData.navigation.map((item) => (
            <NavigationMenuItem key={item.id} className="list-none">
              <NavigationMenuLink href={`/${item.link}`} className={navigationMenuTriggerStyle()}>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Desktop actions submenu
async function ActionsSubmenu() {
  const headerData = await getHeaderData()
  return (
    <NavigationMenuContent>
      <ul className="grid grid-flow-col grid-rows-2 gap-2 p-2">
        <NavigationMenuItem className="row-span-2">
          <NavigationMenuLink
            className="from-muted/50 to-muted flex h-full w-full flex-col justify-center rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
            href="/aktionen"
          >
            <div className="my-auto text-lg font-medium">Jahresplan</div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {headerData.aktionen.map((component) => (
          <NavigationMenuItem key={component.id}>
            <NavigationMenuLink
              className={`${navigationMenuTriggerStyle()}`}
              href={`/${component.link}`}
              title={component.name}
            >
              {component.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </ul>
    </NavigationMenuContent>
  )
}

// Desktop navigation
async function DesktopNavigation() {
  const headerData = await getHeaderData()
  return (
    <NavigationMenuList className="hidden md:flex">
      <NavigationMenuItem>
        <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
          Startseite
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
        <ActionsSubmenu />
      </NavigationMenuItem>
      {headerData?.navigation?.map((item) => (
        <NavigationMenuItem key={item.id}>
          {item.subNavigation ? (
            item.subNavigation.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                    <span>{item.label}</span>
                  </NavigationMenuTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.subNavigation.map((subItem) => (
                    <NavigationMenuItem key={subItem.id} className="list-none">
                      <NavigationMenuLink
                        className={`${navigationMenuTriggerStyle()} w-full`}
                        href={`/${subItem.link}`}
                        title={subItem.label}
                      >
                        {subItem.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavigationMenuLink href={`/${item.link}`} className={navigationMenuTriggerStyle()}>
                {item.label}
              </NavigationMenuLink>
            )
          ) : (
            <NavigationMenuLink href={`/${item.link}`} className={navigationMenuTriggerStyle()}>
              {item.label}
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      ))}
      {headerData.cta.enabled && <CtaButton cta={headerData.cta} />}
      <ModeToggle />
    </NavigationMenuList>
  )
}

export default async function HeaderServer() {
  const headerData = await getHeaderData()

  return (
    <header className="bg-background sticky top-0 z-50 p-2 shadow-xs">
      <NavigationMenu className="mx-auto flex max-w-screen-xl items-center justify-between">
        <MobileNavigation />
        <h1 className="px-4 text-lg font-bold">KjG Dossenheim</h1>
        <DesktopNavigation />
      </NavigationMenu>
    </header>
  )
}

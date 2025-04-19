import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Link from 'next/link'

import { ModeToggle } from '@/components/theme-toggle'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'

import { Menu } from 'lucide-react'

export default async function HeaderServer() {
  const payload = await getPayload({ config })
  const header = await payload.findGlobal({
    slug: 'header',
  })

  return (
    <NavigationMenu className="mx-auto max-w-screen-xl justify-normal md:justify-between md:p-2">
      <Sheet>
        <SheetTrigger asChild className="m-2 md:hidden">
          <Button variant="outline" size="icon">
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
            {header.aktionen.map((component) => (
              <NavigationMenuItem key={component.id} className="list-none">
                <NavigationMenuLink
                  href={`/${component.link}`}
                  className={navigationMenuTriggerStyle()}
                >
                  {component.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {header.navigation.map((item) => {
              return (
                <NavigationMenuItem key={item.id} className="list-none">
                  <NavigationMenuLink
                    href={`/${item.link}`}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
      <h1 className="px-2 text-lg font-bold">KjG Dossenheim</h1>
      <NavigationMenuList className="hidden md:flex">
        <NavigationMenuItem>
          <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
            Startseite
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid grid-flow-col grid-rows-2 gap-3 p-6">
              <NavigationMenuItem className="row-span-2">
                <NavigationMenuLink
                  className="flex h-full w-full select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/aktionen"
                >
                  <div className="my-auto text-lg font-medium">Jahresplan</div>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {header.aktionen.map((component) => (
                <NavigationMenuItem key={component.id} className="my-auto">
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} p-2`}
                    href={`/${component.link}`}
                    title={component.name}
                  >
                    {component.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {header.navigation.map((item) => {
          return (
            <NavigationMenuItem key={item.id}>
              <NavigationMenuLink href={`/${item.link}`} className={navigationMenuTriggerStyle()}>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
        {header.cta.enabled && (
          <Button asChild className="hidden md:flex">
            <Link href={header.cta.link}>{header.cta.title}</Link>
          </Button>
        )}
        <ModeToggle />
      </NavigationMenuList>
    </NavigationMenu>
  )
}

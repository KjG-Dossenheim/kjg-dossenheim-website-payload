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
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Startseite
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem className="list-none">
              <Link href="/aktionen" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Jahresplan
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {header.aktionen.map((component) => (
              <NavigationMenuItem key={component.id} className="list-none">
                <Link href={component.link} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {component.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
            {header.navigation.map((item) => {
              return (
                <NavigationMenuItem key={item.id} className="list-none">
                  <Link href={item.link} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
      <h1 className="px-2 text-lg font-bold">KjG Dossenheim</h1>
      <NavigationMenuList className="hidden md:flex">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Startseite
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid grid-flow-col grid-rows-2 gap-3 p-6">
              <NavigationMenuItem className="row-span-2">
                <Link
                  className="flex h-full w-full select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/aktionen"
                >
                  <NavigationMenuLink>
                    <div className="my-auto text-lg font-medium">Jahresplan</div>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {header.aktionen.map((component) => (
                <NavigationMenuItem key={component.id} className="my-auto">
                  <Link className="p-2" href={component.link} title={component.name} passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {component.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {header.navigation.map((item) => {
          return (
            <NavigationMenuItem key={item.id}>
              <Link href={item.link} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )
        })}
        <ModeToggle />
        {header.cta.enabled && (
          <Button asChild className="hidden md:flex">
            <Link href={header.cta.link}>{header.cta.title}</Link>
          </Button>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

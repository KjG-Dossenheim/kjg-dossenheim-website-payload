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
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import CtaButton from '@/components/ctaButton'
import type { Header } from '@/payload-types'
import Link from 'next/link'
import Image from 'next/image'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { DynamicIcon } from 'lucide-react/dynamic'
import type { IconName } from 'lucide-react/dynamic'

async function fetchHeaderData() {
  const payload = await getPayload({ config })
  return (await payload.findGlobal({ slug: 'header' })) as Header
}

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  subNavigation?: MenuItem[] | null
}

function ActionsSubmenu({ aktionen }: { aktionen: Header['aktionen'] }) {
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
        {aktionen?.map((component) => (
          <NavigationMenuItem key={component.id} className="flex flex-row items-center">
            <NavigationMenuLink asChild>
              <Link href={component.url} className="flex-row items-center gap-2">
                <DynamicIcon name={component.icon as IconName} className="size-4" />
                {component.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </ul>
    </NavigationMenuContent>
  )
}
function MobileActionsSubmenu({ aktionen }: { aktionen: Header['aktionen'] }) {
  return (
    <div>
      <AccordionItem key="Aktionen" value="Aktionen" className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          Aktionen
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {aktionen?.map((subItem) => (
            <Link
              key={subItem.id}
              className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
              href={`${subItem.url}`}
            >
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
              </div>
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}

export default async function Navbar() {
  const header = await fetchHeaderData()
  return (
    <section className="bg-background sticky top-0 z-50 p-2">
      <div className="lg:container lg:mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center pl-6">
              {header.logo && typeof header.logo !== 'string' && header.logo.url && (
                <Image
                  src={header.logo.url}
                  alt={header.logo.alt || 'Logo'}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/"
                      className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Startseite
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors">
                      Aktionen
                    </NavigationMenuTrigger>
                    <ActionsSubmenu aktionen={header.aktionen} />
                  </NavigationMenuItem>
                  {header.navigation.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/mitglied">Mitglied werden</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href="https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE"
                target="_blank"
                rel="noreferrer"
              >
                Spenden
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 pl-2">
              {header.logo && typeof header.logo !== 'string' && header.logo.url && (
                <Image
                  src={header.logo.url}
                  alt={header.logo.alt || 'Logo'}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
            </Link>
            <Sheet>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
              </div>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    {/* <Link href={header.logo?.url} className="flex items-center gap-2">
                      <img
                        src={header.logo?.src}
                        className="max-h-8 dark:invert"
                        alt={header.logo?.alt}
                      />
                    </Link> */}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    <Link href="/" className="text-md font-semibold">
                      Startseite
                    </Link>
                    <MobileActionsSubmenu aktionen={header.aktionen} />
                    {header.navigation.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link href="/mitglied">Mitglied werden</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href="https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Spenden
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

const renderMenuItem = (item: MenuItem) => {
  if (item.subNavigation && item.subNavigation.length > 0) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.subNavigation.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title}>
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.subNavigation && item.subNavigation.length > 0) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.subNavigation.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <Link key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </Link>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>
        )}
      </div>
    </a>
  )
}

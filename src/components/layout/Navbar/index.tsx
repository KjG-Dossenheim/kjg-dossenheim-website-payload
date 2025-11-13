import React from 'react'
import Link from 'next/link'

// Lucide Icons
import { HandCoins, Menu, Signature } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import type { IconName } from 'lucide-react/dynamic'

// UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger, SheetFooter } from '@/components/ui/sheet'

// Custom Components
import { ModeToggle } from '@/components/common/theme-toggle'
import Wortmarke from '@/graphics/logo/Wortmarke'

// Types
import type { Header } from '@/payload-types'

interface NavbarProps {
  headerData: Header
}

// Type definitions
type NavigationItem = Header['navigation'][number]

interface SubNavigationItem {
  label: string
  title: string
  link: string
  url: string
  id?: string | null
}

// Type guard for navigation items with subNavigation
function hasSubNavigation(item: NavigationItem): item is NavigationItem & {
  subNavigation: NonNullable<NavigationItem['subNavigation']>
} {
  return Boolean(item.subNavigation && item.subNavigation.length > 0)
}

// Logo Component
const NavbarLogo = React.memo(function NavbarLogo() {
  return (
    <Link
      href="/"
      className="flex items-center"
      aria-label="Zur Startseite"
      data-umami-event="Navbar Link: Startseite"
      data-umami-event-variant="Navbar Logo"
    >
      <Wortmarke className="h-8 w-auto" />
    </Link>
  )
})

// CTA Buttons Component
const CTAButtons = React.memo(function CTAButtons() {
  return (
    <>
      <Button asChild data-umami-event="Member CTA Navbar">
        <Link href="/mitglied" aria-label="Mitglied werden" className="space-y-2">
          <Signature />
          Mitglied werden
        </Link>
      </Button>
      <Button variant="outline" asChild data-umami-event="Donate CTA Navbar">
        <Link
          href="https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE&locale.x=de_DE"
          target="_blank"
          rel="noreferrer"
          aria-label="Spenden über PayPal (öffnet in neuem Fenster)"
          className="space-y-2"
        >
          <HandCoins />
          Spenden
        </Link>
      </Button>
    </>
  )
})

// Desktop Actions Submenu Component
const ActionsSubmenu = React.memo(function ActionsSubmenu({
  aktionen,
}: {
  aktionen: Header['aktionen']
}) {
  return (
    <NavigationMenuContent>
      <ul
        className="grid grid-flow-col grid-rows-2 gap-2 p-2"
        role="list"
        aria-label="Aktionen Untermenü"
      >
        <NavigationMenuItem className="row-span-2">
          <NavigationMenuLink
            className="bg-primary flex h-full w-full flex-col justify-center rounded-md p-6 no-underline outline-hidden select-none focus:shadow-md"
            href="/aktionen"
            aria-label="Jahresplan anzeigen"
            data-umami-event="Submenu Link: Jahresplan"
          >
            <div className="my-auto text-lg font-medium">Jahresplan</div>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {aktionen?.map((component) => (
          <NavigationMenuItem key={component.id} className="flex flex-row items-center">
            <NavigationMenuLink asChild>
              <Link
                href={component.url}
                className="flex flex-row items-center gap-2"
                aria-label={`${component.title} Aktion`}
              >
                <DynamicIcon
                  name={component.icon as IconName}
                  className="size-4"
                  aria-hidden="true"
                />
                {component.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </ul>
    </NavigationMenuContent>
  )
})

// Mobile Actions Submenu Component
const MobileActionsSubmenu = React.memo(function MobileActionsSubmenu({
  aktionen,
}: {
  aktionen: Header['aktionen']
}) {
  return (
    <AccordionItem value="Aktionen" className="border-b-0">
      <AccordionTrigger
        className="text-md hover:bg-muted hover:underline-none rounded-md p-2 font-semibold"
        aria-label="Aktionen Menü öffnen/schließen"
      >
        Aktionen
      </AccordionTrigger>
      <AccordionContent className="p-0" role="list" aria-label="Aktionen Liste">
        {aktionen?.map((subItem) => (
          <Link
            key={subItem.id}
            className="hover:bg-muted flex flex-row items-center gap-2 rounded-md p-2 leading-none no-underline transition-colors outline-none select-none"
            href={subItem.url}
            aria-label={`${subItem.title} Aktion`}
            data-umami-event={`Submenu Link: ${subItem.title}`}
          >
            <DynamicIcon name={subItem.icon as IconName} className="size-4" aria-hidden="true" />
            {subItem.title}{' '}
          </Link>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
})

// Desktop Navigation Component
const DesktopNavigation = React.memo(function DesktopNavigation({
  headerData,
}: {
  headerData: Header
}) {
  return (
    <nav className="hidden justify-between lg:flex" aria-label="Hauptnavigation">
      <div className="flex items-center gap-6">
        <NavbarLogo />
        <div className="flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  data-umami-event="Navbar Link: Startseite"
                  data-umami-variant="Navbar Item"
                  className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Startseite
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  data-umami-event="Navbar Link: Aktionen"
                  className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Aktionen
                </NavigationMenuTrigger>
                <ActionsSubmenu aktionen={headerData.aktionen} />
              </NavigationMenuItem>
              {headerData.navigation.map((item) => (
                <DesktopMenuItem key={item.id || item.title} item={item} />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div className="flex gap-2">
        <CTAButtons />
        <ModeToggle />
      </div>
    </nav>
  )
})

// Mobile Navigation Component
const MobileNavigation = React.memo(function MobileNavigation({
  headerData,
}: {
  headerData: Header
}) {
  return (
    <div className="block lg:hidden">
      <nav className="flex items-center justify-between" aria-label="Mobile Navigation">
        <Link
          href="/"
          className="flex items-center gap-2 pl-2"
          aria-label="Zur Startseite"
          data-umami-event="Navbar Link: Startseite"
          data-umami-variant="Navbar Logo"
        >
          <Wortmarke className="h-8 w-auto" />
        </Link>
        <Sheet>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Menü öffnen">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent aria-label="Mobile Navigationsmenü" className="flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col"
                aria-label="Navigationsmenü"
              >
                <Link
                  href="/"
                  className="text-md hover:bg-muted rounded-md p-2 font-semibold"
                  aria-label="Zur Startseite"
                  data-umami-event="Navbar Link: Startseite"
                  data-umami-variant="Navbar Item"
                >
                  Startseite
                </Link>
                <MobileActionsSubmenu aktionen={headerData.aktionen} />
                {headerData.navigation.map((item) => (
                  <MobileMenuItem key={item.id || item.title} item={item} />
                ))}
              </Accordion>
            </div>
            <SheetFooter className="mt-auto flex flex-col gap-2">
              <CTAButtons />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
})

// Main Navbar Component
export default function Navbar({ headerData }: NavbarProps) {
  return (
    <section className="bg-background sticky top-0 z-50 p-2" role="banner">
      <div className="lg:container lg:mx-auto">
        <DesktopNavigation headerData={headerData} />
        <MobileNavigation headerData={headerData} />
      </div>
    </section>
  )
}

// Desktop Menu Item Renderer
const DesktopMenuItem = React.memo(function DesktopMenuItem({ item }: { item: NavigationItem }) {
  if (hasSubNavigation(item)) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.subNavigation.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.id || subItem.title}>
              <DesktopSubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        href={item.url}
        data-umami-event={`Navbar Link: ${item.title}`}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
})

// Mobile Menu Item Renderer
const MobileMenuItem = React.memo(function MobileMenuItem({ item }: { item: NavigationItem }) {
  if (hasSubNavigation(item)) {
    return (
      <AccordionItem value={item.title} className="border-b-0">
        <AccordionTrigger
          className="text-md hover:bg-muted rounded-md p-3 font-semibold"
          aria-label={`${item.title} Menü öffnen/schließen`}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2" role="list" aria-label={`${item.title} Untermenü`}>
          {item.subNavigation.map((subItem) => (
            <MobileSubMenuLink key={subItem.id || subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <Link
      href={item.url}
      className="text-md hover:bg-muted rounded-md p-2 font-semibold"
      data-umami-event={`Navbar Link: ${item.title}`}
    >
      {item.title}
    </Link>
  )
})

// Desktop SubMenu Link Component
const DesktopSubMenuLink = React.memo(function DesktopSubMenuLink({
  item,
}: {
  item: SubNavigationItem
}) {
  return (
    <Link
      className="hover:bg-muted hover:text-accent-foreground flex flex-row gap-2 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
      aria-label={item.title}
      data-umami-event={`Submenu Link: ${item.title}`}
    >
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
      </div>
    </Link>
  )
})

// Mobile SubMenu Link Component
const MobileSubMenuLink = React.memo(function MobileSubMenuLink({
  item,
}: {
  item: SubNavigationItem
}) {
  return (
    <Link
      className="hover:bg-muted hover:text-accent-foreground flex flex-row gap-1 rounded-md p-2 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
      aria-label={item.title}
      data-umami-event={`Submenu Link: ${item.title}`}
    >
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
      </div>
    </Link>
  )
})

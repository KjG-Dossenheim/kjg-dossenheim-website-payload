import React, { cache } from 'react'
import Link from 'next/link'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// Custom Components
import { ModeToggle } from '@/components/common/theme-toggle'
import Wortmarke from '@/graphics/logo/Wortmarke'

// Types
import type { Header } from '@/payload-types'

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

const getHeaderData = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'header' })
})

const PAYPAL_DONATE_URL =
  'https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE&locale.x=de_DE'

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
const CTAButtons = React.memo(function CTAButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      <Button
        asChild
        className={mobile ? 'w-full' : undefined}
        data-umami-event="Member CTA Navbar"
      >
        <Link href="/mitglied" aria-label="Mitglied werden">
          <Signature />
          Mitglied werden
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
        className={mobile ? 'w-full' : undefined}
        data-umami-event="Donate CTA Navbar"
      >
        <Link
          href={PAYPAL_DONATE_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Spenden über PayPal (öffnet in neuem Fenster)"
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
      <div className="grid gap-2 p-3 md:min-w-95">
        <NavigationMenuLink asChild>
          <Link
            href="/aktionen"
            className="bg-muted/60 hover:bg-muted hover:text-accent-foreground flex flex-col gap-1 rounded-lg p-4 no-underline transition-colors"
          >
            <span className="text-base font-semibold">Jahresplan</span>
            <span className="text-muted-foreground text-sm">Alle geplanten Termine</span>
          </Link>
        </NavigationMenuLink>

        <ul className="grid gap-2 sm:grid-cols-2" role="list" aria-label="Aktionen Untermenü">
          {aktionen?.map((component) => (
            <li key={component.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={component.url}
                  aria-label={`${component.title} Aktion`}
                  className="hover:bg-accent hover:text-accent-foreground flex h-full items-center gap-2 rounded-md p-3 no-underline transition-colors"
                >
                  <DynamicIcon
                    name={component.icon as IconName}
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{component.title}</span>
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </div>
    </NavigationMenuContent>
  )
})

// Desktop Navigation Item Link Component
const DesktopNavigationLink = React.memo(function DesktopNavigationLink({
  item,
}: {
  item: NavigationItem
}) {
  return (
    <NavigationMenuItem className="px-4 py-2">
      <NavigationMenuLink asChild>
        <Link
          href={item.url}
          data-umami-event={`Navbar Link: ${item.title}`}
          data-umami-variant="Navbar Item"
        >
          {item.title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
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
        className="hover:bg-muted rounded-md px-3 py-2 text-base font-semibold hover:no-underline"
        aria-label="Aktionen Menü öffnen/schließen"
      >
        Aktionen
      </AccordionTrigger>
      <AccordionContent className="p-0 pt-2" aria-label="Aktionen Liste">
        <div className="flex flex-col gap-3">
          <Link
            href="/aktionen"
            className="bg-muted/60 hover:bg-muted flex flex-col gap-1 rounded-lg p-4 no-underline transition-colors"
            data-umami-event="Navbar Link: Aktionen Übersicht"
          >
            <span className="text-sm font-semibold">Jahresplan</span>
            <span className="text-muted-foreground text-sm">Alle geplanten Termine</span>
          </Link>

          <div className="grid gap-2">
            {aktionen?.map((subItem) => (
              <Link
                key={subItem.id}
                className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 no-underline transition-colors outline-none"
                href={subItem.url}
                aria-label={`${subItem.title} Aktion`}
                data-umami-event={`Submenu Link: ${subItem.title}`}
              >
                <DynamicIcon
                  name={subItem.icon as IconName}
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{subItem.title}</span>
              </Link>
            ))}
          </div>
        </div>
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
    <nav className="hidden items-center justify-between gap-4 lg:flex" aria-label="Hauptnavigation">
      <div className="flex items-center gap-4 xl:gap-6">
        <NavbarLogo />
        <NavigationMenu className="bg-background">
          <NavigationMenuList className="gap-1">
            <DesktopNavigationLink
              item={{
                id: 'startseite',
                title: 'Startseite',
                url: '/',
              }}
            />
            <NavigationMenuItem>
              <NavigationMenuTrigger data-umami-event="Navbar Link: Aktionen">
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
      <div className="flex items-center gap-2">
        <ModeToggle />
        <CTAButtons />
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
                <Menu data-icon="inline-start" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent aria-label="Mobile Navigationsmenü" className="flex flex-col gap-0 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Menü</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <div className="grid gap-2">
                <Link
                  href="/"
                  className="hover:bg-muted rounded-md px-3 py-2 text-base font-semibold transition-colors"
                  aria-label="Zur Startseite"
                  data-umami-event="Navbar Link: Startseite"
                  data-umami-variant="Navbar Item"
                >
                  Startseite
                </Link>
              </div>
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col gap-2"
                aria-label="Navigationsmenü"
              >
                <MobileActionsSubmenu aktionen={headerData.aktionen} />
                {headerData.navigation.map((item) => (
                  <MobileMenuItem key={item.id || item.title} item={item} />
                ))}
              </Accordion>
            </div>
            <SheetFooter className="border-t p-4">
              <CTAButtons mobile />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
})

// Main Navbar Component
export default async function Navbar() {
  const headerData = await getHeaderData()
  return (
    <section className="bg-background sticky top-0 z-50 border-b p-2" role="banner">
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
          <div className="grid gap-1 p-2 md:min-w-70">
            {item.subNavigation.map((subItem) => (
              <NavigationMenuLink asChild key={subItem.id || subItem.title}>
                <DesktopSubMenuLink item={subItem} />
              </NavigationMenuLink>
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return <DesktopNavigationLink item={item} />
})

// Mobile Menu Item Renderer
const MobileMenuItem = React.memo(function MobileMenuItem({ item }: { item: NavigationItem }) {
  if (hasSubNavigation(item)) {
    return (
      <AccordionItem value={item.title} className="border-b-0">
        <AccordionTrigger
          className="hover:bg-muted rounded-md p-0 text-base font-semibold hover:no-underline"
          aria-label={`${item.title} Menü öffnen/schließen`}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 p-0" role="list" aria-label={`${item.title} Untermenü`}>
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
      className="hover:bg-muted rounded-md px-3 py-2 text-base font-semibold transition-colors"
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
      className="hover:bg-muted hover:text-accent-foreground flex flex-col gap-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
      aria-label={item.title}
      data-umami-event={`Submenu Link: ${item.title}`}
    >
      <div className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
        {item.label}
      </div>
      <div>
        <div className="text-foreground text-sm font-semibold">{item.title}</div>
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
      className="hover:bg-muted hover:text-accent-foreground flex flex-col gap-1 rounded-md p-2 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
      aria-label={item.title}
      data-umami-event={`Submenu Link: ${item.title}`}
    >
      <div className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
        {item.label}
      </div>
      <div>
        <div className="text-foreground text-sm font-semibold">{item.title}</div>
      </div>
    </Link>
  )
})

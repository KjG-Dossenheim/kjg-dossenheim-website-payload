import React from 'react'
import Link from 'next/link'

// Lucide Icons
import { Menu } from 'lucide-react'
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

// Custom Components
import { ModeToggle } from '@/components/common/theme-toggle'
import Wortmarke from '@/graphics/logo/Wortmarke'

// Types
import type { Header } from '@/payload-types'
import { unstable_cacheLife } from '../../../../.next/types/cache-life'

interface NavbarProps {
  headerData: Header
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
      <ul
        className="grid grid-flow-col grid-rows-2 gap-2 p-2"
        role="list"
        aria-label="Aktionen Untermenü"
      >
        <NavigationMenuItem className="row-span-2">
          <NavigationMenuLink
            className="bg-muted flex h-full w-full flex-col justify-center rounded-md p-6 no-underline outline-hidden select-none focus:shadow-md"
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
                className="flex-row items-center gap-2"
                aria-label={`${component.title} Aktion`}
                data-umami-event={`Submenu Link: ${component.title}`}
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
}

function MobileActionsSubmenu({ aktionen }: { aktionen: Header['aktionen'] }) {
  return (
    <div>
      <AccordionItem key="Aktionen" value="Aktionen" className="border-b-0">
        <AccordionTrigger
          className="text-md py-0 font-semibold hover:no-underline"
          aria-label="Aktionen Menü öffnen/schließen"
          data-umami-event="Navbar Link: Aktionen"
        >
          Aktionen
        </AccordionTrigger>
        <AccordionContent className="mt-2" role="list" aria-label="Aktionen Liste">
          {aktionen?.map((subItem) => (
            <Link
              key={subItem.id}
              className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
              href={`${subItem.url}`}
              aria-label={`${subItem.title} Aktion`}
              data-umami-event={`Submenu Link: ${subItem.title}`}
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

export default function Navbar({ headerData }: NavbarProps) {
  return (
    <section className="bg-background sticky top-0 z-50 p-2" role="banner">
      <div className="lg:container lg:mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex" aria-label="Hauptnavigation">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center pl-6"
              aria-label="Zur Startseite"
              data-umami-event="Navbar Link: Startseite"
              data-umami-event-variant="Navbar Logo"
            >
              <Wortmarke className="h-8 w-auto" />
            </Link>
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
                  {headerData.navigation.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild data-umami-event="Member CTA Navbar">
              <Link href="/mitglied" aria-label="Mitglied werden">
                Mitglied werden
              </Link>
            </Button>
            <Button variant="outline" asChild data-umami-event="Donate CTA Navbar">
              <Link
                href="https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE"
                target="_blank"
                rel="noreferrer"
                aria-label="Spenden über PayPal (öffnet in neuem Fenster)"
              >
                Spenden
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <nav className="flex items-center justify-between" aria-label="Mobile Navigation">
            {/* Logo */}
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
              <SheetContent className="overflow-y-auto" aria-label="Mobile Navigationsmenü">
                <div className="flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                    aria-label="Navigationsmenü"
                  >
                    <Link
                      href="/"
                      className="text-md font-semibold"
                      aria-label="Zur Startseite"
                      data-umami-event="Navbar Link: Startseite"
                      data-umami-variant="Navbar Item"
                    >
                      Startseite
                    </Link>
                    <MobileActionsSubmenu aktionen={headerData.aktionen} />
                    {headerData.navigation.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="flex flex-col gap-2">
                    <Button asChild data-umami-event="Member CTA Navbar">
                      <Link href="/mitglied" aria-label="Mitglied werden">
                        Mitglied werden
                      </Link>
                    </Button>
                    <Button variant="outline" asChild data-umami-event="Donate CTA Navbar">
                      <Link
                        href="https://www.paypal.com/donate/?hosted_button_id=VNX7B928TD4JE"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Spenden über PayPal (öffnet in neuem Fenster)"
                      >
                        Spenden
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
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
        data-umami-event={`Navbar Link: ${item.title}`}
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
        <AccordionTrigger
          className="text-md py-0 font-semibold hover:no-underline"
          aria-label={`${item.title} Menü öffnen/schließen`}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2" role="list" aria-label={`${item.title} Untermenü`}>
          {item.subNavigation.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <Link
      key={item.title}
      href={item.url}
      className="text-md font-semibold"
      data-umami-event={`Navbar Link: ${item.title}`}
    >
      {item.title}
    </Link>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <Link
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
      href={item.url}
      aria-label={item.description ? `${item.title}: ${item.description}` : item.title}
      data-umami-event={`Submenu Link: ${item.title}`}
    >
      <div className="text-foreground" aria-hidden="true">
        {item.icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>
        )}
      </div>
    </Link>
  )
}

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
import type { Header } from '@/payload-types'
import { Startseite } from '../../payload-types'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

async function fetchHeaderData() {
  const payload = await getPayload({ config })
  return (await payload.findGlobal({ slug: 'header' })) as Header
}

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  subNavigation?: MenuItem[]
}

function MobileNavigation({ header }: { header: Header }) {
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
          {header.aktionen?.map((component) => (
            <NavigationMenuItem key={component.id} className="list-none">
              <NavigationMenuLink
                href={`/${component.url}`}
                className={navigationMenuTriggerStyle()}
              >
                {component.name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          {header.navigation?.map((item) => (
            <NavigationMenuItem key={item.id} className="list-none">
              <NavigationMenuLink href={`/${item.url}`} className={navigationMenuTriggerStyle()}>
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
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
          <NavigationMenuItem key={component.id}>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href={component.url}
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
function MobileActionsSubmenu({ aktionen }: { aktionen: Header['aktionen'] }) {
  return (
    <div>
      <AccordionItem key="Aktionen" value="Aktionen" className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          Aktionen
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {aktionen?.map((subItem) => (
            <a
              key={subItem.id}
              className="hover:bg-muted hover:text-accent-foreground flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
              href={`${subItem.url}`}
            >
              <div>
                <div className="text-sm font-semibold">{subItem.name}</div>
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}

function DesktopNavigation({ header }: { header: Header }) {
  return (
    <NavigationMenuList className="hidden md:flex">
      <NavigationMenuItem>
        <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
          Startseite
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
        <ActionsSubmenu aktionen={header.aktionen} />
      </NavigationMenuItem>
      {header.navigation?.map((item) =>
        item.subNavigation && item.subNavigation.length > 0 ? (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                <li>
                  {item.subNavigation.map((subItem) => (
                    <NavigationMenuLink asChild key={subItem.id}>
                      <a href={`/${subItem.url}`}>{subItem.title}</a>
                    </NavigationMenuLink>
                  ))}
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuLink href={`/${item.url}`} className={navigationMenuTriggerStyle()}>
              {item.title}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ),
      )}
      {header.cta?.enabled && <CtaButton cta={header.cta} />}
      <ModeToggle />
    </NavigationMenuList>
  )
}

export default async function Navbar() {
  const header = await fetchHeaderData()
  return (
    <section className="bg-background sticky top-0 z-50 p-2 shadow-xs">
      <div className="lg:container lg:mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">KjG Dossenheim</span>
            </a>
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
                    <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
                    <ActionsSubmenu aktionen={header.aktionen} />
                  </NavigationMenuItem>
                  {header.navigation.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          {header.cta?.enabled && (
            <div className="flex gap-2">
              <CtaButton cta={header.cta} />
            </div>
          )}
          <ModeToggle />
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">KjG Dossenheim</span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={header.logo?.url} className="flex items-center gap-2">
                      <img
                        src={header.logo?.src}
                        className="max-h-8 dark:invert"
                        alt={header.logo?.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    <a href="/" className="text-md font-semibold">
                      Startseite
                    </a>
                    <MobileActionsSubmenu aktionen={header.aktionen} />
                    {header.navigation.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  {header.cta?.enabled && (
                    <div className="flex flex-col gap-3">
                      <CtaButton cta={header.cta} />
                    </div>
                  )}
                  <CtaButton cta={header.cta} />
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
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
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
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
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

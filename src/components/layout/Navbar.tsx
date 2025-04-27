import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
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

// Type definitions for better type safety
type NavItem = {
  id: string
  label: string
  link: string
}

type ActionItem = {
  id: string
  name: string
  link: string
}

type CTAItem = {
  enabled: boolean
  title: string
  link: string
}

type HeaderData = {
  navigation: NavItem[]
  aktionen: ActionItem[]
  cta: CTAItem
}

// Separate data fetching for better error handling and caching potential
async function getHeaderData(): Promise<HeaderData> {
  try {
    const payload = await getPayload({ config })
    const header = await payload.findGlobal({
      slug: 'header',
    })
    return header as HeaderData
  } catch (error) {
    console.error('Failed to fetch header data:', error)
    // Return fallback data in case of error
    return {
      navigation: [],
      aktionen: [],
      cta: { enabled: false, title: '', link: '' },
    }
  }
}

// Mobile navigation component
function MobileNavigation({
  navigation,
  aktionen,
}: {
  navigation: NavItem[]
  aktionen: ActionItem[]
}) {
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
          {aktionen.map((component) => (
            <NavigationMenuItem key={component.id} className="list-none">
              <NavigationMenuLink
                href={`/${component.link}`}
                className={navigationMenuTriggerStyle()}
              >
                {component.name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          {navigation.map((item) => (
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
function ActionsSubmenu({ aktionen }: { aktionen: ActionItem[] }) {
  return (
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
        {aktionen.map((component) => (
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
  )
}

// Desktop navigation
function DesktopNavigation({
  navigation,
  aktionen,
  cta,
}: {
  navigation: NavItem[]
  aktionen: ActionItem[]
  cta: CTAItem
}) {
  return (
    <NavigationMenuList className="hidden md:flex">
      <NavigationMenuItem>
        <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
          Startseite
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Aktionen</NavigationMenuTrigger>
        <ActionsSubmenu aktionen={aktionen} />
      </NavigationMenuItem>
      {navigation.map((item) => (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuLink href={`/${item.link}`} className={navigationMenuTriggerStyle()}>
            {item.label}
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
      {cta.enabled && (
        <Button asChild className="hidden md:flex">
          <Link href={cta.link}>{cta.title}</Link>
        </Button>
      )}
      <ModeToggle />
    </NavigationMenuList>
  )
}

export default async function HeaderServer() {
  const headerData = await getHeaderData()
  const { navigation, aktionen, cta } = headerData

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      <div className="mx-auto max-w-screen-xl">
        <NavigationMenu className="mx-auto max-w-screen-xl justify-normal md:justify-between md:p-2">
          <MobileNavigation navigation={navigation} aktionen={aktionen} />
          <h1 className="px-2 text-lg font-bold">KjG Dossenheim</h1>
          <DesktopNavigation navigation={navigation} aktionen={aktionen} cta={cta} />
        </NavigationMenu>
      </div>
    </header>
  )
}

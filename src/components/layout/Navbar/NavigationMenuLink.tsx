'use client'

import Link from 'next/link'
import type React from 'react'

import { NavigationMenuLink as NavigationMenuLinkPrimitive } from '@/components/ui/navigation-menu'

type NavbarNavigationMenuLinkProps = {
  href: React.ComponentPropsWithoutRef<typeof Link>['href']
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>

export function NavbarNavigationMenuLink({
  href,
  className,
  children,
  ...props
}: NavbarNavigationMenuLinkProps) {
  return (
    <NavigationMenuLinkPrimitive
      render={
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      }
    />
  )
}

'use client'

import * as React from 'react'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === 'dark' ? (
            <Moon className="size-5" />
          ) : theme === 'light' ? (
            <Sun className="size-5" />
          ) : (
            <SunMoon className="size-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun /> Hell
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon /> Dunkel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <SunMoon /> Auto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

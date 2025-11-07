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
  const [isMounted, setIsMounted] = React.useState(false)

  // Use a more efficient mounted check with useEffect
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Determine which icon to use based on current theme
  const ThemeIcon = React.useMemo(() => {
    if (!isMounted) return SunMoon
    return theme === 'dark' ? Moon : theme === 'light' ? Sun : SunMoon
  }, [theme, isMounted])

  const handleThemeChange = React.useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      return () => setTheme(newTheme)
    },
    [setTheme],
  )

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!isMounted) {
    return (
      <Button variant="outline" size="icon">
        <SunMoon className="size-4" />
        <span className="sr-only">Lade Theme-Umschalter</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ThemeIcon className="size-4" />
          <span className="sr-only">Theme umschalten</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleThemeChange('light')} className="flex items-center gap-2">
          <Sun className="size-4" /> Hell
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleThemeChange('dark')} className="flex items-center gap-2">
          <Moon className="size-4" /> Dunkel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleThemeChange('system')} className="flex items-center gap-2">
          <SunMoon className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

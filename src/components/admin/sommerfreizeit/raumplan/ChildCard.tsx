'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChildDetailsDrawer } from './ChildDetailsDrawer'
import { cn } from '@/lib/utils'
import { Eye, Mars, Transgender, Venus } from 'lucide-react'

interface ChildCardProps {
  id: string
  firstName: string
  lastName: string
  childAge: number | null
  childGender: 'male' | 'female' | 'diverse'
  wishNames: string[]
  onDragStart: (childId: string, childName: string, fromRoomId: string | null) => void
  fromRoomId: string | null
}

export function ChildCard({
  id,
  firstName,
  lastName,
  childAge,
  childGender,
  wishNames,
  onDragStart,
  fromRoomId,
}: ChildCardProps) {
  const hasWishes = wishNames.length > 0

  const genderIcon =
    childGender === 'male' ? <Mars /> : childGender === 'female' ? <Venus /> : <Transgender />

  const fullName = `${firstName} ${lastName}`

  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Item
              draggable
              variant="outline"
              size="xs"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', id)
                e.dataTransfer.effectAllowed = 'move'
                onDragStart(id, fullName, fromRoomId)
              }}
              className={cn(
                'cursor-grab transition-shadow select-none hover:shadow-sm active:cursor-grabbing',
              )}
            >
              {/* Wish indicator dot */}
              <ItemMedia variant="icon">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    hasWishes ? 'bg-secondary' : 'bg-muted-foreground',
                  )}
                />
              </ItemMedia>

              {/* Name + age */}
              <ItemContent>
                <ItemTitle>
                  {firstName} {lastName}
                  {childAge != null && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px]">
                      {childAge}
                    </Badge>
                  )}
                </ItemTitle>
              </ItemContent>

              {/* Gender icon */}
              <ItemMedia variant="icon">
                <span
                  className={cn(
                    'text-xs font-bold',
                    childGender === 'male' && 'text-blue-600 dark:text-blue-400',
                    childGender === 'female' && 'text-rose-600 dark:text-rose-400',
                    childGender === 'diverse' && 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  {genderIcon}
                </span>
              </ItemMedia>

              {/* Details drawer trigger */}
              <ItemMedia variant="icon">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Details anzeigen"
                  onClick={() => setDetailsOpen(true)}
                >
                  <Eye />
                </Button>
              </ItemMedia>
            </Item>
          }
        />
        <TooltipContent side="right">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{fullName}</p>
            {childAge != null && <p className="text-xs opacity-80">{childAge} Jahre</p>}
            {wishNames.length > 0 && (
              <p className="mt-0.5 text-xs opacity-70">Wünsche: {wishNames.join(', ')}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      <ChildDetailsDrawer
        id={id}
        name={fullName}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
}

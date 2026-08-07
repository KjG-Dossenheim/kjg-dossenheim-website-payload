'use client'

import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Mars, Transgender, Venus } from 'lucide-react'

interface ChildCardProps {
  id: string
  firstName: string
  lastName: string
  childClass: string
  childGender: 'male' | 'female' | 'diverse'
  wishNames: string[]
  onDragStart: (childId: string, childName: string, fromRoomId: string | null) => void
  fromRoomId: string | null
}

export function ChildCard({
  id,
  firstName,
  lastName,
  childClass,
  childGender,
  wishNames,
  onDragStart,
  fromRoomId,
}: ChildCardProps) {
  const hasWishes = wishNames.length > 0
  const wishTooltip = hasWishes ? 'Hat Zimmerwünsche' : 'Keine Zimmerwünsche'

  const genderIcon =
    childGender === 'male' ? <Mars /> : childGender === 'female' ? <Venus /> : <Transgender />

  const fullName = `${firstName} ${lastName}`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={`/admin/collections/sommerfreizeitAnmeldung/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
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
                    hasWishes ? 'bg-primary' : 'bg-muted-foreground',
                  )}
                />
              </ItemMedia>

              {/* Name + class */}
              <ItemContent>
                <ItemTitle>
                  {firstName} {lastName}
                  {childClass && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px]">
                      {childClass}
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
            </Item>
          </a>
        }
      />
      <TooltipContent side="right">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{fullName}</p>
          {childClass && <p className="text-xs opacity-80">Klasse {childClass}</p>}
          <p className="text-xs opacity-80">{wishTooltip}</p>
          {wishNames.length > 0 && (
            <p className="mt-0.5 text-xs opacity-70">Wünsche: {wishNames.join(', ')}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

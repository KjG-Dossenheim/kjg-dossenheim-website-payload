'use client'

import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { Mars, Venus, ShieldUser } from 'lucide-react'

interface TeamerCardProps {
  id: string
  firstName: string
  lastName: string
  gender: 'male' | 'female'
  onDragStart: (teamerId: string, teamerName: string, fromRoomId: string | null) => void
  fromRoomId: string | null
}

/**
 * A draggable card representing a team member (Teamer) in the room plan.
 * Simpler than ChildCard — teamers have no room wishes or details drawer.
 */
export function TeamerCard({
  id,
  firstName,
  lastName,
  gender,
  onDragStart,
  fromRoomId,
}: TeamerCardProps) {
  const fullName = `${firstName} ${lastName}`
  const genderIcon = gender === 'male' ? <Mars /> : <Venus />

  return (
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
      {/* Teamer badge */}
      <ItemMedia variant="icon">
        <ShieldUser />
      </ItemMedia>

      {/* Name */}
      <ItemContent>
        <ItemTitle>
          {firstName} {lastName}
        </ItemTitle>
      </ItemContent>

      {/* Gender icon */}
      <ItemMedia variant="icon">
        <span
          className={cn(
            'text-xs font-bold',
            gender === 'male'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-rose-600 dark:text-rose-400',
          )}
        >
          {genderIcon}
        </span>
      </ItemMedia>
    </Item>
  )
}

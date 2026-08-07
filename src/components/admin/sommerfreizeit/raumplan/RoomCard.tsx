'use client'

import type { RoomWithOccupants } from './types'
import { ChildCard } from './ChildCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Mars, Venus } from 'lucide-react'

interface RoomCardProps {
  room: RoomWithOccupants
  onDrop: (roomId: string | null) => void
  onDragStart: (childId: string, childName: string, fromRoomId: string | null) => void
}

export function RoomCard({ room, onDrop, onDragStart }: RoomCardProps) {
  const occupantCount = room.occupants.length
  const capacityText = room.capacity ? ` / ${room.capacity}` : ''
  const isOverCapacity = room.capacity !== null && occupantCount > room.capacity
  const isNearCapacity =
    room.capacity !== null && !isOverCapacity && occupantCount >= room.capacity * 0.8

  return (
    <Card
      size="sm"
      className={cn(
        'max-w-[260px] min-w-[220px] shrink-0',
        isOverCapacity && 'border-destructive/50 bg-destructive/5',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(room.id)
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{room.name}</CardTitle>
          {room.gender &&
            (room.gender === 'male' ? (
              <Mars className="text-blue-500" />
            ) : (
              <Venus className="text-pink-500" />
            ))}
        </div>
        <p
          className={cn(
            'text-xs',
            isOverCapacity
              ? 'text-destructive font-medium'
              : isNearCapacity
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground',
          )}
        >
          {occupantCount}
          {capacityText} Bewohner
          {isOverCapacity && ' ⚠️'}
        </p>
      </CardHeader>

      <CardContent className="flex min-h-[60px] flex-col gap-1">
        {room.occupants.map((occ) => (
          <ChildCard
            key={occ.id}
            id={occ.id}
            firstName={occ.firstName}
            lastName={occ.lastName}
            childClass={occ.class}
            childGender={occ.childGender}
            wishNames={occ.wishNames}
            onDragStart={onDragStart}
            fromRoomId={room.id}
          />
        ))}
        {room.occupants.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-xs">Leer</div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import type { RoomWithOccupants } from './types'
import { ChildCard } from './ChildCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mars, Venus, Pencil, Trash2, Eraser, AlertTriangle } from 'lucide-react'

interface RoomCardProps {
  room: RoomWithOccupants
  onDrop: (roomId: string | null) => void
  onDragStart: (childId: string, childName: string, fromRoomId: string | null) => void
  onEdit?: (room: RoomWithOccupants) => void
  onDelete?: (room: RoomWithOccupants) => void
  onClean?: (room: RoomWithOccupants) => void
}

export function RoomCard({ room, onDrop, onDragStart, onEdit, onDelete, onClean }: RoomCardProps) {
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
        room.genderConflict &&
          'border-amber-400 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/30',
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
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="truncate">{room.name}</CardTitle>
            {room.gender &&
              (room.gender === 'male' ? (
                <Mars className="h-4 w-4 shrink-0 text-blue-500" />
              ) : (
                <Venus className="h-4 w-4 shrink-0 text-pink-500" />
              ))}
            {room.genderConflict && (
              <span title="Gemischte Belegung — bitte manuell korrigieren">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              </span>
            )}
          </div>
          {(onEdit || onDelete || (onClean && occupantCount > 0)) && (
            <div className="flex shrink-0 gap-0.5">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Zimmer bearbeiten"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(room)
                  }}
                >
                  <Pencil />
                </Button>
              )}
              {onClean && occupantCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Zimmer leeren"
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClean(room)
                  }}
                >
                  <Eraser />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon-xs"
                  aria-label="Zimmer löschen"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(room)
                  }}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          )}
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

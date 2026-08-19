'use client'

import type { RoomWithOccupants } from './types'
import { ChildCard } from './ChildCard'
import { TeamerCard } from './TeamerCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mars, Venus, Pencil, Trash2, Eraser, AlertTriangle } from 'lucide-react'

export type DragKind = 'child' | 'teamer'

interface RoomCardProps {
  room: RoomWithOccupants
  onDrop: (roomId: string | null) => void
  onDragStart: (id: string, name: string, fromRoomId: string | null, kind: DragKind) => void
  onEdit?: (room: RoomWithOccupants) => void
  onDelete?: (room: RoomWithOccupants) => void
  onClean?: (room: RoomWithOccupants) => void
}

export function RoomCard({ room, onDrop, onDragStart, onEdit, onDelete, onClean }: RoomCardProps) {
  // Teamer rooms count teamers; normal rooms count children
  const occupantCount = room.teamerRoom ? room.teamerOccupants.length : room.occupants.length
  const occupantLabel = room.teamerRoom ? 'Teamer' : 'Bewohner'
  const capacityText = room.capacity ? ` / ${room.capacity}` : ''
  const isOverCapacity = occupantCount > room.capacity
  const isNearCapacity = !isOverCapacity && occupantCount >= room.capacity * 0.8

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
            {room.teamerRoom && (
              <Badge className="shrink-0">
                <p className="">Teamer</p>
              </Badge>
            )}
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
                  variant="destructive"
                  size="icon-xs"
                  aria-label="Zimmer leeren"
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
        <Progress
          value={Math.min(occupantCount, room.capacity)}
          max={room.capacity}
          aria-label={`Auslastung: ${occupantCount} von ${room.capacity}`}
          className={cn(
            isOverCapacity
              ? '**:data-[slot=progress-indicator]:bg-destructive'
              : isNearCapacity
                ? '**:data-[slot=progress-indicator]:bg-primary'
                : undefined,
          )}
        >
          <ProgressLabel>
            <p
              className={cn(
                'text-xs',
                isOverCapacity
                  ? 'text-destructive font-medium'
                  : isNearCapacity
                    ? 'text-primary'
                    : 'text-muted-foreground',
              )}
            >
              {occupantCount}
              {capacityText} {occupantLabel}
              {isOverCapacity && ' ⚠️'}
            </p>
          </ProgressLabel>
          <ProgressValue />
        </Progress>
      </CardHeader>

      <CardContent className="flex min-h-[60px] flex-col gap-1">
        {room.occupants.map((occ) => (
          <ChildCard
            key={occ.id}
            id={occ.id}
            firstName={occ.firstName}
            lastName={occ.lastName}
            childAge={occ.age}
            childGender={occ.childGender}
            wishNames={occ.wishNames}
            onDragStart={(childId, childName) => onDragStart(childId, childName, room.id, 'child')}
            fromRoomId={room.id}
          />
        ))}
        {room.teamerOccupants.map((t) => (
          <TeamerCard
            key={t.id}
            id={t.id}
            firstName={t.firstName}
            lastName={t.lastName}
            gender={t.gender}
            onDragStart={(teamerId, teamerName) =>
              onDragStart(teamerId, teamerName, room.id, 'teamer')
            }
            fromRoomId={room.id}
          />
        ))}
        {room.occupants.length === 0 && room.teamerOccupants.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-xs">Leer</div>
        )}
      </CardContent>
    </Card>
  )
}

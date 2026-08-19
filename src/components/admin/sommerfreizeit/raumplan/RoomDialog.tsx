'use client'

import { useState, useEffect } from 'react'
import { toast } from '@payloadcms/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { createRoom, updateRoom } from './actions'
import type { FloorInfo, RoomFormData, RoomWithOccupants } from './types'

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful create/update to refresh the plan */
  onSaved: () => void
  /** The event this room belongs to */
  eventId: string
  /** Available floors for the select dropdown */
  floors: FloorInfo[]
  /** If provided, we're in edit mode */
  room?: RoomWithOccupants | null
  /** If provided, pre-select this floor (for "add room to floor") */
  defaultFloorId?: string | null
}

export function RoomDialog({
  open,
  onOpenChange,
  onSaved,
  eventId,
  floors,
  room,
  defaultFloorId,
}: RoomDialogProps) {
  const isEdit = !!room
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [beschreibung, setBeschreibung] = useState('')
  const [capacity, setCapacity] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [floorId, setFloorId] = useState<string>('')
  const [teamerRoom, setTeamerRoom] = useState(false)

  // Reset form when dialog opens or room changes
  useEffect(() => {
    if (open) {
      if (room) {
        setName(room.name)
        setBeschreibung(room.beschreibung ?? '')
        setCapacity(room.capacity?.toString() ?? '')
        setGender(room.gender ?? '')
        setFloorId(room.floorId ?? '')
        setTeamerRoom(room.teamerRoom ?? false)
      } else {
        setName('')
        setBeschreibung('')
        setCapacity('')
        setGender('')
        setFloorId(defaultFloorId ?? '')
        setTeamerRoom(false)
      }
    }
  }, [open, room, defaultFloorId])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen für das Zimmer ein.')
      return
    }

    setSaving(true)
    try {
      const data: RoomFormData = {
        name: name.trim(),
        beschreibung: beschreibung.trim() || undefined,
        capacity: capacity ? parseInt(capacity, 10) : null,
        gender: gender || null,
        floorId: floorId || null,
        teamerRoom,
      }

      if (isEdit) {
        const result = await updateRoom(room!.id, data)
        if (result.success) {
          toast.success('Zimmer aktualisiert.')
          onOpenChange(false)
          onSaved()
        } else {
          toast.error(`Fehler: ${result.error}`)
        }
      } else {
        const result = await createRoom(eventId, data)
        if (result.success) {
          toast.success('Zimmer erstellt.')
          onOpenChange(false)
          onSaved()
        } else {
          toast.error(`Fehler: ${result.error}`)
        }
      }
    } catch (err) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Zimmer bearbeiten' : 'Neues Zimmer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Bearbeite die Eigenschaften dieses Zimmers.'
              : 'Erstelle ein neues Zimmer für diese Freizeit.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label required>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Zimmer 101"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
          </div>

          {/* Beschreibung */}
          <div className="flex flex-col gap-1.5">
            <Label>Beschreibung</Label>
            <Input
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Optionale Beschreibung"
            />
          </div>

          {/* Kapazität */}
          <div className="flex flex-col gap-1.5">
            <Label>Kapazität</Label>
            <Input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Leer lassen für unbegrenzt"
            />
          </div>

          {/* Geschlecht */}
          <div className="flex flex-col gap-1.5">
            <Label>Geschlecht</Label>
            <Select
              value={gender}
              onValueChange={(val) => setGender((val as 'male' | 'female' | '') || '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Keine Vorgabe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Vorgabe</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Etage */}
          <div className="flex flex-col gap-1.5">
            <Label>Etage</Label>
            <Select value={floorId} onValueChange={(val) => setFloorId(val ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Keine Etage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Etage</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teamer-Zimmer */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="teamerRoom"
              checked={teamerRoom}
              onCheckedChange={(checked) => setTeamerRoom(!!checked)}
            />
            <Label htmlFor="teamerRoom">Teamer-Zimmer</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? <Spinner /> : isEdit ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

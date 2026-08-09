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
import { Spinner } from '@/components/ui/spinner'
import { createFloor, updateFloor } from './actions'
import type { FloorFormData, FloorInfo } from './types'

interface FloorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful create/update to refresh the plan */
  onSaved: () => void
  /** The event this floor belongs to */
  eventId: string
  /** If provided, we're in edit mode */
  floor?: FloorInfo | null
}

export function FloorDialog({ open, onOpenChange, onSaved, eventId, floor }: FloorDialogProps) {
  const isEdit = !!floor
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')

  // Reset form when dialog opens or floor changes
  useEffect(() => {
    if (open) {
      if (floor) {
        setName(floor.name)
        setGender(floor.gender ?? '')
      } else {
        setName('')
        setGender('')
      }
    }
  }, [open, floor])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen für die Etage ein.')
      return
    }

    setSaving(true)
    try {
      const data: FloorFormData = {
        name: name.trim(),
        gender: gender || null,
      }

      if (isEdit) {
        const result = await updateFloor(floor!.id, data)
        if (result.success) {
          toast.success('Etage aktualisiert.')
          onOpenChange(false)
          onSaved()
        } else {
          toast.error(`Fehler: ${result.error}`)
        }
      } else {
        const result = await createFloor(eventId, data)
        if (result.success) {
          toast.success('Etage erstellt.')
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
          <DialogTitle>{isEdit ? 'Etage bearbeiten' : 'Neue Etage'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Bearbeite die Eigenschaften dieser Etage.'
              : 'Erstelle eine neue Etage für diese Freizeit.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label required>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Erdgeschoss, 1. Stock, Dachgeschoss"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
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
                <SelectValue placeholder="Keine Vorgabe (gemischt)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Vorgabe</SelectItem>
                <SelectItem value="male">Männlich</SelectItem>
                <SelectItem value="female">Weiblich</SelectItem>
              </SelectContent>
            </Select>
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

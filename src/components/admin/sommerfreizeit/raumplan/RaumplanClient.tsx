'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from '@payloadcms/ui'
import { Button } from '@/components/ui/button'
import { RotateCcw, Save, Trash2, Mars, Venus, Plus, Pencil } from 'lucide-react'
import {
  fetchRoomPlanData,
  runAutoAssign,
  saveRoomAssignments,
  deleteRoom,
  deleteFloor,
} from './actions'
import type { FloorInfo, RoomPlanData, RoomWithOccupants, AutoAssignPreview } from './types'
import { RoomCard } from './RoomCard'
import { ChildCard } from './ChildCard'
import { RoomDialog } from './RoomDialog'
import { FloorDialog } from './FloorDialog'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ButtonGroup } from '@/components/ui/button-group'

interface EventOption {
  id: string
  name: string
  startDate: string
}

export function RaumplanClient({ events }: { events: EventOption[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [data, setData] = useState<RoomPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<AutoAssignPreview | null>(null)
  const [dirty, setDirty] = useState(false)
  const [dragState, setDragState] = useState<{
    childId: string
    childName: string
    fromRoomId: string | null
  } | null>(null)

  const initialDataRef = useRef<string>('')

  // ── Dialog state ──────────────────────────────────────────
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomWithOccupants | null>(null)
  const [defaultFloorId, setDefaultFloorId] = useState<string | null>(null)

  const [floorDialogOpen, setFloorDialogOpen] = useState(false)
  const [editingFloor, setEditingFloor] = useState<FloorInfo | null>(null)

  const [deleteRoomTarget, setDeleteRoomTarget] = useState<RoomWithOccupants | null>(null)
  const [deleteFloorTarget, setDeleteFloorTarget] = useState<{ id: string; name: string } | null>(
    null,
  )

  const [floors, setFloors] = useState<FloorInfo[]>([])

  // Build floors list from data whenever it changes
  const extractFloorsFromData = useCallback((planData: RoomPlanData): FloorInfo[] => {
    const floorMap = new Map<string, FloorInfo>()
    for (const room of planData.rooms) {
      if (room.floorId && !floorMap.has(room.floorId)) {
        floorMap.set(room.floorId, {
          id: room.floorId,
          name: room.floorName ?? room.floorId,
          gender: room.floorGender ?? null,
        })
      }
    }
    return Array.from(floorMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [])

  // Load data when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setData(null)
      setPreview(null)
      setDirty(false)
      return
    }

    setLoading(true)
    setPreview(null)
    setDirty(false)

    fetchRoomPlanData(selectedEventId)
      .then((result) => {
        setData(result)
        setFloors(extractFloorsFromData(result))
        initialDataRef.current = JSON.stringify({
          rooms: result.rooms.map((r) => ({ id: r.id, occIds: r.occupants.map((o) => o.id) })),
          unassigned: result.unassigned.map((u) => u.id),
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load room plan data:', err)
        toast.error('Fehler beim Laden der Daten.')
        setLoading(false)
      })
  }, [selectedEventId])

  // ---- drag and drop handlers ----
  const handleDragStart = useCallback(
    (childId: string, childName: string, fromRoomId: string | null) => {
      setDragState({ childId, childName, fromRoomId })
    },
    [],
  )

  const handleDrop = useCallback(
    (toRoomId: string | null) => {
      if (!dragState || !data) return

      const { childId, fromRoomId } = dragState

      if (fromRoomId === toRoomId) {
        setDragState(null)
        return
      }

      setData((prev) => {
        if (!prev) return prev

        // Capture child data BEFORE removing from source location
        const child = findChild(prev, childId)
        if (!child) return prev

        const newData = { ...prev }

        if (fromRoomId) {
          newData.rooms = newData.rooms.map((r) => {
            if (r.id === fromRoomId) {
              return { ...r, occupants: r.occupants.filter((o) => o.id !== childId) }
            }
            return r
          })
        } else {
          newData.unassigned = newData.unassigned.filter((u) => u.id !== childId)
        }

        if (toRoomId) {
          newData.rooms = newData.rooms.map((r) => {
            if (r.id === toRoomId) {
              return {
                ...r,
                occupants: [
                  ...r.occupants,
                  {
                    id: child.id,
                    firstName: child.firstName,
                    lastName: child.lastName,
                    class: child.class,
                    childGender: child.childGender,
                    wishNames: child.wishNames,
                    wishTargets: [],
                  },
                ],
              }
            }
            return r
          })
        } else {
          newData.unassigned = [
            ...newData.unassigned,
            {
              id: child.id,
              firstName: child.firstName,
              lastName: child.lastName,
              class: child.class,
              childGender: child.childGender,
              wishNames: child.wishNames,
            },
          ]
        }

        return newData
      })

      setDirty(true)
      setDragState(null)
    },
    [dragState, data],
  )

  // ---- auto-assign ----
  const handleAutoAssign = useCallback(async () => {
    if (!selectedEventId) return
    setAutoLoading(true)
    try {
      const result = await runAutoAssign(selectedEventId)
      setPreview(result)
      toast.success(
        `Auto-Zuweisung berechnet: ${result.mutualWishScore}% gegenseitige Wünsche erfüllt.`,
      )
    } catch (err) {
      console.error('Auto-assign failed:', err)
      toast.error('Fehler bei der Auto-Zuweisung.')
    } finally {
      setAutoLoading(false)
    }
  }, [selectedEventId])

  const handleApplyPreview = useCallback(() => {
    if (!preview || !data) return

    const newRooms = data.rooms.map((room) => {
      const previewAssign = preview.assignments.find((a) => a.roomId === room.id)
      const regIds = previewAssign?.registrationIds ?? []
      const occupants = regIds.map((rid) => {
        const existing = findChildInAnyRoom(data, rid)
        if (existing) return existing
        const unassigned = data.unassigned.find((u) => u.id === rid)
        if (unassigned) {
          return {
            id: unassigned.id,
            firstName: unassigned.firstName,
            lastName: unassigned.lastName,
            class: unassigned.class,
            childGender: unassigned.childGender,
            wishNames: unassigned.wishNames,
            wishTargets: [],
          }
        }
        const name = data.allRegistrations.get(rid) ?? rid
        const [firstName, ...lastParts] = name.split(' ')
        return {
          id: rid,
          firstName,
          lastName: lastParts.join(' '),
          class: '',
          childGender: 'diverse' as const,
          wishNames: [],
          wishTargets: [],
        }
      })
      return { ...room, occupants }
    })

    const newUnassigned = preview.unassigned
      .map((rid) => {
        const existing = findChildInAnyRoom(data, rid)
        if (existing && !newRooms.some((r) => r.occupants.some((o) => o.id === rid))) {
          return {
            id: existing.id,
            firstName: existing.firstName,
            lastName: existing.lastName,
            class: existing.class,
            childGender: existing.childGender,
            wishNames: existing.wishNames,
          }
        }
        const name = data.allRegistrations.get(rid) ?? rid
        const [firstName, ...lastParts] = name.split(' ')
        return {
          id: rid,
          firstName,
          lastName: lastParts.join(' '),
          class: '',
          childGender: 'diverse' as const,
          wishNames: [],
        }
      })
      .filter((u) => !newRooms.some((r) => r.occupants.some((o) => o.id === u.id)))

    setData({ ...data, rooms: newRooms, unassigned: newUnassigned })
    setDirty(true)
    setPreview(null)
    toast.success('Vorschau übernommen. Klicke "Speichern" zum Persistieren.')
  }, [preview, data])

  // ---- save ----
  const handleSave = useCallback(async () => {
    if (!data || !selectedEventId) return

    setSaving(true)
    try {
      const assignments: Record<string, string[]> = {}
      for (const room of data.rooms) {
        assignments[room.id] = room.occupants.map((o) => o.id)
      }

      const result = await saveRoomAssignments(selectedEventId, assignments)
      if (result.success) {
        toast.success('Raumplan gespeichert!')
        setDirty(false)
        initialDataRef.current = JSON.stringify({
          rooms: data.rooms.map((r) => ({ id: r.id, occIds: r.occupants.map((o) => o.id) })),
          unassigned: data.unassigned.map((u) => u.id),
        })
      } else {
        toast.error(`Fehler beim Speichern: ${result.error}`)
      }
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }, [data, selectedEventId])

  // ---- reset ----
  const handleReset = useCallback(() => {
    if (!data) return
    try {
      const saved = JSON.parse(initialDataRef.current)
      setData((prev) => {
        if (!prev) return prev
        const newRooms = prev.rooms.map((room) => {
          const savedRoom = saved.rooms.find((sr: { id: string }) => sr.id === room.id)
          const occIds: string[] = savedRoom?.occIds ?? []
          const occupants = occIds.map(
            (rid) =>
              findChildInAnyRoom(prev, rid) ??
              ({
                id: rid,
                firstName: rid,
                lastName: '',
                class: '',
                childGender: 'diverse' as const,
                wishNames: [],
                wishTargets: [],
              } as NonNullable<ReturnType<typeof findChildInAnyRoom>>),
          )
          return { ...room, occupants }
        })
        const unassignedIds: string[] = saved.unassigned ?? []
        const newUnassigned = unassignedIds.map((rid) => {
          const c = findChildInAnyRoom(prev, rid)
          if (c)
            return {
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              class: c.class,
              childGender: c.childGender,
              wishNames: c.wishNames,
            }
          const name = prev.allRegistrations.get(rid) ?? rid
          const [fn, ...ln] = name.split(' ')
          return {
            id: rid,
            firstName: fn,
            lastName: ln.join(' '),
            class: '',
            childGender: 'diverse' as const,
            wishNames: [],
          }
        })
        return { ...prev, rooms: newRooms, unassigned: newUnassigned }
      })
      setDirty(false)
      setPreview(null)
      toast.success('Zurückgesetzt.')
    } catch {
      setSelectedEventId((prev) => {
        if (prev) {
          fetchRoomPlanData(prev).then(setData)
        }
        return prev
      })
      setDirty(false)
    }
  }, [data])

  // ---- clear all rooms ----
  const handleClearAllRooms = useCallback(() => {
    if (!data) return

    const totalOccupants = data.rooms.reduce((sum, r) => sum + r.occupants.length, 0)
    if (totalOccupants === 0) return

    // Collect all occupants from all rooms as unassigned children
    const allUnassigned = data.rooms.flatMap((room) =>
      room.occupants.map((occ) => ({
        id: occ.id,
        firstName: occ.firstName,
        lastName: occ.lastName,
        class: occ.class,
        childGender: occ.childGender,
        wishNames: occ.wishNames,
      })),
    )

    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        rooms: prev.rooms.map((room) => ({ ...room, occupants: [] })),
        unassigned: [...prev.unassigned, ...allUnassigned],
      }
    })
    setDirty(true)
    setPreview(null)
    toast.success('Alle Zimmer geleert. Klicke "Speichern" zum Persistieren.')
  }, [data])

  // ── Dialog handlers ───────────────────────────────────────
  const handleRefresh = useCallback(() => {
    if (!selectedEventId) return
    setLoading(true)
    setPreview(null)
    setDirty(false)
    fetchRoomPlanData(selectedEventId)
      .then((result) => {
        setData(result)
        setFloors(extractFloorsFromData(result))
        initialDataRef.current = JSON.stringify({
          rooms: result.rooms.map((r) => ({ id: r.id, occIds: r.occupants.map((o) => o.id) })),
          unassigned: result.unassigned.map((u) => u.id),
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to refresh room plan data:', err)
        toast.error('Fehler beim Aktualisieren der Daten.')
        setLoading(false)
      })
  }, [selectedEventId, extractFloorsFromData])

  const openCreateRoom = useCallback((floorId?: string | null) => {
    setEditingRoom(null)
    setDefaultFloorId(floorId ?? null)
    setRoomDialogOpen(true)
  }, [])

  const openEditRoom = useCallback((room: RoomWithOccupants) => {
    setEditingRoom(room)
    setDefaultFloorId(null)
    setRoomDialogOpen(true)
  }, [])

  const handleDeleteRoom = useCallback(async () => {
    if (!deleteRoomTarget) return
    try {
      const result = await deleteRoom(deleteRoomTarget.id)
      if (result.success) {
        toast.success(`Zimmer "${deleteRoomTarget.name}" gelöscht.`)
        setDeleteRoomTarget(null)
        handleRefresh()
      } else {
        toast.error(`Fehler beim Löschen: ${result.error}`)
        setDeleteRoomTarget(null)
      }
    } catch (err) {
      console.error('Delete room failed:', err)
      toast.error('Fehler beim Löschen des Zimmers.')
      setDeleteRoomTarget(null)
    }
  }, [deleteRoomTarget, handleRefresh])

  const openCreateFloor = useCallback(() => {
    setEditingFloor(null)
    setFloorDialogOpen(true)
  }, [])

  const openEditFloor = useCallback((floor: FloorInfo) => {
    setEditingFloor(floor)
    setFloorDialogOpen(true)
  }, [])

  const handleDeleteFloor = useCallback(async () => {
    if (!deleteFloorTarget) return
    try {
      const result = await deleteFloor(deleteFloorTarget.id)
      if (result.success) {
        toast.success(`Etage "${deleteFloorTarget.name}" gelöscht.`)
        setDeleteFloorTarget(null)
        handleRefresh()
      } else {
        toast.error(`Fehler beim Löschen: ${result.error}`)
        setDeleteFloorTarget(null)
      }
    } catch (err) {
      console.error('Delete floor failed:', err)
      toast.error('Fehler beim Löschen der Etage.')
      setDeleteFloorTarget(null)
    }
  }, [deleteFloorTarget, handleRefresh])

  // Total occupants across all rooms (for disabling the clear button)
  const totalOccupants = data?.rooms.reduce((sum, r) => sum + r.occupants.length, 0) ?? 0

  // Group rooms by floor for rendering
  const floorGroups = data
    ? (() => {
        const groups = new Map<
          string,
          {
            floorId: string | null
            floorName: string
            floorGender: 'male' | 'female' | null
            rooms: RoomWithOccupants[]
          }
        >()

        for (const room of data.rooms) {
          const key = room.floorId ?? '__none__'
          if (!groups.has(key)) {
            groups.set(key, {
              floorId: room.floorId ?? null,
              floorName: room.floorName ?? 'Ohne Etage',
              floorGender: room.floorGender ?? null,
              rooms: [],
            })
          }
          groups.get(key)!.rooms.push(room)
        }

        // Sort: named floors alphabetically, "Ohne Etage" last
        return Array.from(groups.values()).sort((a, b) => {
          if (a.floorId === null) return 1
          if (b.floorId === null) return -1
          return a.floorName.localeCompare(b.floorName, 'de')
        })
      })()
    : []

  // ---- render ----
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Raumplan</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedEventId}
            onValueChange={(val) => setSelectedEventId(val ?? '')}
            items={events.map((ev) => ({ value: ev.id, label: ev.name }))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="-- Freizeit auswählen --" />
            </SelectTrigger>
            <SelectContent>
              {events.map((ev) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEventId && (
            <ButtonGroup>
              <Button onClick={handleAutoAssign} disabled={autoLoading || loading}>
                {autoLoading ? 'Berechne...' : 'Auto-Zuweisen'}
              </Button>
              <Button onClick={handleSave} disabled={!dirty || saving}>
                {saving ? <Spinner /> : <Save />}
              </Button>
              <Button onClick={handleReset} disabled={!dirty}>
                <RotateCcw />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger
                  disabled={loading || totalOccupants === 0}
                  render={
                    <Button variant="destructive" disabled={loading || totalOccupants === 0}>
                      <Trash2 />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Alle Zimmer leeren?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Alle {totalOccupants} Bewohner werden in &quot;Nicht zugewiesen&quot;
                      verschoben. Dies kann nicht rückgängig gemacht werden, solange du nicht
                      gespeichert hast.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllRooms} variant="destructive">
                      Leeren
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ButtonGroup>
          )}

          {selectedEventId && !loading && (
            <ButtonGroup>
              <Button variant="outline" onClick={() => openCreateRoom()}>
                <Plus /> Zimmer
              </Button>
              <Button variant="outline" onClick={openCreateFloor}>
                <Plus /> Etage
              </Button>
            </ButtonGroup>
          )}
        </div>
      </div>

      {/* Preview banner */}
      {preview && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold">Auto-Zuweisung Vorschau</span>
              <span className="text-muted-foreground text-sm">
                Gegenseitige Wünsche: {preview.mutualWishScore}% • Alle Wünsche:{' '}
                {preview.totalWishScore}% • Nicht zugewiesen: {preview.unassigned.length}
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyPreview}>Vorschau übernehmen</Button>
              <Button onClick={() => setPreview(null)}>Verwerfen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dirty indicator */}
      {dirty && (
        <Badge variant="destructive" className="w-fit gap-1.5 px-3 py-1 text-xs">
          Ungespeicherte Änderungen
        </Badge>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex gap-4">
          <Skeleton className="h-[400px] w-[220px] rounded-xl" />
          <Skeleton className="h-[400px] w-[220px] rounded-xl" />
          <Skeleton className="h-[400px] w-[220px] rounded-xl" />
          <Skeleton className="h-[400px] w-[220px] rounded-xl" />
        </div>
      ) : data ? (
        data.rooms.length === 0 && data.unassigned.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-muted-foreground py-12 text-center">
              <p className="font-medium">
                Keine Zimmer oder Anmeldungen für diese Freizeit gefunden.
              </p>
              <p className="mt-1 text-sm">
                Lege Zimmer in der &quot;sommerfreizeitRooms&quot; Sammlung an und verknüpfe sie mit
                dieser Freizeit.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-start gap-4 overflow-x-auto pb-2">
            {/* Unassigned sidebar */}
            <Card
              size="sm"
              className={cn(
                'bg-muted/30 max-w-[260px] min-w-[220px] shrink-0 border-2 border-dashed',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(null)
              }}
            >
              <CardHeader>
                <CardTitle>Nicht zugewiesen ({data.unassigned.length})</CardTitle>
              </CardHeader>
              <div className="flex flex-col gap-1">
                {data.unassigned.map((child) => (
                  <ChildCard
                    key={child.id}
                    id={child.id}
                    firstName={child.firstName}
                    lastName={child.lastName}
                    childClass={child.class}
                    childGender={child.childGender}
                    wishNames={child.wishNames}
                    onDragStart={handleDragStart}
                    fromRoomId={null}
                  />
                ))}
                {data.unassigned.length === 0 && (
                  <div className="text-muted-foreground py-4 text-center text-xs">
                    Alle zugewiesen ✓
                  </div>
                )}
              </div>
            </Card>

            {/* Rooms grouped by floor */}
            <div className="flex flex-1 flex-col gap-6">
              {floorGroups.map((group) => (
                <div key={group.floorId ?? '__none__'}>
                  {/* Floor header */}
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-base font-semibold">{group.floorName}</h3>
                    {group.floorGender === 'male' && <Mars className="h-4 w-4 text-blue-500" />}
                    {group.floorGender === 'female' && <Venus className="h-4 w-4 text-pink-500" />}
                    <span className="text-muted-foreground text-xs">
                      ({group.rooms.length} {group.rooms.length === 1 ? 'Zimmer' : 'Zimmer'})
                    </span>
                    {/* Floor actions */}
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Zimmer zu dieser Etage hinzufügen"
                        onClick={() => openCreateRoom(group.floorId)}
                      >
                        <Plus />
                      </Button>
                      {group.floorId && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Etage bearbeiten"
                            onClick={() =>
                              openEditFloor({
                                id: group.floorId!,
                                name: group.floorName,
                                gender: group.floorGender,
                              })
                            }
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Etage löschen"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeleteFloorTarget({
                                id: group.floorId!,
                                name: group.floorName,
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Room cards for this floor */}
                  <div className="flex gap-4">
                    {group.rooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onEdit={openEditRoom}
                        onDelete={setDeleteRoomTarget}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center">
            Wähle eine Freizeit aus, um den Raumplan zu sehen.
          </CardContent>
        </Card>
      )}
      {/* ── Dialogs ────────────────────────────────────────── */}
      <RoomDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        onSaved={handleRefresh}
        eventId={selectedEventId}
        floors={floors}
        room={editingRoom}
        defaultFloorId={defaultFloorId}
      />

      <FloorDialog
        open={floorDialogOpen}
        onOpenChange={setFloorDialogOpen}
        onSaved={handleRefresh}
        eventId={selectedEventId}
        floor={editingFloor}
      />

      {/* Delete room confirmation */}
      <AlertDialog
        open={!!deleteRoomTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteRoomTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zimmer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du das Zimmer &quot;{deleteRoomTarget?.name}&quot; wirklich löschen?
              {deleteRoomTarget && deleteRoomTarget.occupants.length > 0 && (
                <>
                  {' '}
                  Die {deleteRoomTarget.occupants.length} Bewohner werden in &quot;Nicht
                  zugewiesen&quot; verschoben.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRoomTarget(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} variant="destructive">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete floor confirmation */}
      <AlertDialog
        open={!!deleteFloorTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteFloorTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Etage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Etage &quot;{deleteFloorTarget?.name}&quot; wirklich löschen? Alle
              Zimmer dieser Etage werden in &quot;Ohne Etage&quot; verschoben.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFloorTarget(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFloor} variant="destructive">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---- helpers ----

function findChild(
  data: RoomPlanData,
  id: string,
): (RoomWithOccupants['occupants'][number] & { wishNames: string[] }) | undefined {
  for (const room of data.rooms) {
    const found = room.occupants.find((o) => o.id === id)
    if (found) return found
  }
  const unassigned = data.unassigned.find((u) => u.id === id)
  if (unassigned)
    return {
      ...unassigned,
      wishTargets: [],
    }
  return undefined
}

function findChildInAnyRoom(
  data: RoomPlanData,
  id: string,
): RoomWithOccupants['occupants'][number] | undefined {
  for (const room of data.rooms) {
    const found = room.occupants.find((o) => o.id === id)
    if (found) return found
  }
  return undefined
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from '@payloadcms/ui'
import { Button } from '@/components/ui/button'
import { RotateCcw, Save, Trash2, Mars, Venus, Plus, Pencil, Download } from 'lucide-react'
import {
  fetchRoomPlanData,
  fetchFloors,
  runChildAutoAssign,
  runTeamerAutoAssign,
  saveRoomAssignments,
  deleteRoom,
  deleteFloor,
} from './actions'
import { getEffectiveRoomGender, isGenderCompatible } from '@/utilities/roomAssignment'
import type {
  EventFloor,
  FloorInfo,
  RoomPlanData,
  RoomWithOccupants,
  TeamerOccupant,
  ChildAutoAssignPreview,
  TeamerAutoAssignPreview,
} from './types'
import { RoomCard, type DragKind } from './RoomCard'
import { ChildCard } from './ChildCard'
import { TeamerCard } from './TeamerCard'
import { RoomDialog } from './RoomDialog'
import { FloorDialog } from './FloorDialog'
import { RaumplanDocument } from './RaumplanDocument'
import { pdf } from '@react-pdf/renderer'
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

interface RaumplanClientProps {
  events: EventOption[]
  /** All floors from the sommerfreizeitFloors collection, keyed by their event */
  floors: EventFloor[]
  /** Event preselected from the sommerfreizeit landing page global */
  defaultEventId?: string | null
}

export function RaumplanClient({
  events,
  floors: floorsByEvent,
  defaultEventId,
}: RaumplanClientProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId ?? '')
  const [data, setData] = useState<RoomPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [teamerLoading, setTeamerLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<ChildAutoAssignPreview | null>(null)
  const [teamerPreview, setTeamerPreview] = useState<TeamerAutoAssignPreview | null>(null)
  const [dirty, setDirty] = useState(false)
  const [dragState, setDragState] = useState<{
    id: string
    name: string
    fromRoomId: string | null
    kind: DragKind
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
  const [exportLoading, setExportLoading] = useState(false)

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
    setTeamerPreview(null)
    setDirty(false)

    fetchRoomPlanData(selectedEventId)
      .then((result) => {
        setData(result)
        initialDataRef.current = JSON.stringify({
          rooms: result.rooms.map((r) => ({
            id: r.id,
            occIds: r.occupants.map((o) => o.id),
            teamerIds: r.teamerOccupants.map((t) => t.id),
          })),
          unassigned: result.unassigned.map((u) => u.id),
          unassignedTeamers: result.unassignedTeamers.map((t) => t.id),
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load room plan data:', err)
        toast.error('Fehler beim Laden der Daten.')
        setLoading(false)
      })
  }, [selectedEventId])

  // Sync floors for the selected event from the server-provided collection data
  useEffect(() => {
    setFloors(
      selectedEventId
        ? floorsByEvent
            .filter((f) => f.eventId === selectedEventId)
            .sort((a, b) => a.name.localeCompare(b.name, 'de'))
        : [],
    )
  }, [selectedEventId, floorsByEvent])

  // ---- drag and drop handlers ----
  const handleDragStart = useCallback(
    (id: string, name: string, fromRoomId: string | null, kind: DragKind) => {
      setDragState({ id, name, fromRoomId, kind })
    },
    [],
  )

  const handleDrop = useCallback(
    (toRoomId: string | null) => {
      if (!dragState || !data) return

      const { id, fromRoomId, kind } = dragState

      if (fromRoomId === toRoomId) {
        setDragState(null)
        return
      }

      // ---- room restriction: children only into normal rooms, teamers only into teamer rooms ----
      if (toRoomId) {
        const targetRoom = data.rooms.find((r) => r.id === toRoomId)
        if (targetRoom) {
          if (kind === 'child' && targetRoom.teamerRoom) {
            toast.error('Kinder können nicht in Teamer-Zimmern untergebracht werden.')
            setDragState(null)
            return
          }
          if (kind === 'teamer' && !targetRoom.teamerRoom) {
            toast.error('Teamer können nur in Teamer-Zimmern untergebracht werden.')
            setDragState(null)
            return
          }
        }
      }

      // ---- gender validation (children only): prevent cross-gender mixing ----
      if (kind === 'child' && toRoomId) {
        const targetRoom = data.rooms.find((r) => r.id === toRoomId)
        if (targetRoom) {
          const child = findChild(data, id)
          if (child && child.childGender !== 'diverse') {
            // Compute the effective gender of the target room AFTER removing the
            // child from its source (the child being dragged isn't in the target yet)
            const targetOccupantGenders = targetRoom.occupants.map((o) => o.childGender)
            const effectiveGender = getEffectiveRoomGender(
              targetRoom.gender,
              targetRoom.floorGender ?? null,
              targetOccupantGenders,
            )

            if (!isGenderCompatible(child.childGender, effectiveGender)) {
              const roomHasGender =
                effectiveGender === 'male'
                  ? 'Jungen'
                  : effectiveGender === 'female'
                    ? 'Mädchen'
                    : effectiveGender === 'mixed'
                      ? 'Jungen und Mädchen (gemischt)'
                      : null
              if (roomHasGender) {
                toast.error(
                  `Dieses Zimmer enthält ${roomHasGender}. ${child.childGender === 'male' ? 'Jungen' : 'Mädchen'} können nicht in ein Zimmer mit ${roomHasGender} gelegt werden.`,
                )
              }
              setDragState(null)
              return
            }
          }
        }
      }

      // ---- gender validation (teamers only): respect an explicit teamer room gender ----
      if (kind === 'teamer' && toRoomId) {
        const targetRoom = data.rooms.find((r) => r.id === toRoomId)
        if (targetRoom?.gender) {
          const teamer = findTeamer(data, id)
          if (teamer && teamer.gender !== targetRoom.gender) {
            const roomHasGender = targetRoom.gender === 'male' ? 'Jungen' : 'Mädchen'
            toast.error(
              `Dieses Teamer-Zimmer ist für ${roomHasGender} vorgesehen. ${teamer.gender === 'male' ? 'Männliche' : 'Weibliche'} Teamer können hier nicht untergebracht werden.`,
            )
            setDragState(null)
            return
          }
        }
      }

      setData((prev) => {
        if (!prev) return prev

        const newData = { ...prev }

        if (kind === 'child') {
          // Capture child data BEFORE removing from source location
          const child = findChild(prev, id)
          if (!child) return prev

          if (fromRoomId) {
            newData.rooms = newData.rooms.map((r) => {
              if (r.id === fromRoomId) {
                return { ...r, occupants: r.occupants.filter((o) => o.id !== id) }
              }
              return r
            })
          } else {
            newData.unassigned = newData.unassigned.filter((u) => u.id !== id)
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
                      age: child.age,
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
                age: child.age,
                childGender: child.childGender,
                wishNames: child.wishNames,
              },
            ]
          }
        } else {
          // kind === 'teamer'
          const teamer = findTeamer(prev, id)
          if (!teamer) return prev

          if (fromRoomId) {
            newData.rooms = newData.rooms.map((r) => {
              if (r.id === fromRoomId) {
                return { ...r, teamerOccupants: r.teamerOccupants.filter((t) => t.id !== id) }
              }
              return r
            })
          } else {
            newData.unassignedTeamers = newData.unassignedTeamers.filter((t) => t.id !== id)
          }

          if (toRoomId) {
            newData.rooms = newData.rooms.map((r) => {
              if (r.id === toRoomId) {
                return {
                  ...r,
                  teamerOccupants: [
                    ...r.teamerOccupants,
                    {
                      id: teamer.id,
                      firstName: teamer.firstName,
                      lastName: teamer.lastName,
                      gender: teamer.gender,
                    },
                  ],
                }
              }
              return r
            })
          } else {
            newData.unassignedTeamers = [
              ...newData.unassignedTeamers,
              {
                id: teamer.id,
                firstName: teamer.firstName,
                lastName: teamer.lastName,
                gender: teamer.gender,
              },
            ]
          }
        }

        return newData
      })

      setDirty(true)
      setDragState(null)
    },
    [dragState, data],
  )

  // ---- auto-assign (children) ----
  const handleChildAutoAssign = useCallback(async () => {
    if (!selectedEventId) return
    setAutoLoading(true)
    try {
      const result = await runChildAutoAssign(selectedEventId)
      setPreview(result)
      const msg = `Auto-Zuweisung berechnet: ${result.mutualWishScore}% gegenseitige Wünsche erfüllt.`
      if (result.conflictedRoomIds.length > 0) {
        toast.warning(
          `${msg} ${result.conflictedRoomIds.length} Zimmer haben gemischte Belegung und wurden übersprungen.`,
        )
      } else {
        toast.success(msg)
      }
    } catch (err) {
      console.error('Auto-assign failed:', err)
      toast.error('Fehler bei der Auto-Zuweisung.')
    } finally {
      setAutoLoading(false)
    }
  }, [selectedEventId])

  // ---- auto-assign (teamers, independent from children) ----
  const handleTeamerAutoAssign = useCallback(async () => {
    if (!selectedEventId) return
    setTeamerLoading(true)
    try {
      const result = await runTeamerAutoAssign(selectedEventId)
      setTeamerPreview(result)
      const unassigned = result.unassignedTeamers.length
      toast.success(
        unassigned === 0
          ? 'Teamer-Zuweisung berechnet: alle Teamer zugewiesen.'
          : `Teamer-Zuweisung berechnet: ${unassigned} Teamer nicht zugewiesen.`,
      )
    } catch (err) {
      console.error('Teamer auto-assign failed:', err)
      toast.error('Fehler bei der Teamer-Zuweisung.')
    } finally {
      setTeamerLoading(false)
    }
  }, [selectedEventId])

  // Apply children preview (independent from teamers)
  const handleApplyChildPreview = useCallback(() => {
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
            age: unassigned.age,
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
          age: null,
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
            age: existing.age,
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
          age: null,
          childGender: 'diverse' as const,
          wishNames: [],
        }
      })
      .filter((u) => !newRooms.some((r) => r.occupants.some((o) => o.id === u.id)))

    setData({ ...data, rooms: newRooms, unassigned: newUnassigned })
    setDirty(true)
    setPreview(null)
    toast.success('Kinder-Vorschau übernommen. Klicke "Speichern" zum Persistieren.')
  }, [preview, data])

  // Apply teamer preview (independent from children)
  const handleApplyTeamerPreview = useCallback(() => {
    if (!teamerPreview || !data) return

    const newRooms = data.rooms.map((room) => {
      const previewTeamer = teamerPreview.teamerAssignments.find((a) => a.roomId === room.id)
      const teamerIds = previewTeamer?.teamerIds ?? []
      const teamerOccupants = teamerIds.map((tid) => resolveTeamer(data, tid))
      return { ...room, teamerOccupants }
    })

    const newUnassignedTeamers = teamerPreview.unassignedTeamers
      .map((tid) => resolveTeamer(data, tid))
      .filter((u) => !newRooms.some((r) => r.teamerOccupants.some((t) => t.id === u.id)))

    setData({ ...data, rooms: newRooms, unassignedTeamers: newUnassignedTeamers })
    setDirty(true)
    setTeamerPreview(null)
    toast.success('Teamer-Vorschau übernommen. Klicke "Speichern" zum Persistieren.')
  }, [teamerPreview, data])

  // ---- save ----
  const handleSave = useCallback(async () => {
    if (!data || !selectedEventId) return

    setSaving(true)
    try {
      const assignments: Record<string, string[]> = {}
      const teamerAssignments: Record<string, string[]> = {}
      for (const room of data.rooms) {
        assignments[room.id] = room.occupants.map((o) => o.id)
        teamerAssignments[room.id] = room.teamerOccupants.map((t) => t.id)
      }

      const result = await saveRoomAssignments(selectedEventId, assignments, teamerAssignments)
      if (result.success) {
        toast.success('Raumplan gespeichert!')
        setDirty(false)
        initialDataRef.current = JSON.stringify({
          rooms: data.rooms.map((r) => ({
            id: r.id,
            occIds: r.occupants.map((o) => o.id),
            teamerIds: r.teamerOccupants.map((t) => t.id),
          })),
          unassigned: data.unassigned.map((u) => u.id),
          unassignedTeamers: data.unassignedTeamers.map((t) => t.id),
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
                age: null,
                childGender: 'diverse' as const,
                wishNames: [],
                wishTargets: [],
              } as NonNullable<ReturnType<typeof findChildInAnyRoom>>),
          )
          const teamerIds: string[] = savedRoom?.teamerIds ?? []
          const teamerOccupants = teamerIds.map((tid) => resolveTeamer(prev, tid))
          return { ...room, occupants, teamerOccupants }
        })
        const unassignedIds: string[] = saved.unassigned ?? []
        const newUnassigned = unassignedIds.map((rid) => {
          const c = findChildInAnyRoom(prev, rid)
          if (c)
            return {
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              age: c.age,
              childGender: c.childGender,
              wishNames: c.wishNames,
            }
          const name = prev.allRegistrations.get(rid) ?? rid
          const [fn, ...ln] = name.split(' ')
          return {
            id: rid,
            firstName: fn,
            lastName: ln.join(' '),
            age: null,
            childGender: 'diverse' as const,
            wishNames: [],
          }
        })
        const unassignedTeamerIds: string[] = saved.unassignedTeamers ?? []
        const newUnassignedTeamers = unassignedTeamerIds
          .map((tid) => resolveTeamer(prev, tid))
          .filter((u) => !newRooms.some((r) => r.teamerOccupants.some((t) => t.id === u.id)))
        return {
          ...prev,
          rooms: newRooms,
          unassigned: newUnassigned,
          unassignedTeamers: newUnassignedTeamers,
        }
      })
      setDirty(false)
      setPreview(null)
      setTeamerPreview(null)
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

    const totalOccupants = data.rooms.reduce(
      (sum, r) => sum + r.occupants.length + r.teamerOccupants.length,
      0,
    )
    if (totalOccupants === 0) return

    // Collect all occupants from all rooms as unassigned children
    const allUnassigned = data.rooms.flatMap((room) =>
      room.occupants.map((occ) => ({
        id: occ.id,
        firstName: occ.firstName,
        lastName: occ.lastName,
        age: occ.age,
        childGender: occ.childGender,
        wishNames: occ.wishNames,
      })),
    )

    // Collect all teamers from all rooms as unassigned teamers
    const allUnassignedTeamers = data.rooms.flatMap((room) => room.teamerOccupants)

    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        rooms: prev.rooms.map((room) => ({ ...room, occupants: [], teamerOccupants: [] })),
        unassigned: [...prev.unassigned, ...allUnassigned],
        unassignedTeamers: [...prev.unassignedTeamers, ...allUnassignedTeamers],
      }
    })
    setDirty(true)
    setPreview(null)
    setTeamerPreview(null)
    toast.success('Alle Zimmer geleert. Klicke "Speichern" zum Persistieren.')
  }, [data])

  // ---- clear single room ----
  const handleClearRoom = useCallback(
    (room: RoomWithOccupants) => {
      if (!data) return

      if (room.occupants.length === 0 && room.teamerOccupants.length === 0) return

      // Collect room occupants as unassigned children
      const clearedOccupants = room.occupants.map((occ) => ({
        id: occ.id,
        firstName: occ.firstName,
        lastName: occ.lastName,
        age: occ.age,
        childGender: occ.childGender,
        wishNames: occ.wishNames,
      }))

      // Collect room teamers as unassigned teamers
      const clearedTeamers = room.teamerOccupants

      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          rooms: prev.rooms.map((r) =>
            r.id === room.id ? { ...r, occupants: [], teamerOccupants: [] } : r,
          ),
          unassigned: [...prev.unassigned, ...clearedOccupants],
          unassignedTeamers: [...prev.unassignedTeamers, ...clearedTeamers],
        }
      })
      setDirty(true)
      setPreview(null)
      setTeamerPreview(null)
      toast.success(`Zimmer "${room.name}" geleert. Klicke "Speichern" zum Persistieren.`)
    },
    [data],
  )

  // ---- PDF export ----
  const handleExportPdf = useCallback(async () => {
    if (!selectedEventId) return

    setExportLoading(true)
    try {
      const planData = await fetchRoomPlanData(selectedEventId)
      const blob = await pdf(<RaumplanDocument data={planData} />).toBlob()
      const blobUrl = URL.createObjectURL(blob)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const eventSlug = planData.eventName.replace(/[^a-zA-Z0-9äöüßÄÖÜ_-]/g, '_').slice(0, 40)
      const filename = `raumplan-${eventSlug}_${timestamp}.pdf`

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)

      toast.success('Raumplan als PDF exportiert.')
    } catch (err) {
      console.error('PDF export failed:', err)
      toast.error('Fehler beim PDF-Export.')
    } finally {
      setExportLoading(false)
    }
  }, [selectedEventId])

  // ── Dialog handlers ───────────────────────────────────────
  const handleRefresh = useCallback(() => {
    if (!selectedEventId) return
    setLoading(true)
    setPreview(null)
    setTeamerPreview(null)
    setDirty(false)
    Promise.all([fetchRoomPlanData(selectedEventId), fetchFloors(selectedEventId)])
      .then(([result, freshFloors]) => {
        setData(result)
        setFloors(freshFloors)
        initialDataRef.current = JSON.stringify({
          rooms: result.rooms.map((r) => ({
            id: r.id,
            occIds: r.occupants.map((o) => o.id),
            teamerIds: r.teamerOccupants.map((t) => t.id),
          })),
          unassigned: result.unassigned.map((u) => u.id),
          unassignedTeamers: result.unassignedTeamers.map((t) => t.id),
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to refresh room plan data:', err)
        toast.error('Fehler beim Aktualisieren der Daten.')
        setLoading(false)
      })
  }, [selectedEventId])

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
  const totalOccupants =
    data?.rooms.reduce((sum, r) => sum + r.occupants.length + r.teamerOccupants.length, 0) ?? 0

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

        // Seed groups from the collection floors so floors without rooms still render
        for (const floor of floors) {
          groups.set(floor.id, {
            floorId: floor.id,
            floorName: floor.name,
            floorGender: floor.gender ?? null,
            rooms: [],
          })
        }

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

        // Sort rooms within each floor alphabetically by name
        for (const group of groups.values()) {
          group.rooms.sort((a, b) => a.name.localeCompare(b.name, 'de'))
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
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold">Raumplan</h1>
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
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedEventId && (
            <ButtonGroup>
              <Button onClick={handleChildAutoAssign} disabled={autoLoading || loading}>
                {autoLoading ? 'Berechne...' : 'Kinder zuweisen'}
              </Button>
              <Button onClick={handleTeamerAutoAssign} disabled={teamerLoading || loading}>
                {teamerLoading ? 'Berechne...' : 'Teamer zuweisen'}
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
                      Alle {totalOccupants} Bewohner und Teamer werden in &quot;Nicht
                      zugewiesen&quot; verschoben. Dies kann nicht rückgängig gemacht werden,
                      solange du nicht gespeichert hast.
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
              <Button variant="outline" onClick={handleExportPdf} disabled={exportLoading}>
                {exportLoading ? (
                  'Exportiere...'
                ) : (
                  <>
                    <Download /> PDF
                  </>
                )}
              </Button>
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

      {/* Child auto-assign preview banner */}
      {preview && (
        <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold">Vorschau Kinder-Auto-Zuweisung</span>
                <span className="text-muted-foreground text-sm">
                  Gegenseitige Wünsche: {preview.mutualWishScore}% • Alle Wünsche:{' '}
                  {preview.totalWishScore}% • Nicht zugewiesen: {preview.unassigned.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyChildPreview}>Vorschau übernehmen</Button>
                <Button onClick={() => setPreview(null)}>Verwerfen</Button>
              </div>
            </div>
            {preview.conflictedRoomIds.length > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <span>
                  ⚠️ {preview.conflictedRoomIds.length} Zimmer haben bereits gemischte Belegung
                  (Jungen und Mädchen) und wurden bei der Auto-Zuweisung übersprungen. Bitte manuell
                  korrigieren.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teamer auto-assign preview banner */}
      {teamerPreview && (
        <Card className="border-sky-500 bg-sky-50 dark:bg-sky-950">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold">Vorschau Teamer-Zuweisung</span>
                <span className="text-muted-foreground text-sm">
                  Nicht zugewiesene Teamer: {teamerPreview.unassignedTeamers.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyTeamerPreview}>Vorschau übernehmen</Button>
                <Button onClick={() => setTeamerPreview(null)}>Verwerfen</Button>
              </div>
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
        data.rooms.length === 0 && data.unassigned.length === 0 && floors.length === 0 ? (
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
                    childAge={child.age}
                    childGender={child.childGender}
                    wishNames={child.wishNames}
                    onDragStart={(childId, childName) =>
                      handleDragStart(childId, childName, null, 'child')
                    }
                    fromRoomId={null}
                  />
                ))}
                {data.unassigned.length === 0 && (
                  <div className="text-muted-foreground py-4 text-center text-xs">
                    Alle zugewiesen ✓
                  </div>
                )}

                {/* Unassigned teamers */}
                {data.allTeamers.size > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <CardHeader>
                      <CardTitle>
                        Nicht zugewiesene Teamer ({data.unassignedTeamers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1">
                      {data.unassignedTeamers.map((t) => (
                        <TeamerCard
                          key={t.id}
                          id={t.id}
                          firstName={t.firstName}
                          lastName={t.lastName}
                          gender={t.gender}
                          onDragStart={(teamerId, teamerName) =>
                            handleDragStart(teamerId, teamerName, null, 'teamer')
                          }
                          fromRoomId={null}
                        />
                      ))}
                      {data.unassignedTeamers.length === 0 && (
                        <div className="text-muted-foreground py-2 text-center text-xs">
                          Alle Teamer zugewiesen ✓
                        </div>
                      )}
                    </CardContent>
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
                        onClean={handleClearRoom}
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

function findTeamer(data: RoomPlanData, id: string): TeamerOccupant | undefined {
  for (const room of data.rooms) {
    const found = room.teamerOccupants.find((t) => t.id === id)
    if (found) return found
  }
  return data.unassignedTeamers.find((t) => t.id === id)
}

/**
 * Resolve a teamer by ID, falling back to the known team members of the event
 * and finally to a placeholder (used when applying auto-assign previews).
 */
function resolveTeamer(data: RoomPlanData, id: string): TeamerOccupant {
  return (
    findTeamer(data, id) ??
    data.allTeamers.get(id) ?? {
      id,
      firstName: id,
      lastName: '',
      gender: 'male' as const,
    }
  )
}

'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { computeRoomAssignments } from '@/utilities/roomAssignment'
import type {
  AutoAssignPreview,
  CreateFloorResult,
  CreateRoomResult,
  CrudResult,
  FloorFormData,
  FloorInfo,
  RoomFormData,
  RoomPlanData,
  RoomWithOccupants,
  UnassignedChild,
} from './types'

function resolveId(value: string | { id: string } | undefined | null): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.id
}

export async function fetchRoomPlanData(eventId: string): Promise<RoomPlanData> {
  const payload = await getPayload({ config })

  const [roomsResult, registrationsResult] = await Promise.all([
    payload.find({
      collection: 'sommerfreizeitRooms',
      where: { freizeit: { equals: eventId } },
      depth: 2, // populate occupants and floor
      limit: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'sommerfreizeitAnmeldung',
      where: {
        and: [
          { event: { equals: eventId } },
          { _status: { equals: 'published' } },
        ],
      },
      depth: 1,
      limit: 0,
      overrideAccess: true,
    }),
  ])

  // Build name lookup map
  const allRegistrations = new Map<string, string>()
  for (const r of registrationsResult.docs) {
    const reg = r as any
    allRegistrations.set(reg.id, `${reg.firstName} ${reg.lastName}`)
  }

  // Which registrations are already in a room?
  const assignedIds = new Set<string>()
  const rooms: RoomWithOccupants[] = roomsResult.docs.map((r) => {
    const room = r as any
    const occupants = (room.occupants ?? []).map((o: any) => {
      const reg = typeof o === 'object' ? o : null
      const id = resolveId(o)
      if (id) assignedIds.add(id)
      return {
        id: id ?? '',
        firstName: reg?.firstName ?? '',
        lastName: reg?.lastName ?? '',
        class: reg?.class ?? '',
        childGender: reg?.gender ?? 'diverse',
        wishNames: (reg?.zimmerwunsch ?? [])
          .map((w: any) => {
            const targetId = resolveId(w.childRelation)
            return targetId ? allRegistrations.get(targetId) ?? `${w.firstName} ${w.lastName ?? ''}`.trim() : `${w.firstName} ${w.lastName ?? ''}`.trim()
          }),
        wishTargets: (reg?.zimmerwunsch ?? [])
          .map((w: any) => resolveId(w.childRelation))
          .filter(Boolean),

      }
    })

    return {
      id: room.id,
      name: room.name,
      beschreibung: room.beschreibung,
      gender: (room.gender === 'male' || room.gender === 'female') ? room.gender : null,
      capacity: room.capacity ?? null,
      floorId: room.floor && typeof room.floor === 'object' ? (room.floor as any).id ?? null : (typeof room.floor === 'string' ? room.floor : null),
      floorName: room.floor && typeof room.floor === 'object' ? (room.floor as any).name ?? null : null,
      floorGender: room.floor && typeof room.floor === 'object'
        ? ((room.floor as any).gender === 'male' || (room.floor as any).gender === 'female' ? (room.floor as any).gender : null)
        : null,
      occupants,
      genderConflict:
        (room.genderComposition?.male ?? 0) > 0 &&
        (room.genderComposition?.female ?? 0) > 0,
    }
  })



  // Unassigned children
  const unassigned: UnassignedChild[] = registrationsResult.docs
    .filter((r: any) => !assignedIds.has(r.id))
    .map((r: any) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      class: r.class,
      childGender: r.gender ?? 'diverse',
      wishNames: (r.zimmerwunsch ?? []).map((w: any) => {
        const targetId = resolveId(w.childRelation)
        return targetId
          ? allRegistrations.get(targetId) ?? `${w.firstName} ${w.lastName ?? ''}`.trim()
          : `${w.firstName} ${w.lastName ?? ''}`.trim()
      }),
    }))

  // Get event name
  const event = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    overrideAccess: true,
    select: { name: true },
  })

  return {
    eventId,
    eventName: (event as any).name ?? eventId,
    rooms,
    unassigned,
    allRegistrations,
  }
}

export async function runAutoAssign(eventId: string): Promise<AutoAssignPreview> {
  const payload = await getPayload({ config })
  const result = await computeRoomAssignments(eventId, payload)
  return {
    assignments: result.assignments,
    mutualWishScore: result.mutualWishScore,
    totalWishScore: result.totalWishScore,
    unassigned: result.unassigned,
    conflictedRoomIds: result.conflictedRoomIds,
  }
}

export async function saveRoomAssignments(
  eventId: string,
  assignments: Record<string, string[]>,
): Promise<{ success: boolean; error?: string }> {
  const payload = await getPayload({ config })

  try {
    // ---- validate: no cross-gender mixing ----
    // Fetch all registration genders + all affected rooms in parallel
    const allRegIds = new Set<string>()
    for (const regIds of Object.values(assignments)) {
      for (const rid of regIds) allRegIds.add(rid)
    }

    const roomIds = Object.keys(assignments)

    const [regsResult, roomsResult] = await Promise.all([
      allRegIds.size > 0
        ? payload.find({
          collection: 'sommerfreizeitAnmeldung',
          where: { id: { in: Array.from(allRegIds) } },
          limit: 0,
          overrideAccess: true,
        })
        : Promise.resolve({ docs: [] }),
      payload.find({
        collection: 'sommerfreizeitRooms',
        where: { id: { in: roomIds } },
        limit: roomIds.length,
        overrideAccess: true,
      }),
    ])

    // Build lookup maps
    const regMap = new Map<string, 'male' | 'female' | 'diverse'>()
    for (const r of regsResult.docs) {
      const reg = r as any
      regMap.set(reg.id, reg.gender ?? 'diverse')
    }

    const roomMap = new Map(roomsResult.docs.map((r) => [(r as any).id, r as any]))

    // Validate each room — use stored genderComposition for existence check
    for (const [roomId, regIds] of Object.entries(assignments)) {
      const occupantGenders = regIds
        .map((rid) => regMap.get(rid))
        .filter((g): g is 'male' | 'female' | 'diverse' => g !== undefined)

      const binaryGenders = occupantGenders.filter((g) => g !== 'diverse')
      const hasMale = binaryGenders.includes('male')
      const hasFemale = binaryGenders.includes('female')

      if (!hasMale || !hasFemale) continue

      // Check stored composition for pre-existing mixing (O(1) read)
      const existingRoom = roomMap.get(roomId)
      const comp = (existingRoom as any)?.genderComposition as
        | { male: number; female: number }
        | undefined
      const wasMixed = (comp?.male ?? 0) > 0 && (comp?.female ?? 0) > 0

      if (!wasMixed) {
        const roomName = (existingRoom as any)?.name ?? roomId
        return {
          success: false,
          error: `Zimmer "${roomName}" enthält sowohl Jungen als auch Mädchen. Gemischte Belegung ist nicht erlaubt.`,
        }
      }
      // Existing mixing — warn but allow
      payload.logger.warn(
        `Room ${roomId} already has mixed-gender occupants — save allowed but should be fixed manually.`,
      )
    }

    // Update each room — skip hook re-validation via context
    for (const [roomId, regIds] of Object.entries(assignments)) {
      await payload.update({
        collection: 'sommerfreizeitRooms',
        id: roomId,
        data: { occupants: regIds },
        overrideAccess: true,
        context: { skipGenderValidation: true },
      })
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to save room assignments: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function moveRegistration(
  registrationId: string,
  fromRoomId: string | null,
  toRoomId: string,
): Promise<{ success: boolean; error?: string }> {
  const payload = await getPayload({ config })

  try {
    // Remove from source room if applicable
    if (fromRoomId) {
      const fromRoom = await payload.findByID({
        collection: 'sommerfreizeitRooms',
        id: fromRoomId,
        overrideAccess: true,
      })
      const updatedOccupants = ((fromRoom as any).occupants ?? [])
        .map((o: any) => resolveId(o))
        .filter((id: string | null) => id !== registrationId)
      await payload.update({
        collection: 'sommerfreizeitRooms',
        id: fromRoomId,
        data: { occupants: updatedOccupants },
        overrideAccess: true,
      })
    }

    // Add to target room
    const toRoom = await payload.findByID({
      collection: 'sommerfreizeitRooms',
      id: toRoomId,
      overrideAccess: true,
    })
    const currentOccupants = ((toRoom as any).occupants ?? [])
      .map((o: any) => resolveId(o))
      .filter(Boolean) as string[]
    if (!currentOccupants.includes(registrationId)) {
      currentOccupants.push(registrationId)
    }
    await payload.update({
      collection: 'sommerfreizeitRooms',
      id: toRoomId,
      data: { occupants: currentOccupants },
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

// ─── Room CRUD ───────────────────────────────────────────────

export async function createRoom(
  eventId: string,
  data: RoomFormData,
): Promise<CreateRoomResult> {
  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'sommerfreizeitRooms',
      data: {
        name: data.name,
        beschreibung: data.beschreibung ?? '',
        capacity: data.capacity ?? undefined,
        gender: data.gender ?? undefined,
        freizeit: eventId,
        teamerRoom: data.teamerRoom,
        floor: data.floorId ?? undefined,
        occupants: [],
      },
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to create room: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function updateRoom(
  roomId: string,
  data: Partial<RoomFormData>,
): Promise<CrudResult> {
  const payload = await getPayload({ config })

  try {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.beschreibung !== undefined) updateData.beschreibung = data.beschreibung
    if (data.capacity !== undefined) updateData.capacity = data.capacity ?? undefined
    if (data.gender !== undefined) updateData.gender = data.gender ?? undefined
    if (data.floorId !== undefined) updateData.floor = data.floorId ?? undefined
    if (data.teamerRoom !== undefined) updateData.teamerRoom = data.teamerRoom

    await payload.update({
      collection: 'sommerfreizeitRooms',
      id: roomId,
      data: updateData,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to update room: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function deleteRoom(roomId: string): Promise<CrudResult> {
  const payload = await getPayload({ config })

  try {
    await payload.delete({
      collection: 'sommerfreizeitRooms',
      id: roomId,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to delete room: ${message}`, err })
    return { success: false, error: message }
  }
}

// ─── Floor CRUD ──────────────────────────────────────────────

export async function fetchFloors(eventId: string): Promise<FloorInfo[]> {
  const payload = await getPayload({ config })

  try {
    const result = await payload.find({
      collection: 'sommerfreizeitFloors',
      where: { freizeit: { equals: eventId } },
      limit: 0,
      overrideAccess: true,
    })

    return result.docs.map((f: any) => ({
      id: f.id,
      name: f.name,
      gender: (f.gender === 'male' || f.gender === 'female') ? f.gender : null,
    }))
  } catch (err) {
    payload.logger.error({ msg: `Failed to fetch floors: ${err}`, err })
    return []
  }
}

export async function createFloor(
  eventId: string,
  data: FloorFormData,
): Promise<CreateFloorResult> {
  const payload = await getPayload({ config })

  try {
    const floor = await payload.create({
      collection: 'sommerfreizeitFloors',
      data: {
        name: data.name,
        gender: data.gender ?? undefined,
        freizeit: eventId,
      },
      overrideAccess: true,
    })

    return {
      success: true,
      floor: {
        id: floor.id,
        name: (floor as any).name,
        gender: (floor as any).gender === 'male' || (floor as any).gender === 'female' ? (floor as any).gender : null,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to create floor: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function updateFloor(
  floorId: string,
  data: Partial<FloorFormData>,
): Promise<CrudResult> {
  const payload = await getPayload({ config })

  try {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.gender !== undefined) updateData.gender = data.gender ?? undefined

    await payload.update({
      collection: 'sommerfreizeitFloors',
      id: floorId,
      data: updateData,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to update floor: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function deleteFloor(floorId: string): Promise<CrudResult> {
  const payload = await getPayload({ config })

  try {
    // Unset the floor reference on all rooms assigned to this floor
    const roomsWithFloor = await payload.find({
      collection: 'sommerfreizeitRooms',
      where: { floor: { equals: floorId } },
      limit: 0,
      overrideAccess: true,
    })

    for (const room of roomsWithFloor.docs) {
      await payload.update({
        collection: 'sommerfreizeitRooms',
        id: room.id,
        data: { floor: undefined },
        overrideAccess: true,
      })
    }

    await payload.delete({
      collection: 'sommerfreizeitFloors',
      id: floorId,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to delete floor: ${message}`, err })
    return { success: false, error: message }
  }
}

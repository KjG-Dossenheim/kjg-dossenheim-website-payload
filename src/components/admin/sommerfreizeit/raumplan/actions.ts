'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { computeChildRoomAssignments, computeTeamerRoomAssignments } from '@/utilities/roomAssignment'
import type {
  ChildAutoAssignPreview,
  CreateFloorResult,
  CreateRoomResult,
  CrudResult,
  FloorFormData,
  FloorInfo,
  RegistrationDetails,
  RegistrationDetailsResult,
  RoomFormData,
  RoomPlanData,
  RoomWithOccupants,
  TeamerAutoAssignPreview,
  TeamerOccupant,
  UnassignedChild,
} from './types'

function resolveId(value: string | { id: string } | undefined | null): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.id
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

/**
 * Resolve a registration's age. Prefers the auto-computed `age` field
 * (see calculateAgeBeforeChange hook); falls back to computing it from
 * `dateOfBirth` for legacy documents where `age` is not yet stored.
 */
function resolveAge(reg: any): number | null {
  if (typeof reg?.age === 'number') return reg.age
  if (reg?.dateOfBirth) {
    const birthDate = new Date(reg.dateOfBirth)
    if (!Number.isNaN(birthDate.getTime())) {
      return Math.floor((Date.now() - birthDate.getTime()) / MS_PER_YEAR)
    }
  }
  return null
}

export async function fetchRoomPlanData(eventId: string): Promise<RoomPlanData> {
  const payload = await getPayload({ config })

  const [roomsResult, registrationsResult, eventResult] = await Promise.all([
    payload.find({
      collection: 'sommerfreizeitRooms',
      where: { freizeit: { equals: eventId } },
      depth: 2, // populate occupants, teamerOccupants and floor
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
    payload.findByID({
      collection: 'sommerfreizeitEvents',
      id: eventId,
      overrideAccess: true,
      select: { name: true, team: true },
    }),
  ])

  // Build name lookup map
  const allRegistrations = new Map<string, string>()
  for (const r of registrationsResult.docs) {
    const reg = r as any
    allRegistrations.set(reg.id, `${reg.firstName} ${reg.lastName}`)
  }

  // Resolve the event's team members (teamers) for name lookups + unassigned list
  const eventDoc = eventResult as any
  const rawTeam: (string | { id: string })[] = eventDoc?.team ?? []
  const teamIds = rawTeam
    .map((t) => (typeof t === 'string' ? t : t?.id))
    .filter((id): id is string => Boolean(id))
  const allTeamers = new Map<string, TeamerOccupant>()
  if (teamIds.length > 0) {
    const teamResult = await payload.find({
      collection: 'team',
      where: { id: { in: teamIds } },
      limit: 0,
      overrideAccess: true,
    })
    for (const t of teamResult.docs as any[]) {
      allTeamers.set(t.id, {
        id: t.id,
        firstName: t.firstName ?? '',
        lastName: t.lastName ?? '',
        gender: t.gender === 'female' ? 'female' : 'male',
      })
    }
  }

  // Which registrations / teamers are already in a room?
  const assignedIds = new Set<string>()
  const assignedTeamerIds = new Set<string>()
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
        age: resolveAge(reg),
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

    const teamerOccupants: TeamerOccupant[] = (room.teamerOccupants ?? []).map((o: any) => {
      const t = typeof o === 'object' ? o : null
      const id = resolveId(o)
      if (id) assignedTeamerIds.add(id)
      return {
        id: id ?? '',
        firstName: t?.firstName ?? '',
        lastName: t?.lastName ?? '',
        gender: t?.gender === 'female' ? 'female' : 'male',
      }
    })

    return {
      id: room.id,
      name: room.name,
      beschreibung: room.beschreibung,
      gender: (room.gender === 'male' || room.gender === 'female') ? room.gender : null,
      capacity: room.capacity,
      teamerRoom: !!room.teamerRoom,
      floorId: room.floor && typeof room.floor === 'object' ? (room.floor as any).id ?? null : (typeof room.floor === 'string' ? room.floor : null),
      floorName: room.floor && typeof room.floor === 'object' ? (room.floor as any).name ?? null : null,
      floorGender: room.floor && typeof room.floor === 'object'
        ? ((room.floor as any).gender === 'male' || (room.floor as any).gender === 'female' ? (room.floor as any).gender : null)
        : null,
      occupants,
      teamerOccupants,
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
      age: resolveAge(r),
      childGender: r.gender ?? 'diverse',
      wishNames: (r.zimmerwunsch ?? []).map((w: any) => {
        const targetId = resolveId(w.childRelation)
        return targetId
          ? allRegistrations.get(targetId) ?? `${w.firstName} ${w.lastName ?? ''}`.trim()
          : `${w.firstName} ${w.lastName ?? ''}`.trim()
      }),
    }))

  // Unassigned teamers (team members of the event not in any teamer room)
  const unassignedTeamers: TeamerOccupant[] = teamIds
    .filter((id) => !assignedTeamerIds.has(id))
    .map((id) => allTeamers.get(id))
    .filter((t): t is TeamerOccupant => Boolean(t))

  return {
    eventId,
    eventName: eventDoc?.name ?? eventId,
    rooms,
    unassigned,
    unassignedTeamers,
    allRegistrations,
    allTeamers,
  }
}

export async function fetchRegistrationDetails(
  registrationId: string,
): Promise<RegistrationDetailsResult> {
  const payload = await getPayload({ config })

  try {
    const reg = (await payload.findByID({
      collection: 'sommerfreizeitAnmeldung',
      id: registrationId,
      depth: 1, // populate account, child, room and zimmerwunsch.childRelation
      overrideAccess: true,
    })) as any

    if (!reg) {
      return { success: false, error: 'Anmeldung nicht gefunden.' }
    }

    const account = reg.account && typeof reg.account === 'object' ? reg.account : null
    const child = reg.child && typeof reg.child === 'object' ? reg.child : null
    const room = reg.room && typeof reg.room === 'object' ? reg.room : null

    const age =
      child?.age ??
      (reg.dateOfBirth
        ? Math.floor(
          (Date.now() - new Date(reg.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
        )
        : null)

    const roomWishes = (reg.zimmerwunsch ?? [])
      .map((w: any) => {
        if (w.childRelation && typeof w.childRelation === 'object' && w.childRelation.firstName) {
          return `${w.childRelation.firstName} ${w.childRelation.lastName ?? ''}`.trim()
        }
        return `${w.firstName ?? ''} ${w.lastName ?? ''}`.trim()
      })
      .filter(Boolean)

    const details: RegistrationDetails = {
      id: reg.id,
      firstName: reg.firstName ?? '',
      lastName: reg.lastName ?? '',
      dateOfBirth: reg.dateOfBirth ?? null,
      age,
      gender:
        reg.gender === 'male' || reg.gender === 'female' || reg.gender === 'diverse'
          ? reg.gender
          : null,
      bemerkungen: reg.bemerkungen ?? null,
      otherAllergies: reg.otherAllergies ?? null,
      medicalConditions: reg.medicalConditions ?? null,
      medikamente: reg.medikamente ?? null,
      medikamenteList: (reg.medikamenteArray ?? []).map((m: any) => ({
        name: m.name ?? '',
        dosierung: m.dosierung ?? '',
      })),
      arzt: reg.arzt ?? null,
      arztTelefon: reg.arztTelefon ?? null,
      foodAllergies: reg.foodAllergies ?? null,
      foodPreferences: reg.foodPreferences ?? null,
      roomName: room?.name ?? null,
      roomWishes,
      contact: account
        ? {
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          email: account.email ?? '',
          phone: account.phone ?? '',
        }
        : null,
    }

    return { success: true, details }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error({ msg: `Failed to fetch registration details: ${message}`, err })
    return { success: false, error: message }
  }
}

export async function runChildAutoAssign(eventId: string): Promise<ChildAutoAssignPreview> {
  const payload = await getPayload({ config })
  const result = await computeChildRoomAssignments(eventId, payload)
  return {
    assignments: result.assignments,
    mutualWishScore: result.mutualWishScore,
    totalWishScore: result.totalWishScore,
    unassigned: result.unassigned,
    conflictedRoomIds: result.conflictedRoomIds,
  }
}

export async function runTeamerAutoAssign(eventId: string): Promise<TeamerAutoAssignPreview> {
  const payload = await getPayload({ config })
  const result = await computeTeamerRoomAssignments(eventId, payload)
  return {
    teamerAssignments: result.teamerAssignments,
    unassignedTeamers: result.unassignedTeamers,
  }
}

export async function saveRoomAssignments(
  eventId: string,
  assignments: Record<string, string[]>,
  teamerAssignments?: Record<string, string[]>,
): Promise<{ success: boolean; error?: string }> {
  const payload = await getPayload({ config })

  try {
    // ---- validate: no cross-gender mixing ----
    // Fetch all registration genders + all affected rooms in parallel
    const allRegIds = new Set<string>()
    for (const regIds of Object.values(assignments)) {
      for (const rid of regIds) allRegIds.add(rid)
    }

    const roomIds = new Set<string>([
      ...Object.keys(assignments),
      ...Object.keys(teamerAssignments ?? {}),
    ])

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
        where: { id: { in: Array.from(roomIds) } },
        limit: roomIds.size,
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

    // ---- strict separation: children only in normal rooms, teamers only in teamer rooms ----
    for (const [roomId, regIds] of Object.entries(assignments)) {
      const room = roomMap.get(roomId) as any
      const isTeamerRoom = !!room?.teamerRoom
      if (isTeamerRoom && regIds.length > 0) {
        return {
          success: false,
          error: `Zimmer "${room?.name ?? roomId}" ist ein Teamer-Zimmer. Kinder können hier nicht untergebracht werden.`,
        }
      }
    }
    for (const [roomId, teamerIds] of Object.entries(teamerAssignments ?? {})) {
      if (teamerIds.length === 0) continue
      const room = roomMap.get(roomId) as any
      if (room && !room.teamerRoom) {
        return {
          success: false,
          error: `Zimmer "${room?.name ?? roomId}" ist kein Teamer-Zimmer. Teamer können hier nicht untergebracht werden.`,
        }
      }
    }

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
    for (const roomId of roomIds) {
      const regIds = assignments[roomId] ?? []
      const teamerIds = teamerAssignments?.[roomId] ?? []
      await payload.update({
        collection: 'sommerfreizeitRooms',
        id: roomId,
        data: {
          occupants: regIds,
          teamerOccupants: teamerIds,
          _status: 'published',
        },
        overrideAccess: true,
        overrideLock: true,
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
        data: { occupants: updatedOccupants, _status: 'published' },
        overrideAccess: true,
        overrideLock: true,
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
      data: { occupants: currentOccupants, _status: 'published' },
      overrideAccess: true,
      overrideLock: true,
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
        capacity: data.capacity,
        gender: data.gender ?? undefined,
        freizeit: eventId,
        teamerRoom: data.teamerRoom,
        floor: data.floorId ?? undefined,
        occupants: [],
        // Mit aktivierten Drafts muss explizit publiziert werden, sonst
        // erhalten neue Zimmer den Default `_status: 'draft'`.
        _status: 'published',
      },
      draft: false,
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
    // Bei aktivierten Drafts explizit publizieren (Versionen = Audit-Log).
    updateData._status = 'published'

    await payload.update({
      collection: 'sommerfreizeitRooms',
      id: roomId,
      data: updateData,
      overrideAccess: true,
      overrideLock: true,
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
      overrideLock: true,
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

    return result.docs
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        gender: (f.gender === 'male' || f.gender === 'female') ? f.gender : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
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
        data: { floor: undefined, _status: 'published' },
        overrideAccess: true,
        overrideLock: true,
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

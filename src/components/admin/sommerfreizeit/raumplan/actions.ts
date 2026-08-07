'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { computeRoomAssignments } from '@/utilities/roomAssignment'
import type { AutoAssignPreview, RoomPlanData, RoomWithOccupants, UnassignedChild } from './types'

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
      depth: 1,
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
      occupants,
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
  }
}

export async function saveRoomAssignments(
  eventId: string,
  assignments: Record<string, string[]>,
): Promise<{ success: boolean; error?: string }> {
  const payload = await getPayload({ config })

  try {
    // Update each room's occupants
    for (const [roomId, regIds] of Object.entries(assignments)) {
      await payload.update({
        collection: 'sommerfreizeitRooms',
        id: roomId,
        data: { occupants: regIds },
        overrideAccess: true,
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

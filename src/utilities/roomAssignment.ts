import type { Payload } from 'payload'
import type {
  SommerfreizeitAnmeldung,
  SommerfreizeitChild,
  SommerfreizeitFloor,
  SommerfreizeitRoom,
} from '@/payload-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoomInfo {
  id: string
  name: string
  gender: 'male' | 'female' | null
  capacity: number | null // null = unlimited
  currentOccupants: string[] // registration IDs already in the room
  /** True if existing occupants already contain both male and female children */
  genderConflict: boolean
}

export interface RegistrationInfo {
  id: string
  firstName: string
  lastName: string
  class: string
  childGender: 'male' | 'female' | 'diverse'
  /** Registration IDs this child wishes to room with (resolved from childRelation) */
  wishTargets: string[]
}

export interface RoomAssignment {
  roomId: string
  roomName: string
  registrationIds: string[]
}

export interface AssignmentResult {
  assignments: RoomAssignment[]
  /** 0-100 percentage of mutual wishes satisfied */
  mutualWishScore: number
  /** 0-100 percentage of total (mutual + one-way) wishes satisfied */
  totalWishScore: number
  /** Registrations that couldn't be auto-assigned (e.g. diverse gender, no matching room) */
  unassigned: string[]
  /** Room IDs that already had mixed-gender occupants before assignment */
  conflictedRoomIds: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a relation that may be a string ID or a populated object. */
function resolveId(value: string | { id: string } | undefined | null): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.id
}

/** Resolve gender from a child reference (string ID or populated object). */
function resolveChildGender(
  child: string | SommerfreizeitChild | undefined | null,
): 'male' | 'female' | 'diverse' {
  if (!child) return 'diverse'
  if (typeof child === 'string') return 'diverse' // can't determine without population
  return child.gender
}

// ---------------------------------------------------------------------------
// Gender compatibility helpers (exported for reuse in UI validation)
// ---------------------------------------------------------------------------

/**
 * Determine the de-facto gender of a room, considering:
 * 1. Room's declared gender setting
 * 2. Floor's declared gender (if room has none)
 * 3. Consensus of existing occupants' genders
 *
 * Returns 'mixed' if existing occupants already contain both male and female.
 */
export function getEffectiveRoomGender(
  roomGender: 'male' | 'female' | null | undefined,
  floorGender: 'male' | 'female' | null | undefined,
  occupantGenders: ('male' | 'female' | 'diverse')[],
): 'male' | 'female' | 'mixed' | null {
  // Explicit room gender takes priority
  if (roomGender === 'male' || roomGender === 'female') return roomGender
  // Floor gender as fallback
  if (floorGender === 'male' || floorGender === 'female') return floorGender

  // No explicit gender — derive from existing occupants (excluding diverse)
  const binaryGenders = occupantGenders.filter((g) => g !== 'diverse')
  if (binaryGenders.length === 0) return null

  const hasMale = binaryGenders.includes('male')
  const hasFemale = binaryGenders.includes('female')

  if (hasMale && hasFemale) return 'mixed'
  if (hasMale) return 'male'
  return 'female'
}

/**
 * Check whether a child of the given gender can be placed in a room
 * with the given effective gender.
 * Diverse children are always compatible.
 * No child is compatible with a 'mixed' room (manual fix needed).
 */
export function isGenderCompatible(
  childGender: 'male' | 'female' | 'diverse',
  effectiveRoomGender: 'male' | 'female' | 'mixed' | null,
): boolean {
  if (childGender === 'diverse') return true
  if (effectiveRoomGender === 'mixed') return false
  if (effectiveRoomGender === null) return true
  return childGender === effectiveRoomGender
}

// ---------------------------------------------------------------------------
// Main algorithm
// ---------------------------------------------------------------------------

/**
 * Compute room assignments for all registrations of a given event.
 *
 * Algorithm:
 * 1. Fetch rooms & registrations for the event
 * 2. Build wish graph from zimmerwunsch[].childRelation
 * 3. Split by child gender
 * 4. Build wish-based connected components from children with room wishes
 * 5. Group remaining children without wishes by school class
 * 6. Greedy bin-pack clusters into matching-gender rooms (wish clusters first,
 *    then class clusters)
 */
export async function computeRoomAssignments(
  eventId: string,
  payload: Payload,
): Promise<AssignmentResult> {
  // ---- fetch data ----
  const [roomsResult, registrationsResult] = await Promise.all([
    payload.find({
      collection: 'sommerfreizeitRooms',
      where: { freizeit: { equals: eventId } },
      depth: 1, // populate floor relationship
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
      depth: 1, // populate child + zimmerwunsch.childRelation one level
      limit: 0,
      overrideAccess: true,
    }),
  ])

  const rooms: RoomInfo[] = roomsResult.docs.map((r) => {
    const room = r as unknown as SommerfreizeitRoom
    // Resolve floor gender if floor is populated
    const floorGender =
      room.floor && typeof room.floor === 'object'
        ? (room.floor as SommerfreizeitFloor).gender ?? null
        : null
    // Effective gender: room gender overrides floor gender, both null = neutral
    const effectiveGender: 'male' | 'female' | null =
      room.gender === 'male' || room.gender === 'female'
        ? room.gender
        : floorGender === 'male' || floorGender === 'female'
          ? floorGender
          : null

    const occupantIds = (room.occupants ?? [])
      .map((o) => resolveId(o as string | { id: string }))
      .filter(Boolean) as string[]

    // Read conflict state from denormalized genderComposition field (O(1))
    const comp = (room as any).genderComposition as
      | { male: number; female: number }
      | undefined
    const hasConflict = (comp?.male ?? 0) > 0 && (comp?.female ?? 0) > 0

    return {
      id: room.id,
      name: room.name,
      gender: effectiveGender,
      capacity: room.capacity ?? null,
      currentOccupants: occupantIds,
      genderConflict: hasConflict,
    }
  })

  const registrations: RegistrationInfo[] = registrationsResult.docs.map((r) => {
    const reg = r as unknown as SommerfreizeitAnmeldung
    const wishTargets: string[] = []
    if (reg.zimmerwunsch) {
      for (const wish of reg.zimmerwunsch) {
        const targetId = resolveId(
          wish.childRelation as string | { id: string } | undefined | null,
        )
        if (targetId) wishTargets.push(targetId)
      }
    }
    return {
      id: reg.id,
      firstName: reg.firstName,
      lastName: reg.lastName,
      class: reg.class,
      childGender: resolveChildGender(reg.child),
      wishTargets,
    }
  })

  const regMap = new Map(registrations.map((r) => [r.id, r]))

  // ---- collect already-assigned occupants (remove from pool) ----
  const alreadyAssigned = new Set<string>()
  for (const room of rooms) {
    for (const occId of room.currentOccupants) {
      alreadyAssigned.add(occId)
    }
  }

  const pool = registrations.filter((r) => !alreadyAssigned.has(r.id))
  const poolIds = new Set(pool.map((r) => r.id))

  // ---- split by gender ----
  const male = pool.filter((r) => r.childGender === 'male')
  const female = pool.filter((r) => r.childGender === 'female')
  const diverse = pool.filter((r) => r.childGender === 'diverse')

  const maleRooms = rooms.filter((r) => r.gender === 'male' && !r.genderConflict)
  const femaleRooms = rooms.filter((r) => r.gender === 'female' && !r.genderConflict)
  const neutralRooms = rooms.filter((r) => r.gender === null && !r.genderConflict)

  // ---- helper: build clusters (wish graph + class groups) ----
  function buildWishClusters(group: RegistrationInfo[]): RegistrationInfo[][] {
    // Split into children with wishes (clustered by wish graph) and without (grouped by class)
    const withWishes = group.filter((r) => r.wishTargets.length > 0)
    const withoutWishes = group.filter((r) => r.wishTargets.length === 0)

    // ---- Build wish-based connected components ----
    const wishSet = new Set(withWishes.map((r) => r.id))
    const adj = new Map<string, Set<string>>()
    for (const r of withWishes) {
      if (!adj.has(r.id)) adj.set(r.id, new Set())
      for (const targetId of r.wishTargets) {
        if (wishSet.has(targetId)) {
          adj.get(r.id)!.add(targetId)
        }
      }
    }

    const visited = new Set<string>()
    const clusters: RegistrationInfo[][] = []

    for (const r of withWishes) {
      if (visited.has(r.id)) continue
      // DFS
      const component: string[] = []
      const stack = [r.id]
      while (stack.length > 0) {
        const current = stack.pop()!
        if (visited.has(current)) continue
        visited.add(current)
        component.push(current)
        for (const neighbor of adj.get(current) ?? []) {
          if (!visited.has(neighbor)) stack.push(neighbor)
        }
      }
      clusters.push(component.map((id) => regMap.get(id)!))
    }

    // sort wish clusters largest first
    clusters.sort((a, b) => b.length - a.length)

    // ---- Group unconnected children (no wishes) by school class ----
    const classGroups = new Map<string, RegistrationInfo[]>()
    for (const r of withoutWishes) {
      const className = r.class || 'unknown'
      if (!classGroups.has(className)) classGroups.set(className, [])
      classGroups.get(className)!.push(r)
    }

    const classClusters = Array.from(classGroups.values())
    // sort class clusters largest first
    classClusters.sort((a, b) => b.length - a.length)

    // Wish clusters first (priority), then class clusters
    return [...clusters, ...classClusters]
  }

  // ---- helper: assign clusters to rooms (First Fit Decreasing, grade-aware) ----
  function assignToRooms(
    clusters: RegistrationInfo[][],
    availableRooms: RoomInfo[],
    initialCounts?: Map<string, number>,
  ): { assignments: Map<string, string[]>; remaining: RegistrationInfo[] } {
    const assignments = new Map<string, string[]>()
    for (const room of availableRooms) {
      assignments.set(room.id, [])
    }

    // track current occupancy count per room (include prior assignments if provided)
    const roomCounts = new Map<string, number>()
    for (const room of availableRooms) {
      roomCounts.set(room.id, initialCounts?.get(room.id) ?? room.currentOccupants.length)
    }

    // track class stats per room for grade-gap scoring
    // roomId -> { sum of numeric classes, count of occupants }
    const roomClassStats = new Map<string, { sum: number; count: number }>()
    for (const room of availableRooms) {
      let sum = 0
      let count = 0
      for (const occId of room.currentOccupants) {
        const reg = regMap.get(occId)
        if (reg) {
          const num = parseInt(reg.class, 10)
          if (!isNaN(num)) {
            sum += num
            count++
          }
        }
      }
      roomClassStats.set(room.id, { sum, count })
    }

    // helper: compute average numeric class of a group of registrations
    function avgClass(regs: RegistrationInfo[]): number | null {
      let sum = 0
      let count = 0
      for (const r of regs) {
        const num = parseInt(r.class, 10)
        if (!isNaN(num)) {
          sum += num
          count++
        }
      }
      return count > 0 ? sum / count : null
    }

    // helper: get room average class
    function roomAvgClass(roomId: string): number | null {
      const stats = roomClassStats.get(roomId)
      if (!stats || stats.count === 0) return null
      return stats.sum / stats.count
    }

    const remaining: RegistrationInfo[] = []

    for (const cluster of clusters) {
      const clusterAvg = avgClass(cluster)

      // find best-fit room: prefer grade gap ≤ 1 over capacity utilization
      // (leaving space is better than mixing grades more than 1 year apart)
      let bestRoom: RoomInfo | null = null
      let bestScore = Infinity
      let bestGradeGap = Infinity

      for (const room of availableRooms) {
        const current = roomCounts.get(room.id) ?? 0
        const afterAssign = current + cluster.length
        const capacity = room.capacity

        // if over capacity AND capacity is set, skip
        if (capacity !== null && afterAssign > capacity) continue

        // capacity score: lower = fuller room = better fit
        const score = capacity !== null ? capacity - afterAssign : afterAssign

        // grade gap (smaller = closer age match)
        let gradeGap = 0
        if (clusterAvg !== null) {
          const roomAvg = roomAvgClass(room.id)
          if (roomAvg !== null) {
            gradeGap = Math.abs(clusterAvg - roomAvg)
          }
        }

        // primary: prefer gap ≤ 1 (tier 0) over gap > 1 (tier 1)
        // secondary: within same tier, prefer better capacity fit
        const gapTier = gradeGap <= 1 ? 0 : 1
        const bestGapTier = bestGradeGap <= 1 ? 0 : 1

        if (gapTier < bestGapTier || (gapTier === bestGapTier && score < bestScore)) {
          bestScore = score
          bestGradeGap = gradeGap
          bestRoom = room
        }
      }

      if (bestRoom) {
        assignments.get(bestRoom.id)!.push(...cluster.map((r) => r.id))
        roomCounts.set(
          bestRoom.id,
          (roomCounts.get(bestRoom.id) ?? 0) + cluster.length,
        )
        // update room class stats
        if (clusterAvg !== null) {
          const stats = roomClassStats.get(bestRoom.id)!
          stats.sum += clusterAvg * cluster.length
          stats.count += cluster.length
        }
      } else {
        // no room fits — try splitting the cluster
        // assign individuals to rooms, preferring gap ≤ 1 over capacity
        for (const reg of cluster) {
          const regAvg = avgClass([reg])
          let splitRoom: RoomInfo | null = null
          let splitScore = Infinity
          let splitGradeGap = Infinity
          for (const room of availableRooms) {
            const current = roomCounts.get(room.id) ?? 0
            const after = current + 1
            const cap = room.capacity
            if (cap !== null && after > cap) continue
            const score = cap !== null ? cap - after : after

            let gradeGap = 0
            if (regAvg !== null) {
              const roomAvg = roomAvgClass(room.id)
              if (roomAvg !== null) {
                gradeGap = Math.abs(regAvg - roomAvg)
              }
            }

            const gapTier = gradeGap <= 1 ? 0 : 1
            const bestGapTier = splitGradeGap <= 1 ? 0 : 1

            if (gapTier < bestGapTier || (gapTier === bestGapTier && score < splitScore)) {
              splitScore = score
              splitGradeGap = gradeGap
              splitRoom = room
            }
          }
          if (splitRoom) {
            assignments.get(splitRoom.id)!.push(reg.id)
            roomCounts.set(splitRoom.id, (roomCounts.get(splitRoom.id) ?? 0) + 1)
            // update room class stats for this individual
            if (regAvg !== null) {
              const stats = roomClassStats.get(splitRoom.id)!
              stats.sum += regAvg
              stats.count += 1
            }
          } else {
            remaining.push(reg)
          }
        }
      }
    }

    return { assignments, remaining }
  }

  // ---- run assignment per gender ----
  const result = new Map<string, RoomAssignment>()

  // initialise result with all rooms
  for (const room of rooms) {
    result.set(room.id, {
      roomId: room.id,
      roomName: room.name,
      registrationIds: [...room.currentOccupants],
    })
  }

  // ---- helper: calculate available spots in a set of rooms ----
  function availableSpots(roomList: RoomInfo[]): number {
    let total = 0
    for (const r of roomList) {
      if (r.capacity === null) return Infinity
      total += Math.max(0, r.capacity - r.currentOccupants.length)
    }
    return total
  }

  // ---- distribute genderless rooms based on demand ----
  const maleAvail = availableSpots(maleRooms)
  const femaleAvail = availableSpots(femaleRooms)

  let maleDeficit = Math.max(0, male.length - maleAvail)
  let femaleDeficit = Math.max(0, female.length - femaleAvail)

  const assignedMaleRooms: RoomInfo[] = [...maleRooms]
  const assignedFemaleRooms: RoomInfo[] = [...femaleRooms]

  // Sort by available spots (largest first) to give biggest rooms to greatest need
  const sortedNeutral = [...neutralRooms].sort((a, b) => {
    const aSpots = a.capacity === null ? Infinity : Math.max(0, a.capacity - a.currentOccupants.length)
    const bSpots = b.capacity === null ? Infinity : Math.max(0, b.capacity - b.currentOccupants.length)
    return bSpots - aSpots
  })

  for (const room of sortedNeutral) {
    const spots = room.capacity === null
      ? Infinity
      : Math.max(0, room.capacity - room.currentOccupants.length)

    // Determine existing occupant gender to avoid mixing
    let existingOccupantGender: 'male' | 'female' | null = null
    if (room.currentOccupants.length > 0) {
      let hasMale = false
      let hasFemale = false
      for (const occId of room.currentOccupants) {
        const reg = regMap.get(occId)
        if (reg?.childGender === 'male') hasMale = true
        if (reg?.childGender === 'female') hasFemale = true
      }
      // If already mixed, skip this room (it's conflicted and handled elsewhere)
      if (hasMale && hasFemale) continue
      if (hasMale) existingOccupantGender = 'male'
      else if (hasFemale) existingOccupantGender = 'female'
    }

    if (existingOccupantGender === 'male') {
      assignedMaleRooms.push(room)
      maleDeficit = Math.max(0, maleDeficit - (spots === Infinity ? maleDeficit : spots))
    } else if (existingOccupantGender === 'female') {
      assignedFemaleRooms.push(room)
      femaleDeficit = Math.max(0, femaleDeficit - (spots === Infinity ? femaleDeficit : spots))
    } else if (maleDeficit >= femaleDeficit) {
      assignedMaleRooms.push(room)
      maleDeficit = Math.max(0, maleDeficit - (spots === Infinity ? maleDeficit : spots))
    } else {
      assignedFemaleRooms.push(room)
      femaleDeficit = Math.max(0, femaleDeficit - (spots === Infinity ? femaleDeficit : spots))
    }
  }

  const unassigned: string[] = []

  // assign male
  if (male.length > 0 && assignedMaleRooms.length > 0) {
    const maleClusters = buildWishClusters(male)
    const { assignments: maleAssign, remaining: maleRemaining } = assignToRooms(maleClusters, assignedMaleRooms)
    for (const [roomId, regIds] of maleAssign) {
      result.get(roomId)!.registrationIds.push(...regIds)
    }
    unassigned.push(...maleRemaining.map((r) => r.id))
  } else if (male.length > 0) {
    unassigned.push(...male.map((r) => r.id))
  }

  // assign female
  if (female.length > 0 && assignedFemaleRooms.length > 0) {
    const femaleClusters = buildWishClusters(female)
    const { assignments: femaleAssign, remaining: femaleRemaining } = assignToRooms(femaleClusters, assignedFemaleRooms)
    for (const [roomId, regIds] of femaleAssign) {
      result.get(roomId)!.registrationIds.push(...regIds)
    }
    unassigned.push(...femaleRemaining.map((r) => r.id))
  } else if (female.length > 0) {
    unassigned.push(...female.map((r) => r.id))
  }

  // diverse: do not auto-assign
  unassigned.push(...diverse.map((r) => r.id))

  // ---- calculate scores ----
  const assignments = Array.from(result.values())
  const allAssigned = new Map<string, string>() // regId -> roomId
  for (const a of assignments) {
    for (const rid of a.registrationIds) {
      allAssigned.set(rid, a.roomId)
    }
  }

  let mutualWishes = 0
  let mutualWishesSatisfied = 0
  let totalWishes = 0
  let totalWishesSatisfied = 0

  for (const reg of registrations) {
    if (unassigned.includes(reg.id)) continue
    const regRoom = allAssigned.get(reg.id)
    if (!regRoom) continue

    for (const targetId of reg.wishTargets) {
      if (!poolIds.has(targetId) && !alreadyAssigned.has(targetId)) continue
      const targetRoom = allAssigned.get(targetId)
      totalWishes++
      if (targetRoom === regRoom) {
        totalWishesSatisfied++
      }

      // check if mutual
      const target = regMap.get(targetId)
      if (target && target.wishTargets.includes(reg.id)) {
        mutualWishes++
        if (targetRoom === regRoom) {
          mutualWishesSatisfied++
        }
      }
    }
  }

  const mutualWishScore = mutualWishes > 0 ? Math.round((mutualWishesSatisfied / mutualWishes) * 100) : 100
  const totalWishScore = totalWishes > 0 ? Math.round((totalWishesSatisfied / totalWishes) * 100) : 100

  // Derive conflicted room IDs from the room flags (set during building phase)
  const conflictedRoomIds = rooms.filter((r) => r.genderConflict).map((r) => r.id)

  return {
    assignments,
    mutualWishScore,
    totalWishScore,
    unassigned,
    conflictedRoomIds,
  }
}

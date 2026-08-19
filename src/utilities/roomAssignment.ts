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
  /** True if this room is reserved for teamers (excluded from auto-assign) */
  teamerRoom: boolean
  currentOccupants: string[] // registration IDs already in the room
  /** Team member IDs already assigned to this teamer room */
  teamerOccupantIds: string[]
  /** True if existing occupants already contain both male and female children */
  genderConflict: boolean
}

export interface RegistrationInfo {
  id: string
  firstName: string
  lastName: string
  age: number | null
  childGender: 'male' | 'female' | 'diverse'
  /** Registration IDs this child wishes to room with (resolved from childRelation) */
  wishTargets: string[]
}

export interface TeamerInfo {
  id: string
  firstName: string
  lastName: string
  gender: 'male' | 'female'
}

export interface RoomAssignment {
  roomId: string
  roomName: string
  registrationIds: string[]
}

export interface ChildAssignmentResult {
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

export interface TeamerAssignmentResult {
  /** Teamer room assignments: roomId → team member IDs (only teamer rooms) */
  teamerAssignments: { roomId: string; teamerIds: string[] }[]
  /** Team member IDs that couldn't be auto-assigned (no fitting teamer room) */
  unassignedTeamers: string[]
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
// Shared data helpers (used by both child and teamer assignment)
// ---------------------------------------------------------------------------

async function buildRoomInfos(eventId: string, payload: Payload): Promise<RoomInfo[]> {
  const roomsResult = await payload.find({
    collection: 'sommerfreizeitRooms',
    where: { freizeit: { equals: eventId } },
    depth: 1, // populate floor relationship
    limit: 0,
    overrideAccess: true,
  })

  return roomsResult.docs.map((r) => {
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

    const teamerOccupantIds = (room.teamerOccupants ?? [])
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
      teamerRoom: !!room.teamerRoom,
      currentOccupants: occupantIds,
      teamerOccupantIds,
      genderConflict: hasConflict,
    }
  })
}

async function fetchRegistrations(
  eventId: string,
  payload: Payload,
): Promise<RegistrationInfo[]> {
  const registrationsResult = await payload.find({
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
  })

  return registrationsResult.docs.map((r) => {
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
      age: reg.age ?? null,
      childGender: resolveChildGender(reg.child),
      wishTargets,
    }
  })
}

async function fetchTeamers(eventId: string, payload: Payload): Promise<TeamerInfo[]> {
  const eventResult = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    overrideAccess: true,
    select: { team: true },
  })

  const rawTeam = ((eventResult as any)?.team ?? []) as (string | { id: string })[]
  const teamIds = rawTeam
    .map((t) => (typeof t === 'string' ? t : t?.id))
    .filter((id): id is string => Boolean(id))

  const teamers: TeamerInfo[] = []
  if (teamIds.length > 0) {
    const teamResult = await payload.find({
      collection: 'team',
      where: { id: { in: teamIds } },
      limit: 0,
      overrideAccess: true,
    })
    for (const t of teamResult.docs as any[]) {
      teamers.push({
        id: t.id,
        firstName: t.firstName ?? '',
        lastName: t.lastName ?? '',
        gender: t.gender === 'female' ? 'female' : 'male',
      })
    }
  }

  return teamers
}

// ---------------------------------------------------------------------------
// Child assignment (independent from teamer assignment)
// ---------------------------------------------------------------------------

/**
 * Compute room assignments for all registrations (children) of a given event.
 * Runs independently from teamer assignment.
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
export async function computeChildRoomAssignments(
  eventId: string,
  payload: Payload,
): Promise<ChildAssignmentResult> {
  // ---- fetch data ----
  const [rooms, registrations] = await Promise.all([
    buildRoomInfos(eventId, payload),
    fetchRegistrations(eventId, payload),
  ])

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

  // Teamer rooms are never auto-assigned — children are only placed manually
  const assignableRooms = rooms.filter((r) => !r.teamerRoom)
  const maleRooms = assignableRooms.filter((r) => r.gender === 'male' && !r.genderConflict)
  const femaleRooms = assignableRooms.filter((r) => r.gender === 'female' && !r.genderConflict)
  const neutralRooms = assignableRooms.filter((r) => r.gender === null && !r.genderConflict)

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

    // ---- Group unconnected children (no wishes) by age ----
    const ageGroups = new Map<string, RegistrationInfo[]>()
    for (const r of withoutWishes) {
      const ageGroup = r.age != null ? String(r.age) : 'unknown'
      if (!ageGroups.has(ageGroup)) ageGroups.set(ageGroup, [])
      ageGroups.get(ageGroup)!.push(r)
    }

    const ageClusters = Array.from(ageGroups.values())
    // sort age clusters largest first
    ageClusters.sort((a, b) => b.length - a.length)

    // Wish clusters first (priority), then age clusters
    return [...clusters, ...ageClusters]
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

    // track age stats per room for age-gap scoring
    // roomId -> { sum of ages, count of occupants }
    const roomAgeStats = new Map<string, { sum: number; count: number }>()
    for (const room of availableRooms) {
      let sum = 0
      let count = 0
      for (const occId of room.currentOccupants) {
        const reg = regMap.get(occId)
        if (reg && reg.age != null) {
          sum += reg.age
          count++
        }
      }
      roomAgeStats.set(room.id, { sum, count })
    }

    // helper: compute average age of a group of registrations
    function avgAge(regs: RegistrationInfo[]): number | null {
      let sum = 0
      let count = 0
      for (const r of regs) {
        if (r.age != null) {
          sum += r.age
          count++
        }
      }
      return count > 0 ? sum / count : null
    }

    // helper: get room average age
    function roomAvgAge(roomId: string): number | null {
      const stats = roomAgeStats.get(roomId)
      if (!stats || stats.count === 0) return null
      return stats.sum / stats.count
    }

    const remaining: RegistrationInfo[] = []

    for (const cluster of clusters) {
      const clusterAvg = avgAge(cluster)

      // find best-fit room: prefer age gap ≤ 1 over capacity utilization
      // (leaving space is better than mixing ages more than 1 year apart)
      let bestRoom: RoomInfo | null = null
      let bestScore = Infinity
      let bestAgeGap = Infinity

      for (const room of availableRooms) {
        const current = roomCounts.get(room.id) ?? 0
        const afterAssign = current + cluster.length
        const capacity = room.capacity

        // if over capacity AND capacity is set, skip
        if (capacity !== null && afterAssign > capacity) continue

        // capacity score: lower = fuller room = better fit
        const score = capacity !== null ? capacity - afterAssign : afterAssign

        // age gap (smaller = closer age match)
        let ageGap = 0
        if (clusterAvg !== null) {
          const roomAvg = roomAvgAge(room.id)
          if (roomAvg !== null) {
            ageGap = Math.abs(clusterAvg - roomAvg)
          }
        }

        // primary: prefer gap ≤ 1 (tier 0) over gap > 1 (tier 1)
        // secondary: within same tier, prefer better capacity fit
        const gapTier = ageGap <= 1 ? 0 : 1
        const bestGapTier = bestAgeGap <= 1 ? 0 : 1

        if (gapTier < bestGapTier || (gapTier === bestGapTier && score < bestScore)) {
          bestScore = score
          bestAgeGap = ageGap
          bestRoom = room
        }
      }

      if (bestRoom) {
        assignments.get(bestRoom.id)!.push(...cluster.map((r) => r.id))
        roomCounts.set(
          bestRoom.id,
          (roomCounts.get(bestRoom.id) ?? 0) + cluster.length,
        )
        // update room age stats
        if (clusterAvg !== null) {
          const stats = roomAgeStats.get(bestRoom.id)!
          stats.sum += clusterAvg * cluster.length
          stats.count += cluster.length
        }
      } else {
        // no room fits — try splitting the cluster
        // assign individuals to rooms, preferring gap ≤ 1 over capacity
        for (const reg of cluster) {
          const regAvg = avgAge([reg])
          let splitRoom: RoomInfo | null = null
          let splitScore = Infinity
          let splitAgeGap = Infinity
          for (const room of availableRooms) {
            const current = roomCounts.get(room.id) ?? 0
            const after = current + 1
            const cap = room.capacity
            if (cap !== null && after > cap) continue
            const score = cap !== null ? cap - after : after

            let ageGap = 0
            if (regAvg !== null) {
              const roomAvg = roomAvgAge(room.id)
              if (roomAvg !== null) {
                ageGap = Math.abs(regAvg - roomAvg)
              }
            }

            const gapTier = ageGap <= 1 ? 0 : 1
            const bestGapTier = splitAgeGap <= 1 ? 0 : 1

            if (gapTier < bestGapTier || (gapTier === bestGapTier && score < splitScore)) {
              splitScore = score
              splitAgeGap = ageGap
              splitRoom = room
            }
          }
          if (splitRoom) {
            assignments.get(splitRoom.id)!.push(reg.id)
            roomCounts.set(splitRoom.id, (roomCounts.get(splitRoom.id) ?? 0) + 1)
            // update room age stats for this individual
            if (regAvg !== null) {
              const stats = roomAgeStats.get(splitRoom.id)!
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

// ---------------------------------------------------------------------------
// Teamer assignment (independent from child assignment)
// ---------------------------------------------------------------------------

/**
 * Compute room assignments for the team members (teamers) of an event.
 * Runs independently from child assignment.
 *
 * Teamers are only placed into rooms flagged `teamerRoom: true`. Mixed
 * teamer rooms are allowed; an explicit room gender is respected.
 */
export async function computeTeamerRoomAssignments(
  eventId: string,
  payload: Payload,
): Promise<TeamerAssignmentResult> {
  // ---- fetch data ----
  const [rooms, teamers] = await Promise.all([
    buildRoomInfos(eventId, payload),
    fetchTeamers(eventId, payload),
  ])

  const teamerAssignments: { roomId: string; teamerIds: string[] }[] = []
  const unassignedTeamers: string[] = []

  // Existing teamer occupants (persisted teamerOccupants) are kept as-is.
  const teamerRooms = rooms.filter((r) => r.teamerRoom && !r.genderConflict)
  for (const room of teamerRooms) {
    teamerAssignments.push({ roomId: room.id, teamerIds: [...room.teamerOccupantIds] })
  }

  const assignedTeamerIds = new Set<string>()
  for (const room of teamerRooms) {
    for (const id of room.teamerOccupantIds) assignedTeamerIds.add(id)
  }

  const teamerPool = teamers.filter((t) => !assignedTeamerIds.has(t.id))

  if (teamerPool.length > 0) {
    if (teamerRooms.length > 0) {
      // Track occupancy per teamer room (capacity-aware)
      const teamerRoomCounts = new Map<string, number>()
      for (const room of teamerRooms) {
        teamerRoomCounts.set(room.id, room.teamerOccupantIds.length)
      }

      // Prefer filling rooms that already have teamers (grouping) over empty ones
      const teamerRoomPool = [...teamerRooms].sort((a, b) => {
        const aCount = teamerRoomCounts.get(a.id) ?? 0
        const bCount = teamerRoomCounts.get(b.id) ?? 0
        return bCount - aCount
      })

      for (const teamer of teamerPool) {
        // Find first fitting room: within capacity and (if the room declares an
        // explicit gender) matching the teamer's gender. Mixed teamer rooms are
        // otherwise allowed.
        let bestRoom: RoomInfo | null = null
        for (const room of teamerRoomPool) {
          const current = teamerRoomCounts.get(room.id) ?? 0
          const cap = room.capacity
          if (cap !== null && current >= cap) continue
          if (room.gender && room.gender !== teamer.gender) continue
          bestRoom = room
          break
        }

        if (bestRoom) {
          const entry = teamerAssignments.find((a) => a.roomId === bestRoom!.id)
          if (entry) {
            entry.teamerIds.push(teamer.id)
            teamerRoomCounts.set(bestRoom.id, (teamerRoomCounts.get(bestRoom.id) ?? 0) + 1)
          } else {
            unassignedTeamers.push(teamer.id)
          }
        } else {
          unassignedTeamers.push(teamer.id)
        }
      }
    } else {
      unassignedTeamers.push(...teamerPool.map((t) => t.id))
    }
  }

  return {
    teamerAssignments,
    unassignedTeamers,
  }
}

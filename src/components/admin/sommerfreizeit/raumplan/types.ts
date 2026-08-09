export interface RoomWithOccupants {
  id: string
  name: string
  beschreibung?: string | null
  gender: 'male' | 'female' | null
  capacity: number | null
  /** The floor this room belongs to (if any) */
  floorId?: string | null
  floorName?: string | null
  floorGender?: 'male' | 'female' | null
  occupants: OccupantInfo[]
}

export interface OccupantInfo {
  id: string
  firstName: string
  lastName: string
  class: string
  childGender: 'male' | 'female' | 'diverse'
  /** Display names of children this occupant wishes to room with */
  wishNames: string[]
  /** Registration IDs this occupant wishes to room with */
  wishTargets: string[]

}

export interface UnassignedChild {
  id: string
  firstName: string
  lastName: string
  class: string
  childGender: 'male' | 'female' | 'diverse'
  wishNames: string[]
}

export interface RoomPlanData {
  eventId: string
  eventName: string
  rooms: RoomWithOccupants[]
  unassigned: UnassignedChild[]
  /** Map of registration ID → display name for wish resolution */
  allRegistrations: Map<string, string>
}

export interface AutoAssignPreview {
  assignments: { roomId: string; registrationIds: string[] }[]
  mutualWishScore: number
  totalWishScore: number
  unassigned: string[]
}

export interface FloorInfo {
  id: string
  name: string
  gender: 'male' | 'female' | null
}

export interface RoomFormData {
  name: string
  beschreibung?: string
  capacity: number | null
  gender: 'male' | 'female' | null
  floorId: string | null
  teamerRoom: boolean
}

export interface FloorFormData {
  name: string
  gender: 'male' | 'female' | null
}

export interface CrudResult {
  success: boolean
  error?: string
}

export interface CreateRoomResult extends CrudResult {
  room?: RoomWithOccupants
}

export interface CreateFloorResult extends CrudResult {
  floor?: FloorInfo
}

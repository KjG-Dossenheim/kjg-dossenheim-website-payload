export interface RoomWithOccupants {
  id: string
  name: string
  beschreibung?: string | null
  gender: 'male' | 'female' | null
  capacity: number | null
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

export interface RoomWithOccupants {
  id: string
  name: string
  beschreibung?: string | null
  gender: 'male' | 'female' | null
  capacity: number | null
  /** True if this room is reserved for teamers (excluded from auto-assign) */
  teamerRoom: boolean
  /** The floor this room belongs to (if any) */
  floorId?: string | null
  floorName?: string | null
  floorGender?: 'male' | 'female' | null
  occupants: OccupantInfo[]
  /** Team members assigned to this teamer room */
  teamerOccupants: TeamerOccupant[]
  /** True if occupants already contain both male and female children */
  genderConflict: boolean
}

export interface OccupantInfo {
  id: string
  firstName: string
  lastName: string
  age: number | null
  childGender: 'male' | 'female' | 'diverse'
  /** Display names of children this occupant wishes to room with */
  wishNames: string[]
  /** Registration IDs this occupant wishes to room with */
  wishTargets: string[]

}

export interface TeamerOccupant {
  id: string
  firstName: string
  lastName: string
  gender: 'male' | 'female'
}

export interface UnassignedChild {
  id: string
  firstName: string
  lastName: string
  age: number | null
  childGender: 'male' | 'female' | 'diverse'
  wishNames: string[]
}

export interface RoomPlanData {
  eventId: string
  eventName: string
  rooms: RoomWithOccupants[]
  unassigned: UnassignedChild[]
  /** Teamers of the event that are not assigned to any teamer room */
  unassignedTeamers: TeamerOccupant[]
  /** Map of registration ID → display name for wish resolution */
  allRegistrations: Map<string, string>
  /** Map of team member ID → teamer (name + gender) */
  allTeamers: Map<string, TeamerOccupant>
}

export interface ChildAutoAssignPreview {
  assignments: { roomId: string; registrationIds: string[] }[]
  mutualWishScore: number
  totalWishScore: number
  unassigned: string[]
  /** Room IDs that already had mixed-gender occupants before assignment */
  conflictedRoomIds: string[]
}

export interface TeamerAutoAssignPreview {
  /** Teamer assignments: roomId → team member IDs */
  teamerAssignments: { roomId: string; teamerIds: string[] }[]
  /** Team member IDs that couldn't be auto-assigned */
  unassignedTeamers: string[]
}

export interface FloorInfo {
  id: string
  name: string
  gender: 'male' | 'female' | null
}

/** A floor from the sommerfreizeitFloors collection, tied to its event */
export interface EventFloor extends FloorInfo {
  eventId: string
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

/** Details of a single registration, shown in the child details drawer */
export interface RegistrationDetails {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string | null
  age?: number | null
  gender: 'male' | 'female' | 'diverse' | null
  bemerkungen?: string | null
  // Gesundheit
  otherAllergies?: string | null
  medicalConditions?: string | null
  medikamente?: string | null
  medikamenteList?: { name: string; dosierung?: string }[]
  arzt?: string | null
  arztTelefon?: string | null
  // Ernährung
  foodAllergies?: string | null
  foodPreferences?: 'none' | 'vegetarisch' | 'vegan' | null
  // Zimmer
  roomName?: string | null
  roomWishes: string[]
  // Notfallkontakt (Erziehungsberechtigte)
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  } | null
}

export interface RegistrationDetailsResult extends CrudResult {
  details?: RegistrationDetails
}

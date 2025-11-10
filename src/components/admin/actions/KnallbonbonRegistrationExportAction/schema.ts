
export interface Child {
  firstName: string
  lastName: string
  dateOfBirth?: string
  age?: number
  gender?: 'male' | 'female' | 'diverse' | 'noInfo'
  pickupInfo?: 'pickedUp' | 'goesAlone'
  photoConsent?: boolean
  healthInfo?: string
}

export interface ChildWithParent extends Child {
  parentName: string
  parentPhone?: string
  parentEmail: string
  parentAddress?: string
  parentPostcode?: string
  parentCity?: string
}

export interface Event {
  id: string
  title?: string
  date?: string
}

export interface Registration {
  id: string
  event:
  | {
    id: string
    title?: string
    date?: string
  }
  | string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  child: Child[]
  createdAt: string
  updatedAt: string
}

export interface ExportResult {
  success: boolean
  data?: Registration[]
  error?: string
}

export interface EventsResult {
  success: boolean
  data?: Event[]
  error?: string
}

export const pickupLabels = {
  pickedUp: 'Wird abgeholt',
  goesAlone: 'Darf alleine nach Hause gehen',
} as const

export const genderLabels = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
} as const

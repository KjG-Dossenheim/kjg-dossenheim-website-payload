import { z } from 'zod'

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Männlich' },
  { value: 'female', label: 'Weiblich' },
  { value: 'diverse', label: 'Divers' },
  { value: 'noInfo', label: 'Keine Angabe' },
] as const

export const PICKUP_OPTIONS = [
  { value: 'pickedUp', label: 'Wird abgeholt' },
  { value: 'goesAlone', label: 'Darf alleine nach Hause gehen' },
] as const

export const childSchema = z.object({
  firstName: z.string().min(2, 'Bitte geben Sie den Vornamen des Kindes ein.'),
  lastName: z.string().min(2, 'Bitte geben Sie den Nachnamen des Kindes ein.'),
  dateOfBirth: z.string().min(10, 'Bitte geben Sie das Geburtsdatum des Kindes ein.'),
  photoConsent: z.boolean(),
  gender: z.enum(['male', 'female', 'diverse', 'noInfo'], {
    error: 'Bitte wählen Sie eine gültige Option aus.',
  }),
  pickupInfo: z.enum(['pickedUp', 'goesAlone'], {
    error: 'Bitte wählen Sie eine gültige Abholoption aus.',
  }),
  healthInfo: z
    .string()
    .max(500, 'Bitte geben Sie die Gesundheitsinformationen des Kindes ein.'),
})

export const formSchema = z.object({
  firstName: z.string().min(2, 'Bitte geben Sie Ihren Vornamen ein.'),
  lastName: z.string().min(2, 'Bitte geben Sie Ihren Nachnamen ein.'),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z.e164('Bitte geben Sie eine gültige Telefonnummer ein.'),
  event: z.string().min(1, 'Bitte wählen Sie eine Veranstaltung aus.'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  child: z.array(childSchema),
  captchaToken: z.string().min(1, 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'),
})

export type EventOption = {
  id: string
  title: string
  dateLabel: string
  date?: string
  isFull: boolean
  freeSpots: number
  maxParticipants?: number
  allowWaitlist?: boolean
  minAge?: number
  maxAge?: number
}

export type FormValues = z.infer<typeof formSchema>

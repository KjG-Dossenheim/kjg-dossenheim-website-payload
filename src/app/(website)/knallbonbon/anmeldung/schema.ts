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
  gender: z.enum(['male', 'female', 'diverse', 'noInfo']),
  pickupInfo: z.enum(['pickedUp', 'goesAlone']).optional(),
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
  child: z.array(childSchema),
  captchaToken: z.string().min(1, 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'),
})

export type FormValues = z.infer<typeof formSchema>

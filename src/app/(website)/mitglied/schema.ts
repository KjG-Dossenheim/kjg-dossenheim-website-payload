import { z } from 'zod'

// Schema für das Mitgliedsantragsformular
export const formSchema = z.object({
  firstName: z.string().min(2, 'Bitte geben Sie Ihren Vornamen ein.'),
  lastName: z.string().min(2, 'Bitte geben Sie Ihren Nachnamen ein.'),
  birthDate: z.string().min(1, 'Bitte geben Sie Ihr Geburtsdatum ein.'),
  address: z.string().min(2, 'Bitte geben Sie Ihre Adresse ein.'),
  city: z.string().min(1, 'Bitte geben Sie Ihre Stadt ein.'),
  postalCode: z.string().min(1, 'Bitte geben Sie Ihre Postleitzahl ein.'),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z.string().optional(),
  status: z.enum(['new', 'in_review', 'completed', 'rejected']),
  notes: z.string().optional(),
  captchaToken: z.string().min(1, 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'),
  consentToDataProcessing: z.boolean().refine((val) => val, {
    message: 'Bitte stimmen Sie der Datenverarbeitung zu.',
  }),
})

export type FormValues = z.infer<typeof formSchema>

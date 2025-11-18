import { z } from 'zod'

// Schema for feedback form
export const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.').optional().or(z.literal('')),
  rating: z.number().min(1, 'Bitte wählen Sie eine Bewertung.').max(5),
  category: z.enum(['general', 'website', 'event', 'service', 'other']).optional(),
  message: z.string().min(10, 'Bitte geben Sie mindestens 10 Zeichen ein.'),
  captchaToken: z.string().min(1, 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'),
})

export type FormValues = z.infer<typeof formSchema>

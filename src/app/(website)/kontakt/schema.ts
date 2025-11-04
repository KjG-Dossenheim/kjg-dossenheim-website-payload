import { z } from 'zod'

export const formSchema = z.object({
  firstName: z.string().min(2, 'Bitte geben Sie Ihren Vornamen ein.'),
  lastName: z.string().min(2, 'Bitte geben Sie Ihren Nachnamen ein.'),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z.string().optional(),
  message: z.string().min(2, 'Bitte geben Sie eine Nachricht ein.'),
  captchaToken: z.string().min(1, 'Bitte bestätigen Sie, dass Sie kein Roboter sind.'),
})

export type FormValues = z.infer<typeof formSchema>

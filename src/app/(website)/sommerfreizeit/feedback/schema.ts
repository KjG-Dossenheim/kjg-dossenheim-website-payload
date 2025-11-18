import { z } from 'zod'

export const feedbackFormSchema = z.object({
  age: z.number().min(6, 'Alter muss mindestens 6 sein').max(99, 'Bitte gib ein gültiges Alter ein'),
  rating: z.number().min(1, 'Bitte wähle eine Bewertung').max(5),
  comments: z.string().optional(),
})

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>

'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { feedbackFormSchema, type FeedbackFormData } from './schema'

export async function submitFeedback(data: FeedbackFormData) {
  try {
    // Validate the data
    const validatedData = feedbackFormSchema.parse(data)

    // Get Payload instance
    const payload = await getPayload({ config })

    // Create the feedback entry
    await payload.create({
      collection: 'sommerfreizeitFeedback',
      data: {
        age: validatedData.age,
        rating: validatedData.rating,
        comments: validatedData.comments || '',
      },
    })

    return { success: true, message: 'Vielen Dank für dein Feedback!' }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return {
      success: false,
      message: 'Es gab einen Fehler beim Senden deines Feedbacks. Bitte versuche es erneut.',
    }
  }
}

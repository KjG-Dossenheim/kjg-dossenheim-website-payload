'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Feedback } from '@/payload-types'
import { verifyCaptchaToken } from '@/utilities/verifyCaptcha'

type FeedbackData = Omit<Feedback, 'id' | 'updatedAt' | 'createdAt' | 'status'> & {
  captchaToken: string
}

export async function createFeedback(data: FeedbackData) {
  try {
    // Verify captcha token
    const isValidCaptcha = await verifyCaptchaToken(data.captchaToken)
    if (!isValidCaptcha) {
      return { success: false, error: 'Captcha-Validierung fehlgeschlagen.' }
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Create the feedback using Payload SDK
    const result = await payload.create({
      collection: 'feedback',
      data: {
        name: data.name || undefined,
        email: data.email || undefined,
        rating: data.rating,
        category: data.category,
        message: data.message,
        status: 'new',
      },
      overrideAccess: false,
    })

    if (result.id) {
      return { success: true, data: result }
    } else {
      return { success: false, error: 'Fehler beim Erstellen des Feedbacks.' }
    }
  } catch (error) {
    console.error('Error creating feedback:', error)
    return {
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    }
  }
}

'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Feedback } from '@/payload-types'

type FeedbackData = Omit<Feedback, 'id' | 'updatedAt' | 'createdAt' | 'status'> & {
  captchaToken: string
}

export async function createFeedback(data: FeedbackData) {
  try {
    // Validate captcha token
    if (!data.captchaToken) {
      return { success: false, error: 'Captcha-Validierung fehlgeschlagen.' }
    }

    // Verify the captcha token server-side
    try {
      const captchaResult = await fetch(`${process.env.NEXT_PUBLIC_CAPTCHA_URL}validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.captchaToken,
          keepToken: true
        })
      })

      if (!captchaResult.ok) {
        console.error('CAPTCHA validation failed with status:', captchaResult.status)
        const text = await captchaResult.text()
        console.error('Response body:', text)
        return { success: false, error: 'Captcha-Validierung fehlgeschlagen.' }
      }

      const validation = await captchaResult.json()
      console.log('CAPTCHA validation result:', validation)

      // Check if validation was successful
      if (!validation.success) {
        return { success: false, error: 'Captcha-Validierung fehlgeschlagen.' }
      }
    } catch (captchaError) {
      console.error('CAPTCHA validation error:', captchaError)
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

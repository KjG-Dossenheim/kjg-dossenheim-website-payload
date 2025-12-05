'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

import { formSchema } from './schema'

type VerificationResponse = {
  success: boolean
}

async function verifyCaptchaToken(token: string): Promise<boolean> {

  if (!token) {
    return false
  }

  try {
    const captchaUrl = process.env.NEXT_PUBLIC_CAPTCHA_URL
    if (!captchaUrl) {
      console.error('CAPTCHA_URL is not configured')
      return false
    }

    const response = await fetch(`${captchaUrl}validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        keepToken: false,
      }),
    })

    if (!response.ok) {
      console.error('Captcha verification failed with status:', response.status)
      return false
    }

    const result = (await response.json()) as VerificationResponse
    return Boolean(result?.success)
  } catch (error) {
    console.error('Captcha verification error:', error)
    return false
  }
}

export async function submitKnallbonbonRegistration(formData: unknown) {
  try {
    const parsed = formSchema.safeParse(formData)

    if (!parsed.success) {
      return {
        success: false,
        error: 'validation-error',
        message: 'Bitte prüfen Sie Ihre Eingaben.',
        issues: parsed.error.flatten(),
      }
    }

    const { captchaToken, ...formValues } = parsed.data
    const isValidCaptcha = await verifyCaptchaToken(captchaToken)

    if (!isValidCaptcha) {
      return {
        success: false,
        error: 'invalid-captcha',
        message: 'Bitte bestätigen Sie die Captcha-Prüfung erneut.',
      }
    }

    const payloadClient = await getPayload({ config })

    // Fetch event details to get the event title and check availability
    const event = await payloadClient.findByID({
      collection: 'knallbonbonEvents',
      id: formValues.event,
    })

    // Calculate total children in this registration
    const childrenCount = formValues.child?.length || 0

    // Determine if this registration should be on the waitlist
    let isWaitlist = false
    if (event.maxParticipants) {
      const currentCount = event.participantCount || 0
      const availableSpots = event.maxParticipants - currentCount

      // If there aren't enough spots for all children, put on waitlist
      if (availableSpots < childrenCount) {
        isWaitlist = true
      }
    }

    await payloadClient.create({
      collection: 'knallbonbonRegistration',
      data: {
        ...formValues,
        isWaitlist,
      },
    })

    // Queue email sending job to run asynchronously
    // This improves response time and handles email failures gracefully
    await payloadClient.jobs.queue({
      task: 'sendRegistrationEmails',
      input: {
        formValues,
        eventTitle: event.title,
        isWaitlist,
      },
    })

    return { success: true, isWaitlist }
  } catch (error) {
    console.error('Unexpected error while submitting registration:', error)
    return {
      success: false,
      error: 'server-error',
      message: 'Fehler beim Verarbeiten der Anmeldung.',
    }
  }
}

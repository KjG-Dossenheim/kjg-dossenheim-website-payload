'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { MembershipApplication } from '@/payload-types'

type MembershipApplicationData = MembershipApplication & {
  captchaToken: string
}

export async function createMembershipApplication(data: MembershipApplicationData) {
  try {
    // Validate captcha token
    if (!data.captchaToken) {
      return { success: false, error: 'Captcha-Validierung fehlgeschlagen.' }
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Create the membership application using Payload SDK
    const result = await payload.create({
      collection: 'membershipApplication',
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        email: data.email,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
        consentToDataProcessing: data.consentToDataProcessing,
      },
    })

    if (result.id) {
      return { success: true, data: result }
    } else {
      return { success: false, error: 'Fehler beim Erstellen des Antrags.' }
    }
  } catch (error) {
    console.error('Error creating membership application:', error)
    return {
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    }
  }
}

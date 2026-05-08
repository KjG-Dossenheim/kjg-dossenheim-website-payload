'use server'

import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { normalizeSommerfreizeitEmail } from '@/utilities/sommerfreizeitAccount'

const checkEmailSchema = z.object({
  email: z.string().trim().email('Bitte gib eine gueltige E-Mail-Adresse ein.'),
})

type CheckEmailResult = {
  success: boolean
  exists: boolean
  message?: string
}

export async function checkSommerfreizeitUserEmailAction(email: string): Promise<CheckEmailResult> {
  const validationResult = checkEmailSchema.safeParse({ email })

  if (!validationResult.success) {
    return {
      success: false,
      exists: false,
      message: validationResult.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Angaben.',
    }
  }

  try {
    const payload = await getPayload({ config })
    const normalizedEmail = normalizeSommerfreizeitEmail(validationResult.data.email)
    const result = await payload.find({
      collection: 'sommerfreizeitUsers',
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    return {
      success: true,
      exists: result.docs.length > 0,
    }
  } catch {
    return {
      success: false,
      exists: false,
      message: 'E-Mail-Adresse konnte nicht geprueft werden. Bitte versuche es erneut.',
    }
  }
}

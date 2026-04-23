'use server'

import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  ensureSommerfreizeitUser,
  findSommerfreizeitUserByEmail,
  normalizeSommerfreizeitEmail,
} from '@/utilities/sommerfreizeitAccount'

const checkEmailSchema = z.object({
  email: z.string().trim().email('Bitte gib eine gueltige E-Mail-Adresse ein.'),
})

type CheckEmailResult = {
  success: boolean
  exists: boolean
  message?: string
}

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
  email: z.string().trim().email('Bitte gib eine gueltige E-Mail-Adresse ein.'),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Adresse ist erforderlich.'),
  postalCode: z.string().trim().min(1, 'Postleitzahl ist erforderlich.'),
  city: z.string().trim().min(1, 'Ort ist erforderlich.'),
})

export type RegisterSommerfreizeitUserInput = z.infer<typeof registerSchema>

type RegisterSommerfreizeitUserResult = {
  success: boolean
  message: string
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
    const result = await payload.find({
      collection: 'sommerfreizeitUsers',
      where: {
        email: {
          equals: validationResult.data.email,
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

export async function registerSommerfreizeitUserAction(
  input: RegisterSommerfreizeitUserInput,
): Promise<RegisterSommerfreizeitUserResult> {
  const validationResult = registerSchema.safeParse(input)

  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Angaben.',
    }
  }

  try {
    const payload = await getPayload({ config })
    const normalizedEmail = normalizeSommerfreizeitEmail(validationResult.data.email)
    const existingUser = await findSommerfreizeitUserByEmail(payload, normalizedEmail)

    if (existingUser) {
      return {
        success: false,
        message: 'Fuer diese E-Mail-Adresse existiert bereits ein Konto.',
      }
    }

    await ensureSommerfreizeitUser(payload, validationResult.data)

    return {
      success: true,
      message: 'Dein Konto wurde erstellt.',
    }
  } catch {
    return {
      success: false,
      message: 'Konto konnte nicht erstellt werden. Bitte versuche es erneut.',
    }
  }
}

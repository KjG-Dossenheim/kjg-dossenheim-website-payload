'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers.js'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import {
  updateAccountSchema,
  createChildSchema,
} from '@/utilities/validation/sommerfreizeit'
import type {
  UpdateAccountInput,
  CreateChildInput,
} from '@/utilities/validation/sommerfreizeit'
import type { SommerfreizeitChild } from '@/payload-types'

type UpdateAccountResult = {
  success: boolean
  message: string
}

type CreateChildResult = {
  success: boolean
  message: string
  child?: Pick<
    SommerfreizeitChild,
    'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'createdAt'
  >
}

export type UpdateChildInput = CreateChildInput

type UpdateChildResult = {
  success: boolean
  message: string
}

type DeleteChildResult = {
  success: boolean
  message: string
}

export async function updateAccountAction(data: UpdateAccountInput): Promise<UpdateAccountResult> {
  try {
    const validatedData = updateAccountSchema.parse(data)

    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const user = await getSommerfreizeitSessionUser(payload, headers)

    if (!user) {
      return {
        success: false,
        message: 'Nicht autorisiert. Bitte erneut anmelden.',
      }
    }

    await payload.update({
      collection: 'sommerfreizeitUsers',
      id: user.id,
      overrideAccess: true, // User verified via getSommerfreizeitSessionUser above
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        postalCode: validatedData.postalCode || null,
        city: validatedData.city || null,
      },
    })

    revalidatePath('/sommerfreizeit/account')

    return {
      success: true,
      message: 'Dein Konto wurde erfolgreich aktualisiert.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMessage = error.issues[0]?.message ?? 'Bitte überprüfe deine Eingaben.'
      return {
        success: false,
        message: firstMessage,
      }
    }

    return {
      success: false,
      message: 'Beim Speichern ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}

export async function createChildAction(data: CreateChildInput): Promise<CreateChildResult> {
  const validationResult = createChildSchema.safeParse(data)

  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Angaben.',
    }
  }

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const user = await getSommerfreizeitSessionUser(payload, headers)

    if (!user) {
      return {
        success: false,
        message: 'Nicht autorisiert. Bitte erneut anmelden.',
      }
    }

    const childData = {
      parent: user.id,
      firstName: validationResult.data.firstName,
      lastName: validationResult.data.lastName,
      dateOfBirth: validationResult.data.dateOfBirth,
      gender: validationResult.data.gender,
    } satisfies Omit<SommerfreizeitChild, 'id' | 'anmeldungen' | 'updatedAt' | 'createdAt'>

    const child = await payload.create({
      collection: 'sommerfreizeitChild',
      data: childData,
      overrideAccess: true, // User verified via getSommerfreizeitSessionUser above
      draft: false,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
      },
    })

    revalidatePath('/sommerfreizeit/account')

    return {
      success: true,
      message: 'Kind wurde erfolgreich hinzugefuegt.',
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        createdAt: child.createdAt,
      },
    }
  } catch {
    return {
      success: false,
      message: 'Beim Hinzufuegen des Kindes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}
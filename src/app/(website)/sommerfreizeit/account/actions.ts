'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers.js'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import type { SommerfreizeitChild, SommerfreizeitUser } from '@/payload-types'

const updateAccountSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
    lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    city: z.string().trim().optional(),
  })

export type UpdateAccountInput = Pick<SommerfreizeitUser, 'firstName' | 'lastName'> & {
  phone?: string
  address?: string
  postalCode?: string
  city?: string
}

type UpdateAccountResult = {
  success: boolean
  message: string
}

export type CreateChildInput = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender?: SommerfreizeitChild['gender'] | undefined
}

const createChildSchema: z.ZodType<CreateChildInput> = z.object({
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
  dateOfBirth: z.string().trim().min(1, 'Geburtsdatum ist erforderlich.'),
  gender: z
    .enum(['male', 'female', 'diverse'], {
      error: 'Geschlecht ist erforderlich.',
    })
    .optional(),
})

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

export async function updateChildAction(
  childId: string,
  data: UpdateChildInput,
): Promise<UpdateChildResult> {
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

    const child = await payload.findByID({
      collection: 'sommerfreizeitChild',
      id: childId,
      draft: false,
      select: {
        id: true,
        parent: true,
      },
    })

    const parentId = typeof child.parent === 'string' ? child.parent : child.parent?.id

    if (!parentId || parentId !== user.id) {
      return {
        success: false,
        message: 'Du kannst nur eigene Kinder bearbeiten.',
      }
    }

    const childData = {
      firstName: validationResult.data.firstName,
      lastName: validationResult.data.lastName,
      dateOfBirth: validationResult.data.dateOfBirth,
      gender: validationResult.data.gender,
      _status: 'published',
    } satisfies Partial<
      Omit<SommerfreizeitChild, 'id' | 'parent' | 'anmeldungen' | 'updatedAt' | 'createdAt'>
    >

    await payload.update({
      collection: 'sommerfreizeitChild',
      id: child.id,
      data: childData,
    })

    revalidatePath('/sommerfreizeit/account')
    revalidatePath('/sommerfreizeit/anmeldung')
    revalidatePath(`/sommerfreizeit/account/kinder/${childId}`)

    return {
      success: true,
      message: 'Kind wurde erfolgreich aktualisiert.',
    }
  } catch {
    return {
      success: false,
      message: 'Beim Speichern ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}

export async function deleteChildAction(childId: string): Promise<DeleteChildResult> {
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

    const child = await payload.findByID({
      collection: 'sommerfreizeitChild',
      id: childId,
      depth: 0,
      select: {
        id: true,
        parent: true,
      },
    })

    const parentId = typeof child.parent === 'string' ? child.parent : child.parent?.id

    if (!parentId || parentId !== user.id) {
      return {
        success: false,
        message: 'Du kannst nur eigene Kinder loeschen.',
      }
    }

    await payload.update({
      collection: 'sommerfreizeitChild',
      id: child.id,
      data: {
        archived: true,
      },
    })

    revalidatePath('/sommerfreizeit/account')
    revalidatePath('/sommerfreizeit/anmeldung')
    revalidatePath(`/sommerfreizeit/account/kinder/${childId}`)

    return {
      success: true,
      message: 'Kind wurde erfolgreich archiviert.',
    }
  } catch {
    return {
      success: false,
      message: 'Beim Loeschen ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}
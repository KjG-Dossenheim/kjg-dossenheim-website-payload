'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers.js'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import {
  updateAnmeldungSchema,
} from '@/utilities/validation/sommerfreizeit'
import type {
  UpdateAnmeldungInput,
} from '@/utilities/validation/sommerfreizeit'

type UpdateAnmeldungResult = {
  success: boolean
  message: string
}

export async function updateAnmeldungAction(
  anmeldungId: string,
  data: UpdateAnmeldungInput,
): Promise<UpdateAnmeldungResult> {
  const validationResult = updateAnmeldungSchema.safeParse(data)

  if (!validationResult.success) {
    const firstMessage =
      validationResult.error.issues[0]?.message ?? 'Bitte überprüfe deine Eingaben.'
    return { success: false, message: firstMessage }
  }

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const user = await getSommerfreizeitSessionUser(payload, headers)

    if (!user) {
      return { success: false, message: 'Nicht autorisiert. Bitte erneut anmelden.' }
    }

    // Fetch the anmeldung to verify ownership
    const anmeldung = await payload.findByID({
      collection: 'sommerfreizeitAnmeldung',
      id: anmeldungId,
      depth: 0,
      select: { id: true, account: true },
    })

    const accountId =
      typeof anmeldung.account === 'string' ? anmeldung.account : anmeldung.account?.id

    if (!accountId || accountId !== user.id) {
      return { success: false, message: 'Du kannst nur eigene Anmeldungen bearbeiten.' }
    }

    const { success: _zodSuccess, data: validatedData } = validationResult

    await payload.update({
      collection: 'sommerfreizeitAnmeldung',
      id: anmeldungId,
      overrideAccess: true, // User and ownership verified above
      data: {
        krankenversicherung: validatedData.krankenversicherung,
        krankenversicherungArt: validatedData.krankenversicherungArt,
        krankenversicherungNummer: validatedData.krankenversicherungNummer || null,
        krankenkassenKarte: validatedData.krankenkassenKarte ?? false,
        impfpass: validatedData.impfpass ?? false,
        foodAllergies: validatedData.foodAllergies || null,
        foodPreferences: validatedData.foodPreferences ?? 'none',
        otherAllergies: validatedData.otherAllergies || null,
        medicalConditions: validatedData.medicalConditions || null,
        medikamente: validatedData.medikamente || null,
        arzt: validatedData.arzt,
        arztTelefon: validatedData.arztTelefon,
        hausarztmodell: validatedData.hausarztmodell ?? false,
        schwimmer: validatedData.schwimmer ?? false,
        schwimmabzeichen: validatedData.schwimmabzeichen ?? null,
        bemerkungen: validatedData.bemerkungen || null,
        zimmerwunsch: (validatedData.zimmerwunsch ?? []).map((zw) => ({
          firstName: zw.firstName,
          lastName: zw.lastName || null,
        })),
      },
      context: { skipChildAnmeldungSync: true },
    })

    revalidatePath('/sommerfreizeit/account')
    revalidatePath(`/sommerfreizeit/account/sommerfreizeitAnmeldung/${anmeldungId}/edit`)

    return { success: true, message: 'Anmeldung wurde erfolgreich aktualisiert.' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMessage = error.issues[0]?.message ?? 'Bitte überprüfe deine Eingaben.'
      return { success: false, message: firstMessage }
    }

    return {
      success: false,
      message: 'Beim Speichern ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}

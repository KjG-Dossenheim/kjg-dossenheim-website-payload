'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod schema matching the CheckForm JSON export shape
// ---------------------------------------------------------------------------

const zimmerwunschEntrySchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
})

const childEntrySchema = z.object({
  positionId: z.coerce.string().min(1),
  orderPosition: z.coerce.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'diverse']).nullable().optional(),
  class: z.enum(['3', '4', '5', '6', '7', '8', '9', '10']).nullable().optional(),
  krankenversicherung: z.string().optional(),
  krankenversicherungArt: z.enum(['gesetzlich', 'privat']).nullable().optional(),
  krankenversicherungNummer: z.string().optional(),
  krankenkassenKarte: z.boolean().optional(),
  foodAllergies: z.string().optional(),
  foodPreferences: z.enum(['none', 'vegetarisch', 'vegan']).nullable().optional(),
  otherAllergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medikamente: z.string().optional(),
  arzt: z.string().optional(),
  arztTelefon: z.string().optional(),
  hausarztmodell: z.boolean().optional(),
  schwimmer: z.boolean().optional(),
  schwimmabzeichen: z
    .enum(['seepferdchen', 'bronze', 'silber', 'gold'])
    .nullable()
    .optional(),
  bemerkungen: z.string().optional(),
  impfpass: z.boolean().optional(),
  zimmerwunsch: z.array(zimmerwunschEntrySchema).optional(),
  agbAkzeptiert: z.boolean().optional(),
  datenschutzAkzeptiert: z.boolean().optional(),
  bildrechteAkzeptiert: z.boolean().optional(),
  bildrechte: z.array(z.enum(['public', 'internal'])).optional(),
})

const contactSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
})

const importJsonSchema = z.object({
  orderCode: z.string().min(1),
  pretixOrderID: z.string().min(1),
  pretixEvent: z.string().min(1),
  contact: contactSchema.optional(),
  children: z.array(childEntrySchema).min(1),
})

type ImportJsonInput = z.infer<typeof importJsonSchema>

export type ImportResult = {
  success: boolean
  message: string
  childrenCreated: number
  childrenUpdated: number
  anmeldungenCreated: number
  anmeldungenUpdated: number
  contactUpdated: boolean
  errors: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** Boolean-specific merge: only upgrade false→true, never downgrade true→false. */
function mergeBool(existing: boolean | null | undefined, incoming: boolean | null | undefined): boolean {
  if (existing === true) return true
  if (incoming === true) return true
  return existing ?? incoming ?? false
}

function mergeStringArray(
  existing: string[] | null | undefined,
  incoming: string[] | null | undefined,
): string[] {
  if (existing && existing.length > 0) return existing
  return incoming ?? []
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function importCheckFormJson(jsonString: string): Promise<ImportResult> {
  const errors: string[] = []

  // --- Parse ---
  let parsed: ImportJsonInput
  try {
    const raw = JSON.parse(jsonString)
    const result = importJsonSchema.safeParse(raw)
    if (!result.success) {
      return {
        success: false,
        message: 'Ungültiges JSON-Format.',
        childrenCreated: 0,
        childrenUpdated: 0,
        anmeldungenCreated: 0,
        anmeldungenUpdated: 0,
        contactUpdated: false,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      }
    }
    parsed = result.data
  } catch {
    return {
      success: false,
      message: 'Die Datei enthält kein gültiges JSON.',
      childrenCreated: 0,
      childrenUpdated: 0,
      anmeldungenCreated: 0,
      anmeldungenUpdated: 0,
      contactUpdated: false,
      errors: ['JSON.parse fehlgeschlagen'],
    }
  }

  const payload = await getPayload({ config })

  // --- Resolve order & user context ---
  let userId: string
  let eventId: string

  const orderResult = await payload.find({
    collection: 'sommerfreizeitOrders',
    where: { orderCode: { equals: parsed.orderCode } },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  const order = orderResult.docs[0]

  if (order && order.email) {
    eventId =
      typeof order.event === 'string'
        ? order.event
        : (order.event as unknown as { id?: string })?.id ?? parsed.pretixEvent

    // Find user by order email
    const userResult = await payload.find({
      collection: 'sommerfreizeitUsers',
      where: { email: { equals: order.email } },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    const user = userResult.docs[0]
    if (!user || !user.id) {
      return {
        success: false,
        message: `Kein Benutzerkonto für ${order.email} gefunden. Bitte zuerst das Konto anlegen.`,
        childrenCreated: 0,
        childrenUpdated: 0,
        anmeldungenCreated: 0,
        anmeldungenUpdated: 0,
        contactUpdated: false,
        errors: [`Benutzer mit E-Mail ${order.email} nicht gefunden`],
      }
    }
    userId = user.id as string
  } else {
    // Fallback: try to find an existing Anmeldung to resolve user & event
    const existingAnmeldungResult = await payload.find({
      collection: 'sommerfreizeitAnmeldung',
      where: { pretixOrderCode: { equals: parsed.orderCode } },
      limit: 1,
      depth: 1,
      pagination: false,
    })

    const existingAnmeldung = existingAnmeldungResult.docs[0]

    if (!existingAnmeldung) {
      return {
        success: false,
        message:
          'Die Bestellung wurde nicht in Payload gefunden. Bitte importiere zuerst die Pretix-Bestellungen.',
        childrenCreated: 0,
        childrenUpdated: 0,
        anmeldungenCreated: 0,
        anmeldungenUpdated: 0,
        contactUpdated: false,
        errors: [`Bestellung ${parsed.orderCode} nicht in sommerfreizeitOrders oder sommerfreizeitAnmeldung gefunden`],
      }
    }

    const account = existingAnmeldung.account
    if (typeof account === 'string') {
      userId = account
    } else if (account && typeof account === 'object' && 'id' in account) {
      userId = account.id as string
    } else {
      return {
        success: false,
        message: 'Anmeldung ohne verknüpftes Konto gefunden.',
        childrenCreated: 0,
        childrenUpdated: 0,
        anmeldungenCreated: 0,
        anmeldungenUpdated: 0,
        contactUpdated: false,
        errors: ['Kein Konto mit Anmeldung verknüpft'],
      }
    }

    const ev = existingAnmeldung.event
    eventId = typeof ev === 'string' ? ev : (ev as unknown as { id?: string })?.id ?? parsed.pretixEvent
  }

  // --- Update user contact (merge) ---
  let contactUpdated = false
  if (parsed.contact) {
    const userDoc = await payload.findByID({
      collection: 'sommerfreizeitUsers',
      id: userId,
      depth: 0,
    })

    const updateData: Record<string, string> = {}
    if (parsed.contact.phone && !isPresent(userDoc.phone)) {
      updateData.phone = parsed.contact.phone
    }
    if (parsed.contact.address && !isPresent(userDoc.address)) {
      updateData.address = parsed.contact.address
    }
    if (parsed.contact.postalCode && !isPresent(userDoc.postalCode)) {
      updateData.postalCode = parsed.contact.postalCode
    }
    if (parsed.contact.city && !isPresent(userDoc.city)) {
      updateData.city = parsed.contact.city
    }

    if (Object.keys(updateData).length > 0) {
      await payload.update({
        collection: 'sommerfreizeitUsers',
        id: userId,
        data: updateData,
        depth: 0,
        overrideAccess: true,
      })
      contactUpdated = true
    }
  }

  // --- Process each child ---
  let childrenCreated = 0
  let childrenUpdated = 0
  let anmeldungenCreated = 0
  let anmeldungenUpdated = 0

  for (const child of parsed.children) {
    try {
      // --- Find or create Child ---
      const existingChildResult = await payload.find({
        collection: 'sommerfreizeitChild',
        where: {
          and: [
            { parent: { equals: userId } },
            { firstName: { equals: child.firstName } },
            { lastName: { equals: child.lastName } },
          ],
        },
        limit: 1,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      })

      let childId: string

      if (existingChildResult.docs[0]) {
        childId = existingChildResult.docs[0].id as string

        // Merge missing child fields
        const childUpdate: Record<string, unknown> = {}
        const existing = existingChildResult.docs[0]

        if (child.gender && !isPresent(existing.gender)) {
          childUpdate.gender = child.gender
        }
        if (child.dateOfBirth && !isPresent(existing.dateOfBirth)) {
          childUpdate.dateOfBirth = child.dateOfBirth
        }

        if (Object.keys(childUpdate).length > 0) {
          await payload.update({
            collection: 'sommerfreizeitChild',
            id: childId,
            data: childUpdate,
            depth: 0,
            overrideAccess: true,
          })
          childrenUpdated++
        }
      } else {
        const newChild = await payload.create({
          collection: 'sommerfreizeitChild',
          draft: true,
          data: {
            parent: userId,
            firstName: child.firstName,
            lastName: child.lastName,
            dateOfBirth: child.dateOfBirth || undefined,
            gender: child.gender || undefined,
            _status: 'published',
          },
          depth: 0,
          overrideAccess: true,
        })
        childId = newChild.id as string
        childrenCreated++
      }

      // --- Find or create Anmeldung ---
      const existingAnmeldungResult = await payload.find({
        collection: 'sommerfreizeitAnmeldung',
        where: {
          and: [
            { pretixOrderCode: { equals: parsed.orderCode } },
            { pretixPositionID: { equals: child.positionId } },
          ],
        },
        limit: 1,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      })

      const existingAnmeldung = existingAnmeldungResult.docs[0]

      if (existingAnmeldung) {
        // Merge editable fields (only set if currently empty)
        const updateData: Record<string, unknown> = {}

        if (child.class && !isPresent(existingAnmeldung.class)) updateData.class = child.class
        if (child.krankenversicherung && !isPresent(existingAnmeldung.krankenversicherung))
          updateData.krankenversicherung = child.krankenversicherung
        if (child.krankenversicherungArt && !isPresent(existingAnmeldung.krankenversicherungArt))
          updateData.krankenversicherungArt = child.krankenversicherungArt
        if (child.krankenversicherungNummer && !isPresent(existingAnmeldung.krankenversicherungNummer))
          updateData.krankenversicherungNummer = child.krankenversicherungNummer
        updateData.krankenkassenKarte = mergeBool(
          existingAnmeldung.krankenkassenKarte,
          child.krankenkassenKarte ?? false,
        )
        if (child.foodAllergies && !isPresent(existingAnmeldung.foodAllergies))
          updateData.foodAllergies = child.foodAllergies
        if (
          child.foodPreferences &&
          child.foodPreferences !== 'none' &&
          !isPresent(existingAnmeldung.foodPreferences)
        )
          updateData.foodPreferences = child.foodPreferences
        if (child.otherAllergies && !isPresent(existingAnmeldung.otherAllergies))
          updateData.otherAllergies = child.otherAllergies
        if (child.medicalConditions && !isPresent(existingAnmeldung.medicalConditions))
          updateData.medicalConditions = child.medicalConditions
        if (child.medikamente && !isPresent(existingAnmeldung.medikamente))
          updateData.medikamente = child.medikamente
        if (child.arzt && !isPresent(existingAnmeldung.arzt)) updateData.arzt = child.arzt
        if (child.arztTelefon && !isPresent(existingAnmeldung.arztTelefon))
          updateData.arztTelefon = child.arztTelefon
        updateData.hausarztmodell = mergeBool(existingAnmeldung.hausarztmodell, child.hausarztmodell ?? false)
        updateData.schwimmer = mergeBool(existingAnmeldung.schwimmer, child.schwimmer ?? false)
        if (child.schwimmabzeichen && !isPresent(existingAnmeldung.schwimmabzeichen))
          updateData.schwimmabzeichen = child.schwimmabzeichen
        if (child.bemerkungen && !isPresent(existingAnmeldung.bemerkungen))
          updateData.bemerkungen = child.bemerkungen
        updateData.impfpass = mergeBool(existingAnmeldung.impfpass, child.impfpass ?? false)
        if (child.zimmerwunsch && (!existingAnmeldung.zimmerwunsch || (existingAnmeldung.zimmerwunsch as unknown[]).length === 0))
          updateData.zimmerwunsch = child.zimmerwunsch
        updateData.agbAkzeptiert = mergeBool(existingAnmeldung.agbAkzeptiert, child.agbAkzeptiert ?? false)
        updateData.datenschutzAkzeptiert = mergeBool(
          existingAnmeldung.datenschutzAkzeptiert,
          child.datenschutzAkzeptiert ?? false,
        )
        updateData.bildrechteAkzeptiert = mergeBool(
          existingAnmeldung.bildrechteAkzeptiert,
          child.bildrechteAkzeptiert ?? false,
        )
        if (child.bildrechte && child.bildrechte.length > 0) {
          const existingBildrechte = existingAnmeldung.bildrechte as string[] | null | undefined
          updateData.bildrechte = mergeStringArray(existingBildrechte, child.bildrechte)
        }

        // Link child relationship if missing
        if (
          !existingAnmeldung.child ||
          (typeof existingAnmeldung.child === 'string' && !existingAnmeldung.child)
        ) {
          updateData.child = childId
        }

        if (Object.keys(updateData).length > 0) {
          await payload.update({
            collection: 'sommerfreizeitAnmeldung',
            id: existingAnmeldung.id as string,
            data: updateData,
            depth: 0,
            overrideAccess: true,
            context: {
              skipChildAnmeldungSync: true,
              skipZimmerwunschSync: true,
              skipPretixStatusSync: true,
            },
          })
          anmeldungenUpdated++
        }
      } else {
        // Create new Anmeldung
        await payload.create({
          collection: 'sommerfreizeitAnmeldung',
          draft: true,
          data: {
            firstName: child.firstName,
            lastName: child.lastName,
            dateOfBirth: child.dateOfBirth || undefined,
            class: child.class || undefined,
            krankenversicherung: child.krankenversicherung || undefined,
            krankenversicherungArt: child.krankenversicherungArt ?? undefined,
            krankenversicherungNummer: child.krankenversicherungNummer || undefined,
            krankenkassenKarte: child.krankenkassenKarte ?? false,
            foodAllergies: child.foodAllergies || undefined,
            foodPreferences: child.foodPreferences || undefined,
            otherAllergies: child.otherAllergies || undefined,
            medicalConditions: child.medicalConditions || undefined,
            medikamente: child.medikamente || undefined,
            arzt: child.arzt || undefined,
            arztTelefon: child.arztTelefon || undefined,
            hausarztmodell: child.hausarztmodell ?? false,
            schwimmer: child.schwimmer ?? false,
            schwimmabzeichen: child.schwimmabzeichen ?? undefined,
            bemerkungen: child.bemerkungen || undefined,
            impfpass: child.impfpass ?? false,
            zimmerwunsch: child.zimmerwunsch || undefined,
            agbAkzeptiert: child.agbAkzeptiert ?? false,
            datenschutzAkzeptiert: child.datenschutzAkzeptiert ?? false,
            bildrechteAkzeptiert: child.bildrechteAkzeptiert ?? false,
            bildrechte: child.bildrechte || undefined,
            account: userId,
            event: eventId,
            child: childId,
            pretixPositionID: child.positionId,
            pretixOrderCode: parsed.orderCode,
            _status: 'published',
          },
          depth: 0,
          overrideAccess: true,
          context: {
            skipChildAnmeldungSync: true,
            skipZimmerwunschSync: true,
            skipPretixStatusSync: true,
          },
        })
        anmeldungenCreated++
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      errors.push(`Kind "${child.firstName} ${child.lastName}": ${msg}`)
    }
  }

  const totalChildren = childrenCreated + childrenUpdated
  const totalAnmeldungen = anmeldungenCreated + anmeldungenUpdated

  return {
    success: errors.length === 0,
    message: `Import abgeschlossen: ${totalChildren} Kinder (${childrenCreated} neu, ${childrenUpdated} aktualisiert), ${totalAnmeldungen} Anmeldungen (${anmeldungenCreated} neu, ${anmeldungenUpdated} aktualisiert)${contactUpdated ? ', Kontaktdaten aktualisiert' : ''}.${errors.length > 0 ? ` ${errors.length} Fehler.` : ''}`,
    childrenCreated,
    childrenUpdated,
    anmeldungenCreated,
    anmeldungenUpdated,
    contactUpdated,
    errors,
  }
}

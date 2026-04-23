'use server'

import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import {
  ensureSommerfreizeitUser,
  findSommerfreizeitUserByEmail,
  normalizeSommerfreizeitEmail,
} from '@/utilities/sommerfreizeitAccount'

const lookupOrderSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(3, 'Bitte gib einen gueltigen Bestellcode ein.')
    .max(64, 'Bitte gib einen gueltigen Bestellcode ein.'),
})

const childInputSchema = z.object({
  positionId: z.string().trim().min(1),
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
  dateOfBirth: z.string().trim().min(1, 'Geburtsdatum ist erforderlich.'),
  gender: z.enum(['male', 'female', 'diverse'], {
    error: 'Geschlecht ist erforderlich.',
  }),
  class: z.enum(['3', '4', '5', '6', '7', '8', '9', '10']).optional(),
  krankenversicherung: z.string().trim().min(1, 'Krankenversicherung ist erforderlich.'),
  krankenversicherungArt: z.enum(['gesetzlich', 'privat'], {
    error: 'Art der Krankenversicherung ist erforderlich.',
  }),
  krankenversicherungNummer: z.string().trim().min(1, 'Versichertennummer ist erforderlich.'),
  foodAllergies: z.string().trim().min(1, 'Lebensmittelallergien sind erforderlich.'),
  otherAllergies: z.string().trim().min(1, 'Sonstige Allergien sind erforderlich.'),
  medicalConditions: z.string().trim().min(1, 'Vorerkrankungen sind erforderlich.'),
  medikamente: z.string().trim().min(1, 'Medikamente sind erforderlich.'),
  arzt: z.string().trim().min(1, 'Arzt ist erforderlich.'),
  arztTelefon: z.string().trim().min(1, 'Arzt-Telefon ist erforderlich.'),
  versicherungsNummer: z.string().trim().min(1, 'Versicherungsnummer ist erforderlich.'),
  versicherungsAnbieter: z.string().trim().min(1, 'Versicherungsanbieter ist erforderlich.'),
  schwimmer: z.boolean(),
  bemerkungen: z.string().trim().optional(),
})

const completeOrderSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(3, 'Bitte gib einen gueltigen Bestellcode ein.')
    .max(64, 'Bitte gib einen gueltigen Bestellcode ein.'),
  phone: z.string().trim().min(1, 'Telefonnummer ist erforderlich.'),
  address: z.string().trim().min(1, 'Adresse ist erforderlich.'),
  postalCode: z.string().trim().min(1, 'Postleitzahl ist erforderlich.'),
  city: z.string().trim().min(1, 'Ort ist erforderlich.'),
  children: z.array(childInputSchema).min(1, 'Mindestens ein Kind ist erforderlich.'),
})

type PretixPosition = {
  id?: string | number | null
  positionid?: string | number | null
  canceled?: boolean | null
  attendee_name?: string | null
}

type PretixOrder = {
  code?: string | null
  status?: string | null
  email?: string | null
  invoice_address?: {
    name?: string | null
  } | null
  event?: string | number | null
  positions?: PretixPosition[] | null
}

type LookupOrderResult = {
  success: boolean
  message: string
  email?: string
  orderCode?: string
}

type OrderFlowView = {
  orderCode: string
  email: string
  positionCount: number
  positions: Array<{
    positionId: string
    attendeeName: string
  }>
}

type CompleteOrderResult = {
  success: boolean
  message: string
}

async function getCurrentPretixEvent() {
  const payload = await getPayload({ config })

  const landingPageData = await payload.findGlobal({
    slug: 'sommerfreizeitLandingPage',
    select: {
      freizeit: true,
    },
  })

  const eventId =
    typeof landingPageData.freizeit === 'string'
      ? landingPageData.freizeit
      : landingPageData.freizeit?.id

  if (!eventId) {
    throw new Error('Keine Sommerfreizeit ist im Landing-Global verknuepft.')
  }

  const event = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    select: {
      id: true,
      pretixEventId: true,
    },
  })

  if (!event.pretixEventId) {
    throw new Error('Die verknuepfte Sommerfreizeit hat keine Pretix Event ID.')
  }

  return {
    payload,
    event,
  }
}

function toOptionalString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function splitAttendeeName(name: string | null | undefined) {
  const trimmed = (name || '').trim()

  if (!trimmed) {
    return {
      firstName: 'Teilnehmend',
      lastName: 'Sommerfreizeit',
    }
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: 'Sommerfreizeit',
    }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

function extractPositionId(position: PretixPosition) {
  return toOptionalString(position.positionid) || toOptionalString(position.id)
}

function extractValidPositions(order: PretixOrder) {
  const positions = Array.isArray(order.positions) ? order.positions : []

  return positions
    .filter((position) => !position?.canceled)
    .map((position) => {
      const positionId = extractPositionId(position)

      if (!positionId) {
        return null
      }

      return {
        positionId,
        attendeeName: (position.attendee_name || '').trim(),
      }
    })
    .filter((value): value is { positionId: string; attendeeName: string } => !!value)
}

async function fetchPretixOrder(args: {
  baseUrl: string
  organizer: string
  event: string
  code: string
  token: string
}) {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/events/${encodeURIComponent(args.event)}/orders/${encodeURIComponent(args.code)}/`,
    args.baseUrl,
  )

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${args.token}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const bodyText = await response.text()

    if (response.status === 404) {
      throw new Error('ORDER_NOT_FOUND')
    }

    throw new Error(`Pretix API returned ${response.status}: ${bodyText}`)
  }

  return (await response.json()) as PretixOrder
}

type ResolvedOrderFlow = {
  orderCode: string
  email: string
  invoiceName: string | null
  organizer: string
  pretixEventId: string
  positions: Array<{
    positionId: string
    attendeeName: string
  }>
}

async function resolveOrderFlowFromPretix(orderCode: string): Promise<ResolvedOrderFlow> {
  const { event } = await getCurrentPretixEvent()
  const organizer = (process.env.NEXT_PUBLIC_PRETIX_ORGANIZER || '').trim()
  const token = (process.env.PRETIX_API_TOKEN || '').trim()
  const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()

  if (!organizer || !token) {
    throw new Error('PRETIX_NOT_CONFIGURED')
  }

  const normalizedCode = orderCode.trim().toUpperCase()
  const order = await fetchPretixOrder({
    baseUrl,
    organizer,
    event: event.pretixEventId,
    code: normalizedCode,
    token,
  })

  const orderStatus = (order.status || '').trim().toLowerCase()

  if (orderStatus === 'c' || orderStatus === 'e') {
    throw new Error('ORDER_NOT_ACTIVE')
  }

  const email = normalizeSommerfreizeitEmail(order.email || '')

  if (!email) {
    throw new Error('ORDER_EMAIL_MISSING')
  }

  const positions = extractValidPositions(order)

  if (positions.length === 0) {
    throw new Error('ORDER_POSITIONS_MISSING')
  }

  return {
    orderCode: normalizedCode,
    email,
    invoiceName: toOptionalString(order.invoice_address?.name),
    organizer,
    pretixEventId: event.pretixEventId,
    positions,
  }
}

async function approvePretixOrder(args: {
  baseUrl: string
  organizer: string
  event: string
  code: string
  token: string
}) {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/events/${encodeURIComponent(args.event)}/orders/${encodeURIComponent(args.code)}/approve/`,
    args.baseUrl,
  )

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${args.token}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`ORDER_APPROVE_FAILED:${response.status}:${bodyText}`)
  }
}

export async function lookupOrderAndStartFlowAction(input: { orderCode: string }): Promise<LookupOrderResult> {
  const parsedInput = lookupOrderSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      success: false,
      message: parsedInput.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Eingabe.',
    }
  }

  try {
    const payload = await getPayload({ config })
    const flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)

    const existingUser = await findSommerfreizeitUserByEmail(payload, flow.email)

    if (!existingUser) {
      const nameParts = splitAttendeeName(flow.invoiceName || flow.positions[0]?.attendeeName)

      await ensureSommerfreizeitUser(payload, {
        email: flow.email,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
      })
    }

    return {
      success: true,
      message: 'Bestellung gefunden. Wir senden dir jetzt den Magic Link.',
      email: flow.email,
      orderCode: flow.orderCode,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
      return {
        success: false,
        message: 'Bestellung nicht gefunden. Bitte pruefe deinen Bestellcode.',
      }
    }

    if (error instanceof Error && error.message === 'ORDER_NOT_ACTIVE') {
      return {
        success: false,
        message: 'Diese Bestellung kann nicht mehr abgeschlossen werden.',
      }
    }

    if (error instanceof Error && error.message === 'ORDER_EMAIL_MISSING') {
      return {
        success: false,
        message: 'Zu dieser Bestellung wurde keine E-Mail-Adresse gefunden.',
      }
    }

    if (error instanceof Error && error.message === 'ORDER_POSITIONS_MISSING') {
      return {
        success: false,
        message: 'In der Bestellung wurden keine gueltigen Positionen gefunden.',
      }
    }

    if (error instanceof Error && error.message === 'PRETIX_NOT_CONFIGURED') {
      return {
        success: false,
        message: 'Die Pretix-Konfiguration ist unvollstaendig. Bitte kontaktiere das Team.',
      }
    }

    return {
      success: false,
      message: 'Bestellung konnte nicht abgerufen werden. Bitte versuche es erneut.',
    }
  }
}

export async function getOrderFlowView(input: { orderCode: string }): Promise<OrderFlowView | null> {
  const parsedInput = lookupOrderSchema.safeParse(input)

  if (!parsedInput.success) {
    return null
  }

  let flow: ResolvedOrderFlow

  try {
    flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)
  } catch {
    return null
  }

  return {
    orderCode: flow.orderCode,
    email: flow.email,
    positionCount: flow.positions.length,
    positions: flow.positions.map((position) => ({
      positionId: position.positionId,
      attendeeName: position.attendeeName || '',
    })),
  }
}

export async function completeOrderCheckAction(input: z.infer<typeof completeOrderSchema>): Promise<CompleteOrderResult> {
  const parsedInput = completeOrderSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      success: false,
      message: parsedInput.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Angaben.',
    }
  }

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const user = await getSommerfreizeitSessionUser(payload, headers)

    if (!user) {
      return {
        success: false,
        message: 'Bitte melde dich zuerst an.',
      }
    }

    let flow: ResolvedOrderFlow

    try {
      flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)
    } catch {
      return {
        success: false,
        message: 'Die Bestellung konnte nicht mehr geladen werden. Bitte starte die Anmeldung erneut.',
      }
    }

    if (normalizeSommerfreizeitEmail(user.email) !== normalizeSommerfreizeitEmail(flow.email)) {
      return {
        success: false,
        message: 'Das eingeloggte Konto passt nicht zur Bestellung.',
      }
    }

    const allowedPositionIds = new Set(flow.positions.map((position) => position.positionId))
    const submittedPositionIds = parsedInput.data.children.map((child) => child.positionId)
    const uniquePositionIds = new Set(submittedPositionIds)

    if (uniquePositionIds.size !== submittedPositionIds.length) {
      return {
        success: false,
        message: 'Jede Position darf nur einmal angegeben werden.',
      }
    }

    for (const positionId of submittedPositionIds) {
      if (!allowedPositionIds.has(positionId)) {
        return {
          success: false,
          message: 'Eine Position aus deiner Eingabe ist ungueltig.',
        }
      }
    }

    const eventResult = await payload.find({
      collection: 'sommerfreizeitEvents',
      where: {
        pretixEventId: {
          equals: flow.pretixEventId,
        },
      },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    const event = eventResult.docs[0]

    if (!event) {
      return {
        success: false,
        message: 'Die zugehoerige Sommerfreizeit wurde nicht gefunden.',
      }
    }

    await payload.update({
      collection: 'sommerfreizeitUsers',
      id: user.id,
      data: {
        phone: parsedInput.data.phone,
        address: parsedInput.data.address,
        postalCode: parsedInput.data.postalCode,
        city: parsedInput.data.city,
      },
      depth: 0,
    })

    const defaultPricingResult = await payload.find({
      collection: 'sommerfreizeitPricing',
      where: {
        and: [
          {
            freizeit: {
              equals: event.id,
            },
          },
          {
            default: {
              equals: true,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    const defaultPricingId = defaultPricingResult.docs[0]?.id

    for (const childInput of parsedInput.data.children) {
      const existingRegistrationResult = await payload.find({
        collection: 'sommerfreizeitAnmeldung',
        where: {
          and: [
            {
              pretixOrderCode: {
                equals: flow.orderCode,
              },
            },
            {
              pretixPositionId: {
                equals: childInput.positionId,
              },
            },
          ],
        },
        limit: 1,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      })

      if (existingRegistrationResult.docs[0]) {
        continue
      }

      const child = await payload.create({
        collection: 'sommerfreizeitChild',
        data: {
          parent: user.id,
          firstName: childInput.firstName,
          lastName: childInput.lastName,
          dateOfBirth: childInput.dateOfBirth,
          gender: childInput.gender,
          pretixOrderCode: flow.orderCode,
          pretixPositionId: childInput.positionId,
        },
        depth: 0,
      })

      await payload.create({
        collection: 'sommerfreizeitAnmeldung',
        data: {
          class: childInput.class,
          krankenversicherung: childInput.krankenversicherung,
          krankenversicherungArt: childInput.krankenversicherungArt,
          krankenversicherungNummer: childInput.krankenversicherungNummer,
          foodAllergies: childInput.foodAllergies,
          otherAllergies: childInput.otherAllergies,
          medicalConditions: childInput.medicalConditions,
          medikamente: childInput.medikamente,
          arzt: childInput.arzt,
          arztTelefon: childInput.arztTelefon,
          versicherungsNummer: childInput.versicherungsNummer,
          versicherungsAnbieter: childInput.versicherungsAnbieter,
          schwimmer: childInput.schwimmer,
          bemerkungen: childInput.bemerkungen || undefined,
          account: user.id,
          event: event.id,
          child: child.id,
          pricing: defaultPricingId,
          pretixOrderCode: flow.orderCode,
          pretixPositionId: childInput.positionId,
          _status: 'published',
        },
        depth: 0,
      })
    }

    // Pretix Bestellung bestätigen
    await approvePretixOrder({
      baseUrl: process.env.NEXT_PUBLIC_PRETIX_URL!,
      organizer: process.env.NEXT_PUBLIC_PRETIX_ORGANIZER!,
      event: flow.pretixEventId,
      code: flow.orderCode,
      token: process.env.PRETIX_API_TOKEN!,
    })

    revalidatePath('/sommerfreizeit/account')
    revalidatePath('/sommerfreizeit/anmeldung')

    return {
      success: true,
      message: 'Deine Anmeldung wurde erfolgreich abgeschlossen.',
    }
  } catch {
    return {
      success: false,
      message: 'Beim Abschluss ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}

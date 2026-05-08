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
import { lookupOrderSchema, completeOrderSchema } from '@/utilities/validation/sommerfreizeitSchemas'
import { getRequiredEnv } from '@/utilities/env'

type PretixPosition = {
  id?: string | number | null
  positionid?: string | number | null
  canceled?: boolean | null
  attendee_name?: string | null
  attendee_name_parts?: Record<string, unknown> | null
}

type PretixOrder = {
  code?: string | null
  secret?: string | null
  status?: string | null
  email?: string | null
  invoice_address?: {
    name?: string | null
    name_parts?: Record<string, unknown> | null
  } | null
  event?: string | number | null
  positions?: PretixPosition[] | null
  require_approval?: boolean | null
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
  pretixEvent: string
  pretixOrderID: string
  pretixSecret: string
  positionCount: number
  invoiceFirstName: string
  invoiceLastName: string
  positions: Array<{
    positionId: string
    firstName: string
    lastName: string
    pretixOrderID: string
    pretixSecret: string
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

  const event = await payload.findByID({
    collection: 'sommerfreizeitEvents',
    id: eventId,
    select: {
      id: true,
      pretixEventId: true,
    },
  })

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

function readPretixNameParts(parts: Record<string, unknown> | null | undefined) {
  return {
    firstName: toOptionalString(parts?.given_name) ?? '',
    lastName: toOptionalString(parts?.family_name) ?? '',
  }
}

function extractPositionId(position: PretixPosition) {
  return toOptionalString(position.positionid) || toOptionalString(position.id)
}

function extractValidPositions(order: PretixOrder): Array<{
  positionId: string
  firstName: string
  lastName: string
  pretixOrderID: string
  pretixSecret: string
}> {
  const positions = Array.isArray(order.positions) ? order.positions : []
  const pretixOrderID = toOptionalString(order.code)
  const pretixSecret = toOptionalString(order.secret)

  if (!pretixOrderID || !pretixSecret) {
    return []
  }

  return positions
    .filter((position) => !position?.canceled)
    .map((position) => {
      const positionId = extractPositionId(position)

      if (!positionId) {
        return null
      }

      const nameParts = readPretixNameParts(position.attendee_name_parts)

      return {
        positionId,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        pretixOrderID,
        pretixSecret,
      }
    })
    .filter(
      (value): value is {
        positionId: string
        firstName: string
        lastName: string
        pretixOrderID: string
        pretixSecret: string
      } => !!value,
    )
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
  invoiceFirstName: string
  invoiceLastName: string
  organizer: string
  pretixEventId: string
  pretixEvent: string
  pretixOrderID: string
  pretixSecret: string
  positions: Array<{
    positionId: string
    firstName: string
    lastName: string
    pretixOrderID: string
    pretixSecret: string
  }>
  requireApproval: boolean
}

async function resolveOrderFlowFromPretix(orderCode: string): Promise<ResolvedOrderFlow> {
  const { event } = await getCurrentPretixEvent()
  let organizer: string
  let token: string

  try {
    organizer = getRequiredEnv('NEXT_PUBLIC_PRETIX_ORGANIZER')
    token = getRequiredEnv('PRETIX_API_TOKEN')
  } catch {
    throw new Error('PRETIX_NOT_CONFIGURED')
  }

  const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()

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

  const pretixEvent = toOptionalString(order.event)

  if (!pretixEvent) {
    throw new Error('ORDER_EVENT_MISSING')
  }

  const pretixSecret = toOptionalString(order.secret)

  if (!pretixSecret) {
    throw new Error('ORDER_SECRET_MISSING')
  }

  const positions = extractValidPositions(order)
  const invoiceNameParts = readPretixNameParts(order.invoice_address?.name_parts)

  if (positions.length === 0) {
    throw new Error('ORDER_POSITIONS_MISSING')
  }

  return {
    orderCode: normalizedCode,
    email,
    invoiceFirstName: invoiceNameParts.firstName,
    invoiceLastName: invoiceNameParts.lastName,
    organizer,
    pretixEventId: event.pretixEventId,
    pretixEvent,
    pretixOrderID: normalizedCode,
    pretixSecret: pretixSecret,
    positions,
    requireApproval: order.require_approval !== false,
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
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const user = await getSommerfreizeitSessionUser(payload, headers)

    if (!user) {
      return {
        success: false,
        message: 'Bitte melde dich zuerst an.',
      }
    }

    const flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)

    if (normalizeSommerfreizeitEmail(user.email) !== normalizeSommerfreizeitEmail(flow.email)) {
      return {
        success: false,
        message: 'Das eingeloggte Konto passt nicht zur Bestellung.',
      }
    }

    const existingUser = await findSommerfreizeitUserByEmail(payload, flow.email)

    if (!existingUser) {
      const nameParts =
        flow.invoiceFirstName || flow.invoiceLastName
          ? {
            firstName: flow.invoiceFirstName,
            lastName: flow.invoiceLastName,
          }
          : {
            firstName: flow.positions[0]?.firstName ?? '',
            lastName: flow.positions[0]?.lastName ?? '',
          }

      await ensureSommerfreizeitUser(payload, {
        email: flow.email,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
      })
    }

    return {
      success: true,
      message: 'Bestellung gefunden. Wir senden dir jetzt einen Bestätigungscode.',
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
    pretixEvent: flow.pretixEvent,
    pretixOrderID: flow.pretixOrderID,
    pretixSecret: flow.pretixSecret,
    positionCount: flow.positions.length,
    invoiceFirstName: flow.invoiceFirstName,
    invoiceLastName: flow.invoiceLastName,
    positions: flow.positions.map((position) => ({
      positionId: position.positionId,
      firstName: position.firstName,
      lastName: position.lastName,
      pretixOrderID: position.pretixOrderID,
      pretixSecret: position.pretixSecret,
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

    // Check if the order has already been completed in a previous attempt by looking for existing registrations for the order code
    /* if (!flow.requireApproval) {
      return {
        success: false,
        message: 'Diese Bestellung wurde bereits abgeschlossen und kann nicht erneut eingereicht werden.',
      }
    } */

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
          _status: 'published',
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
          schwimmer: childInput.schwimmer,
          bemerkungen: childInput.bemerkungen || undefined,
          account: user.id,
          event: event.id,
          child: child.id,
          pretixOrderCode: flow.orderCode,
          pretixPositionId: childInput.positionId,
          _status: 'published',
        },
        depth: 0,
      })
    }
    console.log(`Bestellung ${flow.orderCode} mit ${parsedInput.data.children.length} Kindern in Payload gespeichert.`)

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

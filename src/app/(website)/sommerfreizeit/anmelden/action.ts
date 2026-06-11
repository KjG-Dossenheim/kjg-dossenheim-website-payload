'use server'

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
import type { Payload } from 'payload'
import type { PretixOrder } from '@/types/pretixSchema'
import type { SommerfreizeitChild } from '@/payload-types'

type LookupOrderResult = {
  success: boolean
  message: string
  email?: string
  orderCode?: string
  createdAccount?: boolean
}

type OrderFlowView = {
  orderCode: string
  email: string
  pretixEvent: string
  pretixOrderID: string
  pretixSecret: string
  phone: string
  address: string
  postalCode: string
  city: string
  positionCount: number
  invoiceFirstName: string
  invoiceLastName: string
  positions: Array<{
    positionId: string
    orderPosition: string
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

function extractValidPositions(order: PretixOrder): Array<{
  positionId: string
  firstName: string
  lastName: string
  orderPosition: string
  pretixPositionID: string
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
      const nameParts = readPretixNameParts(position.attendee_name_parts)
      return {
        positionId: position.id,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        orderPosition: position.positionid,
        pretixPositionID: position.id,
        pretixOrderID,
        pretixSecret,
      }
    })
    .filter(
      (value): value is {
        positionId: string
        orderPosition: string
        firstName: string
        lastName: string
        pretixPositionID: string
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

async function updatePretixPositionAnswer(args: {
  baseUrl: string
  organizer: string
  event: string
  positionID: string
  token: string
  questionID: number
  answer: string
}) {
  try {
    const endpoint = new URL(
      `/api/v1/organizers/${encodeURIComponent(args.organizer)}/events/${encodeURIComponent(args.event)}/orderpositions/${encodeURIComponent(args.positionID)}/`,
      args.baseUrl,
    )

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Token ${args.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: [
          {
            question: args.questionID,
            answer: args.answer,
          },
        ],
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const bodyText = await response.text()
      throw new Error(`Pretix API returned ${response.status}: ${bodyText}`)
    }
  } catch (error) {
    console.error('Failed to sync answer to Pretix', {
      positionID: args.positionID,
      questionID: args.questionID,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

type ResolvedOrderFlow = {
  orderCode: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
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
    orderPosition: string
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


  const order = await fetchPretixOrder({
    baseUrl: process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu',
    organizer,
    event: event.pretixEventId,
    code: orderCode,
    token,
  })

  if (process.env.NODE_ENV !== 'development') {
    if (order.status === 'c' || order.status === 'e') {
      throw new Error('ORDER_NOT_ACTIVE')
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    if (order.require_approval === false) {
      throw new Error('ORDER_ALREADY_COMPLETED')
    }
  }

  const positions = extractValidPositions(order)
  const invoiceNameParts = readPretixNameParts(order.invoice_address?.name_parts)
  const invoiceAddress = order.invoice_address as Record<string, unknown> | null | undefined

  return {
    orderCode: orderCode,
    email: order.email,
    phone: order.phone ?? '',
    address: toOptionalString(invoiceAddress?.street) ?? '',
    postalCode: toOptionalString(invoiceAddress?.zipcode) ?? '',
    city: toOptionalString(invoiceAddress?.city) ?? '',
    invoiceFirstName: invoiceNameParts.firstName,
    invoiceLastName: invoiceNameParts.lastName,
    organizer,
    pretixEventId: event.pretixEventId,
    pretixEvent: event.id,
    pretixOrderID: orderCode,
    pretixSecret: order.secret,
    positions,
    requireApproval: order.require_approval,
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
    const sessionUser = await getSommerfreizeitSessionUser(payload, headers)

    const flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)

    // If user is logged in, verify they own this order
    if (sessionUser && normalizeSommerfreizeitEmail(sessionUser.email) !== normalizeSommerfreizeitEmail(flow.email)) {
      return {
        success: false,
        message: 'Das eingeloggte Konto passt nicht zur Bestellung.',
      }
    }

    const existingUser = await findSommerfreizeitUserByEmail(payload, flow.email)
    const accountResult = existingUser
      ? {
        created: false,
        user: existingUser,
      }
      : await ensureSommerfreizeitUser(payload, {
        email: flow.email,
        firstName: flow.invoiceFirstName || flow.positions[0]?.firstName || '',
        lastName: flow.invoiceLastName || flow.positions[0]?.lastName || '',
      })

    if (!accountResult.user) {
      return {
        success: false,
        message: 'Bestellung konnte nicht abgerufen werden. Bitte versuche es erneut.',
      }
    }

    return {
      success: true,
      message: accountResult.created
        ? 'Bestellung gefunden. Dein Konto wurde angelegt. Wir senden dir jetzt einen Bestätigungscode.'
        : 'Bestellung gefunden. Wir senden dir jetzt einen Bestätigungscode.',
      email: flow.email,
      orderCode: flow.orderCode,
      createdAccount: accountResult.created,
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
        message: 'Diese Bestellung wurde storniert.',
      }
    }

    if (error instanceof Error && error.message === 'ORDER_ALREADY_COMPLETED') {
      return {
        success: false,
        message: 'Diese Bestellung wurde bereits abgeschlossen.',
      }
    }

    console.error('lookupOrderAndStartFlowAction failed unexpectedly', {
      error: error,
      input,
    })

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
  } catch (error) {
    console.error('Failed to resolve order flow in getOrderFlowView', { error: error, orderCode: parsedInput.data.orderCode })
    return null
  }

  return {
    orderCode: flow.orderCode,
    email: flow.email,
    phone: flow.phone,
    address: flow.address,
    postalCode: flow.postalCode,
    city: flow.city,
    pretixEvent: flow.pretixEvent,
    pretixOrderID: flow.pretixOrderID,
    pretixSecret: flow.pretixSecret,
    positionCount: flow.positions.length,
    invoiceFirstName: flow.invoiceFirstName,
    invoiceLastName: flow.invoiceLastName,
    positions: flow.positions.map((position) => ({
      firstName: position.firstName,
      lastName: position.lastName,
      pretixOrderID: position.pretixOrderID,
      pretixSecret: position.pretixSecret,
      positionId: position.positionId,
      orderPosition: position.orderPosition,
    })),
  }
}

async function createChildAndRegistration(
  payload: Payload,
  userId: string,
  childInput: any,
  eventId: string,
  orderCode: string,
  pretixParams?: {
    baseUrl: string
    organizer: string
    eventId: string
    token: string
  },
) {
  // Try to find an existing child for this parent with the same name and birthdate
  async function findExistingChild(payload: Payload, parentId: string, firstName?: string, lastName?: string) {

    const result = await payload.find({
      collection: 'sommerfreizeitChild',
      where: {
        and: [
          { parent: { equals: parentId } },
          { firstName: { equals: firstName } },
          { lastName: { equals: lastName } },
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })

    return result.docs[0] ?? null
  }

  let childRecord: SommerfreizeitChild = await findExistingChild(payload, userId, childInput.firstName, childInput.lastName)

  if (childRecord) {
    payload.logger.info(`Bestehendes Kind wiederverwendet: ${childRecord.firstName} ${childRecord.lastName} (id=${childRecord.id}).`)

    // Optionally update missing fields on the existing child
    const updateData: any = {}
    if (!childRecord.gender && childInput.gender) updateData.gender = childInput.gender
    if (!childRecord.dateOfBirth && childInput.dateOfBirth) updateData.dateOfBirth = childInput.dateOfBirth

    if (Object.keys(updateData).length > 0) {
      await payload.update({
        collection: 'sommerfreizeitChild',
        id: childRecord.id,
        data: updateData,
        depth: 0,
      })
    }
  } else {
    childRecord = await payload.create({
      collection: 'sommerfreizeitChild',
      data: {
        parent: userId,
        firstName: childInput.firstName,
        lastName: childInput.lastName,
        dateOfBirth: childInput.dateOfBirth,
        gender: childInput.gender,
        _status: 'published',
      },
      depth: 0,
    })

    payload.logger.info(`Kind ${childRecord.firstName} ${childRecord.lastName} in Payload angelegt.`)
  }

  await payload.create({
    collection: 'sommerfreizeitAnmeldung',
    data: {
      firstName: childInput.firstName,
      lastName: childInput.lastName,
      dateOfBirth: childInput.dateOfBirth,
      class: childInput.class,
      krankenversicherung: childInput.krankenversicherung,
      krankenversicherungArt: childInput.krankenversicherungArt,
      krankenversicherungNummer: childInput.krankenversicherungNummer,
      krankenkassenKarte: childInput.krankenkassenKarte,
      impfpass: childInput.impfpass,
      foodAllergies: childInput.foodAllergies,
      foodPreferences: childInput.foodPreferences,
      otherAllergies: childInput.otherAllergies,
      medicalConditions: childInput.medicalConditions,
      medikamente: childInput.medikamente,
      arzt: childInput.arzt,
      arztTelefon: childInput.arztTelefon,
      hausarztmodell: childInput.hausarztmodell,
      schwimmer: childInput.schwimmer,
      schwimmabzeichen: childInput.schwimmabzeichen,
      bemerkungen: childInput.bemerkungen || undefined,
      zimmerwunsch: childInput.zimmerwunsch || undefined,
      account: userId,
      event: eventId,
      child: childRecord.id,
      pretixPositionID: childInput.positionId,
      pretixOrderCode: orderCode,
      _status: 'published',
      bildrechte: childInput.bildrechte,
      agbAkzeptiert: childInput.agbAkzeptiert,
      datenschutzAkzeptiert: childInput.datenschutzAkzeptiert,
      bildrechteAkzeptiert: childInput.bildrechteAkzeptiert,
    },
    depth: 0,
  })

  // Sync impfpass answer to Pretix
  if (pretixParams && childInput.impfpass !== undefined) {
    await updatePretixPositionAnswer({
      baseUrl: pretixParams.baseUrl,
      organizer: pretixParams.organizer,
      event: pretixParams.eventId,
      positionID: childInput.positionId,
      token: pretixParams.token,
      questionID: 14, // impfpass question ID
      answer: childInput.impfpass ? 'True' : 'False',
    })
    payload.logger.info(`impfpass synced to Pretix for position ${childInput.positionId}`)
  }
}

function verifyOwnership(sessionUser: any, flowEmail: string) {
  if (!sessionUser) return true
  return normalizeSommerfreizeitEmail(sessionUser.email) === normalizeSommerfreizeitEmail(flowEmail)
}

async function ensureUserAccount(payload: Payload, flow: ResolvedOrderFlow) {
  const existingUser = await findSommerfreizeitUserByEmail(payload, flow.email)
  if (existingUser) return existingUser

  const accountResult = await ensureSommerfreizeitUser(payload, {
    email: flow.email,
    firstName: flow.invoiceFirstName || flow.positions[0]?.firstName || '',
    lastName: flow.invoiceLastName || flow.positions[0]?.lastName || '',
  })

  return accountResult.user
}

async function updateUserContactInfo(payload: Payload, userId: string, data: { phone?: string; address?: string; postalCode?: string; city?: string }) {
  await payload.update({
    collection: 'sommerfreizeitUsers',
    id: userId,
    data: {
      phone: data.phone,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
    },
    depth: 0,
  })
}

async function hasExistingRegistration(payload: Payload, orderCode: string, positionId: string) {
  const existingRegistrationResult = await payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      and: [
        {
          pretixOrderCode: {
            equals: orderCode,
          },
        },
        {
          pretixPositionID: {
            equals: positionId,
          },
        },
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  return !!existingRegistrationResult.docs[0]
}

export async function completeOrderCheckAction(input: z.infer<typeof completeOrderSchema>): Promise<CompleteOrderResult> {
  const parsedInput = completeOrderSchema.safeParse(input)

  if (!parsedInput.success) {
    console.error('Invalid input in completeOrderCheckAction', {
      errors: parsedInput.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
        expected: 'expected' in issue ? issue.expected : undefined,
      })),
      input: {
        orderCode: input.orderCode,
        childrenCount: input.children?.length,
      },
    })
    return {
      success: false,
      message: parsedInput.error.issues[0]?.message ?? 'Bitte ueberpruefe deine Angaben.',
    }
  }

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const sessionUser = await getSommerfreizeitSessionUser(payload, headers)

    let flow: ResolvedOrderFlow

    try {
      flow = await resolveOrderFlowFromPretix(parsedInput.data.orderCode)
    } catch (error) {

      console.error('Failed to resolve order flow in completeOrderCheckAction', {
        error: error,
        orderCode: parsedInput.data.orderCode,
      })

      return {
        success: false,
        message: 'Die Bestellung konnte nicht mehr geladen werden. Bitte starte die Anmeldung erneut.',
      }
    }

    // If user is logged in, verify they own this order
    if (!verifyOwnership(sessionUser, flow.email)) {
      return {
        success: false,
        message: 'Das eingeloggte Konto passt nicht zur Bestellung.',
      }
    }

    const user = sessionUser || (await ensureUserAccount(payload, flow))

    if (!user) {
      return {
        success: false,
        message: 'Bestellung konnte nicht abgerufen werden. Bitte versuche es erneut.',
      }
    }

    // Check if the order has already been completed in a previous attempt by looking for existing registrations for the order code
    if (process.env.NODE_ENV !== 'development') {
      if (!flow.requireApproval) {
        return {
          success: false,
          message: 'Diese Bestellung wurde bereits abgeschlossen und kann nicht erneut eingereicht werden.',
        }
      }
    }

    /* const allowedPositionIds = new Set(flow.positions.map((position) => position.id))
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
          message: 'Eine Position aus deiner Eingabe ist ungültig.',
        }
      }
    } */

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

    await updateUserContactInfo(payload, user.id, {
      phone: parsedInput.data.phone,
      address: parsedInput.data.address,
      postalCode: parsedInput.data.postalCode,
      city: parsedInput.data.city,
    })

    const pretixParams = {
      baseUrl: process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu',
      organizer: flow.organizer,
      eventId: flow.pretixEventId,
      token: getRequiredEnv('PRETIX_API_TOKEN'),
    }

    for (const childInput of parsedInput.data.children) {
      if (await hasExistingRegistration(payload, flow.orderCode, childInput.positionId)) {
        continue
      }

      await createChildAndRegistration(payload, user.id, childInput, event.id, flow.orderCode, pretixParams)
    }
    payload.logger.info(`Bestellung ${flow.orderCode} mit ${parsedInput.data.children.length} Kindern in Payload gespeichert.`)

    return {
      success: true,
      message: 'Deine Anmeldung wurde erfolgreich abgeschlossen.',
    }
  } catch (error) {

    console.error('completeOrderCheckAction failed unexpectedly', {
      error: error,
      input,
    })

    return {
      success: false,
      message: 'Beim Abschluss ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    }
  }
}

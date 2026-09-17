import type { Payload } from 'payload'
import type { PretixOrder } from '@/types/pretixSchema'
import { splitStreetAndHouseNumber } from '@/utilities/address'
import { normalizeOrderCode } from '@/utilities/pretix'

/** Minimal order reference needed to locate the matching Pretix order. */
type OrderRef = {
  orderCode: string
}

/** Fields on a Sommerfreizeit account that are synced from the Pretix order. */
type SommerfreizeitUserDoc = {
  id: string
  email?: string | null
  street?: string | null
  houseNumber?: string | null
  country?: string | null
}

type UserExportPatch = {
  street?: string
  houseNumber?: string
  country?: string
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Synchronisiert die Export-Felder (`street`, `houseNumber`, `country`) der
 * Sommerfreizeit-Konten mit der Rechnungsadresse der zugehörigen Pretix-Bestellung.
 *
 * - Konten werden über die (normalisierte) E-Mail-Adresse der Bestellung gematcht.
 * - Werte werden nur gesetzt, wenn Pretix einen Wert liefert; vorhandene Werte
 *   werden nie mit leeren Pretix-Werten überschrieben.
 */
export async function syncUserExportData(
  payload: Payload,
  orders: OrderRef[],
  ordersByCode: Map<string, PretixOrder>,
  errors: string[],
): Promise<number> {
  if (orders.length === 0) {
    return 0
  }

  // Build email → patch from each order's invoice address (first non-empty wins).
  const patchByEmail = new Map<string, UserExportPatch>()

  for (const order of orders) {
    const code = normalizeOrderCode(order.orderCode)
    const orderDoc = code ? ordersByCode.get(code) : undefined

    if (!orderDoc) {
      continue
    }

    const email = normalizeEmail(orderDoc.email)

    if (!email) {
      continue
    }

    const invoice = orderDoc.invoice_address
    const patch: UserExportPatch = {}

    const rawStreet = typeof invoice?.street === 'string' ? invoice.street.trim() : ''

    if (rawStreet) {
      const { street, houseNumber } = splitStreetAndHouseNumber(rawStreet)

      if (street) {
        patch.street = street
      }

      if (houseNumber) {
        patch.houseNumber = houseNumber
      }
    }

    const rawCountry = typeof invoice?.country === 'string' ? invoice.country.trim() : ''

    if (rawCountry) {
      patch.country = rawCountry.toLowerCase()
    }

    if (Object.keys(patch).length === 0) {
      continue
    }

    const existing = patchByEmail.get(email) ?? {}
    patchByEmail.set(email, {
      street: existing.street ?? patch.street,
      houseNumber: existing.houseNumber ?? patch.houseNumber,
      country: existing.country ?? patch.country,
    })
  }

  const emails = Array.from(patchByEmail.keys())

  if (emails.length === 0) {
    return 0
  }

  const usersResult = await payload.find({
    collection: 'sommerfreizeitUsers',
    where: {
      email: {
        in: emails,
      },
    },
    limit: 0,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  const updates: Array<{ id: string; data: UserExportPatch }> = []

  for (const doc of usersResult.docs as unknown as SommerfreizeitUserDoc[]) {
    const email = normalizeEmail(doc.email)
    const patch = email ? patchByEmail.get(email) : undefined

    if (!patch) {
      continue
    }

    const record = doc as Record<string, unknown>
    const changed = Object.entries(patch).some(([key, value]) => record[key] !== value)

    if (!changed) {
      continue
    }

    updates.push({ id: doc.id, data: patch })
  }

  if (updates.length === 0) {
    return 0
  }

  const results = await Promise.allSettled(
    updates.map(({ id, data }) =>
      payload.update({
        collection: 'sommerfreizeitUsers',
        id,
        data,
        depth: 0,
        overrideAccess: true,
      }),
    ),
  )

  let synced = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      synced += 1
    } else {
      errors.push(
        `User export sync failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      )
    }
  }

  return synced
}

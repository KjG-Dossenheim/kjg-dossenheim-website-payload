import type { CollectionAfterChangeHook } from 'payload'
import { normalizeOrderCode } from '@/utilities/pretix'

type AnmeldungStatusDoc = {
  id: string
  pretixStatus?: string | null
}

/**
 * Synchronisiert den `pretixStatus` der Anmeldungen mit dem `status` dieser
 * Bestellung. Quelle der Wahrheit ist `sommerfreizeitOrders.status` – wird er
 * geändert, wird `pretixStatus` auf allen zugehörigen Anmeldungen
 * (`pretixOrderCode` matcht `orderCode`) aktualisiert.
 *
 * - Unveränderte Anmeldungen werden übersprungen.
 * - Skip by setting `context.skipAnmeldungPretixStatusSync = true`.
 */
export const syncAnmeldungPretixStatus: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipAnmeldungPretixStatusSync) {
    return doc
  }

  if (!doc?.id || !doc.orderCode) {
    return doc
  }

  // Nur bei tatsächlicher Statusänderung synchronisieren.
  if (previousDoc && doc.status === previousDoc.status) {
    return doc
  }

  const orderCode = normalizeOrderCode(doc.orderCode)

  if (!orderCode) {
    return doc
  }

  const anmeldungenResult = await req.payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      pretixOrderCode: {
        equals: orderCode,
      },
    },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })

  const anmeldungen = anmeldungenResult.docs as unknown as AnmeldungStatusDoc[]

  const updates = anmeldungen.filter(
    (anmeldung) =>
      normalizeOrderCode(anmeldung.pretixStatus) !== normalizeOrderCode(doc.status),
  )

  if (updates.length === 0) {
    return doc
  }

  const results = await Promise.allSettled(
    updates.map(({ id }) =>
      req.payload.update({
        collection: 'sommerfreizeitAnmeldung',
        id,
        data: {
          pretixStatus: doc.status,
        },
        context: {
          skipChildAnmeldungSync: true,
          skipZimmerwunschSync: true,
          skipAnmeldungPretixStatusSync: true,
        },
        overrideAccess: true,
        req,
      }),
    ),
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      req.payload.logger.error({
        msg: `Failed to sync order status ${doc.status} to Anmeldung`,
        err: result.reason,
      })
    }
  }

  return doc
}

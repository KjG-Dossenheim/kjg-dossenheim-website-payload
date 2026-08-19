import type { CollectionAfterChangeHook } from 'payload'

type RelationshipValue =
  | string
  | number
  | {
    id?: string | number
  }
  | null
  | undefined

const resolveId = (value: RelationshipValue): string | null => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if ('id' in value && value.id !== undefined) return String(value.id)
  return null
}

const toIdSet = (value: unknown): Set<string> => {
  const ids = new Set<string>()
  if (!Array.isArray(value)) return ids
  for (const item of value) {
    const id = resolveId(item as RelationshipValue)
    if (id) ids.add(id)
  }
  return ids
}

/**
 * Synchronisiert das `room`-Feld der Anmeldungen mit den Bewohnern dieses
 * Zimmers. Läuft nach `validateGenderHomogeneity` (beforeChange) und hält
 * `sommerfreizeitAnmeldung.room` als denormalisierten Zeiger auf die
 * Quelle der Wahrheit `sommerfreizeitRooms.occupants` aktuell.
 *
 * - Hinzugefügte Bewohner → `room` wird auf dieses Zimmer gesetzt.
 * - Entfernte Bewohner → `room` wird auf `null` gesetzt.
 *
 * Skip by setting `context.skipAnmeldungRoomSync = true`.
 */
export const syncAnmeldungRoom: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipAnmeldungRoomSync) {
    return doc
  }

  // Nur publizierte Zimmeränderungen synchronisieren. Draft-Speicherungen
  // (z. B. "Als Entwurf speichern" im Admin-Panel) dürfen den publizierten
  // `room`-Zeiger der Anmeldungen nicht verändern.
  if (doc?._status !== 'published') {
    return doc
  }

  if (!doc?.id) {
    return doc
  }

  const previousIds = toIdSet(previousDoc?.occupants)
  const currentIds = toIdSet(doc.occupants)

  const added: string[] = []
  const removed: string[] = []
  for (const id of currentIds) {
    if (!previousIds.has(id)) added.push(id)
  }
  for (const id of previousIds) {
    if (!currentIds.has(id)) removed.push(id)
  }

  if (added.length === 0 && removed.length === 0) {
    return doc
  }

  // Die Anmeldungen, die aktualisiert werden müssen, ergeben sich direkt aus
  // der Differenz zwischen `previousDoc` (alter Zustand) und `doc` (neuer
  // Zustand) der `occupants`. Ein Kind wohnt immer nur in einem Zimmer.
  const updates: { id: string; room: string | null }[] = [
    ...added.map((id) => ({ id, room: doc.id as string })),
    ...removed.map((id) => ({ id, room: null })),
  ]

  const results = await Promise.allSettled(
    updates.map(({ id, room }) =>
      req.payload.update({
        collection: 'sommerfreizeitAnmeldung',
        id,
        data: { room },
        context: {
          skipChildAnmeldungSync: true,
          skipZimmerwunschSync: true,
          skipAnmeldungRoomSync: true,
        },
        overrideAccess: true,
        req,
      }),
    ),
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      req.payload.logger.error({
        msg: `Failed to sync room ${doc.id} to Anmeldung`,
        err: result.reason,
      })
    }
  }

  return doc
}

import type { CollectionBeforeChangeHook } from 'payload'

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

type RelationshipValue =
  | string
  | number
  | {
    id?: string | number
  }
  | null
  | undefined

const resolveRelationshipId = (value: RelationshipValue): string | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if ('id' in value && value.id !== undefined) {
    return String(value.id)
  }

  return null
}

/**
 * Berechnet das Alter des Kindes automatisch auf Basis des Geburtsdatums.
 * Referenzdatum ist das Enddatum des zugehörigen Events (sonst das aktuelle Datum).
 * Läuft nach `syncChildDataBeforeChange`, damit das frisch synchronisierte
 * `dateOfBirth` verwendet wird.
 */
export const calculateAgeBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (!data) {
    return data
  }

  const dateOfBirth = data.dateOfBirth

  if (!dateOfBirth) {
    data.age = null
    return data
  }

  const birthDate = new Date(dateOfBirth)
  if (Number.isNaN(birthDate.getTime())) {
    data.age = null
    return data
  }

  // Referenzdatum: Enddatum des zugehörigen Events, sonst aktuelles Datum
  let referenceDate = new Date()

  const eventValue = data.event ?? originalDoc?.event
  const eventId = resolveRelationshipId(eventValue)

  if (eventId) {
    try {
      const event = await req.payload.findByID({
        collection: 'sommerfreizeitEvents',
        id: eventId,
        depth: 0,
        overrideAccess: true,
        req,
      })

      if (event?.endDate) {
        const endDate = new Date(event.endDate)
        if (!Number.isNaN(endDate.getTime())) {
          referenceDate = endDate
        }
      }
    } catch (err) {
      req.payload.logger.warn({
        msg: `Failed to fetch event ${eventId} for age calculation, falling back to current date`,
        err,
      })
    }
  }

  data.age = Math.floor((referenceDate.getTime() - birthDate.getTime()) / MS_PER_YEAR)

  return data
}

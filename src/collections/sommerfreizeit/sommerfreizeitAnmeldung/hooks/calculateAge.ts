import type { FieldHook } from 'payload'

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
 * Läuft als Feld-Hook auf `dateOfBirth` und wird bei jedem Speichern neu berechnet.
 * Da Feld-Hooks nach den Collection-Hooks laufen, steht `dateOfBirth` bereits mit
 * dem Wert aus `syncChildDataBeforeChange` zur Verfügung.
 */
export const calculateAgeBeforeChange: FieldHook = async ({
  value,
  siblingData,
  originalDoc,
  req,
  context,
}) => {
  if (context?.skipAgeCalculation) {
    return value
  }

  // Feld ist nicht Teil der übermittelten Daten -> `age` nicht anfassen.
  if (value === undefined) {
    return value
  }

  const dateOfBirth = value

  if (!dateOfBirth) {
    siblingData.age = null
    return value
  }

  const birthDate = new Date(dateOfBirth)
  if (Number.isNaN(birthDate.getTime())) {
    siblingData.age = null
    return value
  }

  // Referenzdatum: Enddatum des zugehörigen Events, sonst aktuelles Datum
  let referenceDate = new Date()

  const eventValue = siblingData.event ?? originalDoc?.event
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

  siblingData.age = Math.floor((referenceDate.getTime() - birthDate.getTime()) / MS_PER_YEAR)

  return value
}

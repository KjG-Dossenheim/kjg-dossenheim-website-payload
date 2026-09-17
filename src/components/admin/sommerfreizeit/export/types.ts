/** Column headers of the Sommerfreizeit export, in order. */
export const EXPORT_HEADERS = [
  'Vorname',
  'Nachname',
  'Strasse',
  'Hausnummer',
  'PLZ',
  'Ort',
  'Land',
  'Geschlecht',
  'Geburtsdatum',
  'Personentyp',
  'Teilgenommen von',
  'Teilgenommen bis',
  'Dauer',
  'juleica',
] as const

/** Teilnehmer (registration) or Mitarbeiter (team member). */
export type PersonType = 'tn' | 'ma'

/** A single export row, decoupled from Payload documents. */
export type ExportRow = {
  firstName: string
  lastName: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
  gender: string | null | undefined
  dateOfBirth: string | null | undefined
  personType: PersonType
  juleica: string | null | undefined
}

/** Participation period shared by all rows, derived from the event. */
export type ExportPeriod = {
  from?: string | null
  until?: string | null
}

/** Event option rendered in the export view's selector. */
export type ExportEventOption = {
  id: string
  name: string
  startDate: string
}

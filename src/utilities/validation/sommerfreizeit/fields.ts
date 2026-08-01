import { z } from 'zod'
import type { SommerfreizeitAnmeldung, SommerfreizeitChild } from '@/payload-types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const reqStr = (label: string) => z.string().trim().min(1, `${label} ist erforderlich.`)
const optStr = () => z.string().trim().optional()

// ---------------------------------------------------------------------------
// Required string fields (with German error messages)
// ---------------------------------------------------------------------------

export const firstName = reqStr('Vorname')
export const lastName = reqStr('Nachname')
export const dateOfBirth = reqStr('Geburtsdatum')
export const krankenversicherung = reqStr('Krankenversicherung')
export const arzt = reqStr('Arzt')
export const arztTelefon = reqStr('Arzt-Telefon')
export const phone = reqStr('Telefonnummer')
export const address = reqStr('Adresse')
export const postalCode = reqStr('Postleitzahl')
export const city = reqStr('Ort')

// ---------------------------------------------------------------------------
// Optional string fields
// ---------------------------------------------------------------------------

export const phoneOpt = optStr()
export const addressOpt = optStr()
export const postalCodeOpt = optStr()
export const cityOpt = optStr()

// ---------------------------------------------------------------------------
// Trimmed-but-not-required strings (can be empty, always a string)
// ---------------------------------------------------------------------------

export const krankenversicherungNummer = z.string().trim()
export const foodAllergies = z.string().trim()
export const otherAllergies = z.string().trim()
export const medicalConditions = z.string().trim()
export const medikamente = z.string().trim()
export const bemerkungen = z.string().trim().optional()

// ---------------------------------------------------------------------------
// Identifier / code fields
// ---------------------------------------------------------------------------

export const orderCode = z
  .string()
  .trim()
  .min(5, 'Bitte gib einen gültigen Bestellcode ein.')
  .max(5, 'Bitte gib einen gültigen Bestellcode ein.')

export const positionId = z.coerce.string().trim().min(1)
export const orderPosition = z.coerce.string().trim().min(1)
export const pretixOrderID = z.string().min(1)
export const pretixEvent = z.string().min(1)

// ---------------------------------------------------------------------------
// Enum / custom Payload-typed fields (permissive — Payload handles validation)
// ---------------------------------------------------------------------------

export const gender = z.custom<SommerfreizeitChild['gender']>()

export const classField = z
  .enum(['3', '4', '5', '6', '7', '8', '9', '10'], {
    error: 'Klasse ist erforderlich.',
  })
  .nullish()

export const krankenversicherungArt = z
  .enum(['gesetzlich', 'privat'], {
    error: 'Art der Krankenversicherung ist erforderlich.',
  })
  .nullish()

export const foodPreferences = z
  .custom<SommerfreizeitAnmeldung['foodPreferences']>()
  .nullish()

export const schwimmabzeichen = z
  .custom<SommerfreizeitAnmeldung['schwimmabzeichen']>()
  .nullish()

export const bildrechte = z.custom<SommerfreizeitAnmeldung['bildrechte']>()

// ---------------------------------------------------------------------------
// Boolean fields
// ---------------------------------------------------------------------------

export const optionalBool = z.boolean().optional().nullish()
export const optionalBoolPlain = z.boolean().optional()

/** Consent checkbox that must be checked (refines to `true`). */
export const consentTrue = (message: string) =>
  z.boolean().refine((v) => v === true, { message })

// ---------------------------------------------------------------------------
// Admin import variants (permissive, all nullable + optional)
// ---------------------------------------------------------------------------

export const genderImport = z.custom<SommerfreizeitChild['gender']>().nullable().optional()

export const classFieldImport = z
  .enum(['3', '4', '5', '6', '7', '8', '9', '10'])
  .nullable()
  .optional()

export const krankenversicherungArtImport = z
  .enum(['gesetzlich', 'privat'])
  .nullable()
  .optional()

export const foodPreferencesImport = z
  .custom<SommerfreizeitAnmeldung['foodPreferences']>()
  .nullable()
  .optional()

export const schwimmabzeichenImport = z
  .custom<SommerfreizeitAnmeldung['schwimmabzeichen']>()
  .nullable()
  .optional()

export const bildrechteImport = z
  .custom<SommerfreizeitAnmeldung['bildrechte']>()
  .optional()

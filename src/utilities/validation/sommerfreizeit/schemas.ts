import { z } from 'zod'
import {
  // required strings
  firstName,
  lastName,
  dateOfBirth,
  krankenversicherung,
  arzt,
  arztTelefon,
  // optional strings
  phoneOpt,
  addressOpt,
  postalCodeOpt,
  cityOpt,
  // trimmed strings
  krankenversicherungNummer,
  foodAllergies,
  otherAllergies,
  medicalConditions,
  medikamente,
  bemerkungen,
  // identifiers
  orderCode,
  positionId,
  orderPosition,
  pretixOrderID,
  pretixEvent,
  // enums / customs
  gender,
  classField,
  krankenversicherungArt,
  foodPreferences,
  schwimmabzeichen,
  bildrechte,
  // import variants
  genderImport,
  classFieldImport,
  krankenversicherungArtImport,
  foodPreferencesImport,
  schwimmabzeichenImport,
  bildrechteImport,
  // booleans
  optionalBool,
  optionalBoolPlain,
  consentTrue,
} from './fields'
import {
  zimmerwunschEntrySchema,
  medikamenteEntrySchema,
  contactInfoSchema,
} from './composites'

// ===========================================================================
// 1. lookupOrderSchema — Pretix order code lookup
// ===========================================================================

export const lookupOrderSchema = z.object({
  orderCode,
})

// ===========================================================================
// 2. childInputSchema — public registration form (per child)
// ===========================================================================

export const childInputSchema = z.object({
  positionId,
  firstName,
  lastName,
  dateOfBirth,
  gender,
  class: classField,
  krankenversicherung,
  krankenversicherungArt,
  krankenversicherungNummer,
  krankenkassenKarte: optionalBool,
  impfpass: optionalBool,
  foodAllergies,
  foodPreferences,
  otherAllergies,
  medicalConditions,
  medikamente,
  medikamenteArray: z.array(medikamenteEntrySchema).nullish(),
  arzt,
  arztTelefon,
  hausarztmodell: optionalBool,
  schwimmer: optionalBool,
  schwimmabzeichen,
  bemerkungen,
  zimmerwunsch: z.array(zimmerwunschEntrySchema).optional(),
  bildrechte,
  bildrechteAkzeptiert: consentTrue('Du musst die Bildrechte akzeptieren.'),
  agbAkzeptiert: consentTrue('Du musst die AGB akzeptieren.'),
  datenschutzAkzeptiert: consentTrue('Du musst die Datenschutzbestimmungen akzeptieren.'),
})

// ===========================================================================
// 3. completeOrderSchema — wraps order code + contact + children
// ===========================================================================

export const completeOrderSchema = contactInfoSchema.extend({
  orderCode,
  children: z.array(childInputSchema).min(1, 'Mindestens ein Kind ist erforderlich.'),
})

// ===========================================================================
// 4. childImportSchema — admin JSON import (identity fields required, others optional)
// ===========================================================================

export const childImportSchema = z.object({
  positionId,
  orderPosition,
  firstName,
  lastName,
  dateOfBirth,
  gender: genderImport,
  class: classFieldImport,
  krankenversicherung: krankenversicherung.optional(),
  krankenversicherungArt: krankenversicherungArtImport,
  krankenversicherungNummer: krankenversicherungNummer.optional(),
  krankenkassenKarte: optionalBoolPlain,
  impfpass: optionalBoolPlain,
  foodAllergies: foodAllergies.optional(),
  foodPreferences: foodPreferencesImport,
  otherAllergies: otherAllergies.optional(),
  medicalConditions: medicalConditions.optional(),
  medikamente: medikamente.optional(),
  arzt: arzt.optional(),
  arztTelefon: arztTelefon.optional(),
  hausarztmodell: optionalBoolPlain,
  schwimmer: optionalBoolPlain,
  schwimmabzeichen: schwimmabzeichenImport,
  bemerkungen: bemerkungen.optional(),
  zimmerwunsch: z.array(zimmerwunschEntrySchema).optional(),
  agbAkzeptiert: optionalBoolPlain,
  datenschutzAkzeptiert: optionalBoolPlain,
  bildrechteAkzeptiert: optionalBoolPlain,
  bildrechte: bildrechteImport,
})

// ===========================================================================
// 5. importJsonSchema — top-level admin JSON import
// ===========================================================================

export const importJsonSchema = z.object({
  orderCode: z.string().min(1),
  pretixOrderID,
  pretixEvent,
  contact: z
    .object({
      phone: phoneOpt,
      address: addressOpt,
      postalCode: postalCodeOpt,
      city: cityOpt,
    })
    .optional(),
  children: z.array(childImportSchema).min(1),
})

// ===========================================================================
// 6. updateAccountSchema — Sommerfreizeit user account editing
// ===========================================================================

export const updateAccountSchema = z.object({
  firstName,
  lastName,
  phone: phoneOpt,
  address: addressOpt,
  postalCode: postalCodeOpt,
  city: cityOpt,
})

// ===========================================================================
// 7. createChildSchema — create/update a child profile
// ===========================================================================

export const createChildSchema = z.object({
  firstName,
  lastName,
  dateOfBirth,
  gender: z.enum(['male', 'female', 'diverse'], {
    error: 'Geschlecht ist erforderlich.',
  }),
})

// ===========================================================================
// 8. updateAnmeldungSchema — edit health/insurance/preferences on an existing Anmeldung
// ===========================================================================

export const updateAnmeldungSchema = z.object({
  krankenversicherung,
  krankenversicherungArt: krankenversicherungArt.nullable(),
  krankenversicherungNummer: krankenversicherungNummer.optional(),
  krankenkassenKarte: optionalBool,
  impfpass: optionalBool,
  foodAllergies: foodAllergies.optional(),
  foodPreferences: foodPreferences.nullable(),
  otherAllergies: otherAllergies.optional(),
  medicalConditions: medicalConditions.optional(),
  medikamente: medikamente.optional(),
  arzt,
  arztTelefon,
  hausarztmodell: optionalBool,
  schwimmer: optionalBool,
  schwimmabzeichen: schwimmabzeichen.nullable().optional(),
  bemerkungen,
  zimmerwunsch: z.array(zimmerwunschEntrySchema).optional(),
})

// ===========================================================================
// Inferred types
// ===========================================================================

export type LookupOrderInput = z.infer<typeof lookupOrderSchema>
export type ChildInput = z.infer<typeof childInputSchema>
export type CompleteOrderInput = z.infer<typeof completeOrderSchema>
export type ChildImportInput = z.infer<typeof childImportSchema>
export type ImportJsonInput = z.infer<typeof importJsonSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type CreateChildInput = z.infer<typeof createChildSchema>
export type UpdateAnmeldungInput = z.infer<typeof updateAnmeldungSchema>

// ===========================================================================
// Backward-compat type aliases (used by anmelden/action.ts)
// ===========================================================================

export type LookupOrderSchema = typeof lookupOrderSchema
export type ChildInputSchema = typeof childInputSchema
export type CompleteOrderSchema = typeof completeOrderSchema

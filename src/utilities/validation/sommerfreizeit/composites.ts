import { z } from 'zod'
import { firstName, phone, address, postalCode, city } from './fields'

// ---------------------------------------------------------------------------
// Zimmerwunsch entry — shared by childInput, updateAnmeldung, admin import
// ---------------------------------------------------------------------------

export const zimmerwunschEntrySchema = z.object({
  firstName,
  lastName: z.string().trim().optional(),
})

// ---------------------------------------------------------------------------
// Medication entry — used in childInputSchema's medikamenteArray
// ---------------------------------------------------------------------------

export const medikamenteEntrySchema = z.object({
  name: z.string().trim().min(1, 'Name des Medikaments ist erforderlich.'),
  dosierung: z.string().trim().min(1, 'Dosierung ist erforderlich.'),
})

// ---------------------------------------------------------------------------
// Contact info — used in completeOrderSchema (required) and importJsonSchema (optional)
// ---------------------------------------------------------------------------

export const contactInfoSchema = z.object({
  phone,
  address,
  postalCode,
  city,
})

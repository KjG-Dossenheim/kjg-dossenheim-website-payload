import { z } from 'zod'

export const lookupOrderSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(3, 'Bitte gib einen gueltigen Bestellcode ein.')
    .max(64, 'Bitte gib einen gueltigen Bestellcode ein.'),
})

export const childInputSchema = z.object({
  positionId: z.string().trim().min(1),
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
  dateOfBirth: z.string().trim().min(1, 'Geburtsdatum ist erforderlich.'),
  gender: z.enum(['male', 'female', 'diverse'], {
    error: 'Geschlecht ist erforderlich.',
  }),
  class: z.enum(['3', '4', '5', '6', '7', '8', '9', '10']).optional(),
  krankenversicherung: z.string().trim().min(1, 'Krankenversicherung ist erforderlich.'),
  krankenversicherungArt: z.enum(['gesetzlich', 'privat'], {
    error: 'Art der Krankenversicherung ist erforderlich.',
  }),
  krankenversicherungNummer: z.string().trim().min(1, 'Versichertennummer ist erforderlich.'),
  foodAllergies: z.string().trim().min(1, 'Lebensmittelallergien sind erforderlich.'),
  otherAllergies: z.string().trim().min(1, 'Sonstige Allergien sind erforderlich.'),
  medicalConditions: z.string().trim().min(1, 'Vorerkrankungen sind erforderlich.'),
  medikamente: z.string().trim().min(1, 'Medikamente sind erforderlich.'),
  arzt: z.string().trim().min(1, 'Arzt ist erforderlich.'),
  arztTelefon: z.string().trim().min(1, 'Arzt-Telefon ist erforderlich.'),
  schwimmer: z.boolean(),
  bemerkungen: z.string().trim().optional(),
})

export const completeOrderSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(3, 'Bitte gib einen gueltigen Bestellcode ein.')
    .max(64, 'Bitte gib einen gueltigen Bestellcode ein.'),
  phone: z.string().trim().min(1, 'Telefonnummer ist erforderlich.'),
  address: z.string().trim().min(1, 'Adresse ist erforderlich.'),
  postalCode: z.string().trim().min(1, 'Postleitzahl ist erforderlich.'),
  city: z.string().trim().min(1, 'Ort ist erforderlich.'),
  children: z.array(childInputSchema).min(1, 'Mindestens ein Kind ist erforderlich.'),
})

export type LookupOrderSchema = typeof lookupOrderSchema
export type ChildInputSchema = typeof childInputSchema
export type CompleteOrderSchema = typeof completeOrderSchema

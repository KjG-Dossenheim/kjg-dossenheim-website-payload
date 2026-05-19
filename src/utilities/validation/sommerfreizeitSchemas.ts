import { z } from 'zod'
import type { SommerfreizeitAnmeldung, SommerfreizeitChild } from '@/payload-types';

const orderCode = z.string().trim().min(5, 'Bitte gib einen gueltigen Bestellcode ein.').max(5, 'Bitte gib einen gueltigen Bestellcode ein.')

export const lookupOrderSchema = z.object({
  orderCode: orderCode
})

export const childInputSchema = z.object({
  positionId: z.coerce.string().trim().min(1),
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich.'),
  dateOfBirth: z.string().trim().min(1, 'Geburtsdatum ist erforderlich.'),
  gender: z.custom<SommerfreizeitChild['gender']>(),
  class: z.enum(['3', '4', '5', '6', '7', '8', '9', '10'], {
    error: 'Klasse ist erforderlich.',
  }).nullish(),
  krankenversicherung: z.string().trim().min(1, 'Krankenversicherung ist erforderlich.'),
  krankenversicherungArt: z.enum(['gesetzlich', 'privat'], {
    error: 'Art der Krankenversicherung ist erforderlich.',
  }).nullish(),
  krankenversicherungNummer: z.string().trim(),
  krankenkassenKarte: z.boolean().optional().nullish(),
  impfpass: z.boolean().optional().nullish(),
  foodAllergies: z.string().trim(),
  foodPreferences: z.custom<SommerfreizeitAnmeldung['foodPreferences']>(),
  otherAllergies: z.string().trim(),
  medicalConditions: z.string().trim(),
  medikamente: z.string().trim(),
  arzt: z.string().trim().min(1, 'Arzt ist erforderlich.'),
  arztTelefon: z.string().trim().min(1, 'Arzt-Telefon ist erforderlich.'),
  hausarztmodell: z.boolean().optional().nullish(),
  schwimmer: z.boolean().optional().nullish(),
  schwimmabzeichen: z.custom<SommerfreizeitAnmeldung['schwimmabzeichen']>(),
  bemerkungen: z.string().trim().optional(),
  zimmerwunsch: z.array(z.object({
    firstName: z.string().trim().min(1, 'Vorname ist erforderlich.'),
    lastName: z.string().trim(),
  })).optional(),
  bildrechte: z.custom<SommerfreizeitAnmeldung['bildrechte']>(),
  agbAkzeptiert: z.boolean().refine(value => value === true, {
    message: 'Du musst die AGB akzeptieren.',
  }),
  datenschutzAkzeptiert: z.boolean().refine(value => value === true, {
    message: 'Du musst die Datenschutzbestimmungen akzeptieren.',
  }),
})

export const completeOrderSchema = z.object({
  orderCode: orderCode,
  phone: z.string().trim().min(1, 'Telefonnummer ist erforderlich.'),
  address: z.string().trim().min(1, 'Adresse ist erforderlich.'),
  postalCode: z.string().trim().min(1, 'Postleitzahl ist erforderlich.'),
  city: z.string().trim().min(1, 'Ort ist erforderlich.'),
  children: z.array(childInputSchema).min(1, 'Mindestens ein Kind ist erforderlich.'),
})

export type LookupOrderSchema = typeof lookupOrderSchema
export type ChildInputSchema = typeof childInputSchema
export type CompleteOrderSchema = typeof completeOrderSchema

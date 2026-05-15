import { z } from 'zod'

export const pretixNamePartsSchema = z.record(z.string(), z.string())

export const pretixOrderPositionCheckinSchema = z
  .object({
    id: z.number(),
    list: z.number(),
    datetime: z.string(),
    type: z.string().optional(),
    gate: z.number().nullable().optional(),
    device: z.number().nullable().optional(),
    device_id: z.number().nullable().optional(),
    auto_checked_in: z.boolean().optional(),
  })
  .loose()

export const pretixOrderPositionPrintLogSchema = z
  .object({
    id: z.number(),
    successful: z.boolean(),
    device_id: z.number().nullable().optional(),
    datetime: z.string(),
    source: z.string(),
    type: z.string(),
    info: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export const pretixOrderPositionDownloadSchema = z
  .object({
    output: z.string(),
    url: z.string(),
  })
  .loose()

export const pretixOrderPositionAnswerSchema = z
  .object({
    question: z.number(),
    answer: z.string().nullable().optional(),
    question_identifier: z.string().optional(),
    options: z.array(z.number()).optional(),
    option_identifiers: z.array(z.string()).optional(),
    option_idenfiters: z.array(z.string()).optional(),
  })
  .loose()

export const pretixOrderPositionSeatSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    zone_name: z.string(),
    row_name: z.string(),
    row_label: z.string().nullable().optional(),
    seat_number: z.string(),
    seat_label: z.string().nullable().optional(),
    seat_guid: z.string(),
  })
  .loose()

export const pretixOrderPositionSchema = z
  .object({
    id: z.number(),
    order: z.string(),
    positionid: z.number(),
    canceled: z.boolean(),
    item: z.number(),
    variation: z.number().nullable().optional(),
    price: z.string(),
    attendee_name: z.string().nullable().optional(),
    attendee_name_parts: pretixNamePartsSchema.nullable().optional(),
    attendee_email: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    voucher: z.number().nullable().optional(),
    voucher_budget_use: z.string().nullable().optional(),
    tax_rate: z.string(),
    tax_value: z.string(),
    tax_code: z.string().nullable().optional(),
    tax_rule: z.number().nullable().optional(),
    secret: z.string(),
    addon_to: z.number().nullable().optional(),
    subevent: z.number().nullable().optional(),
    discount: z.number().nullable().optional(),
    blocked: z.array(z.string()).nullable().optional(),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
    pseudonymization_id: z.string(),
    checkins: z.array(pretixOrderPositionCheckinSchema).optional(),
    print_logs: z.array(pretixOrderPositionPrintLogSchema).optional(),
    downloads: z.array(pretixOrderPositionDownloadSchema).optional(),
    answers: z.array(pretixOrderPositionAnswerSchema).optional(),
    seat: pretixOrderPositionSeatSchema.nullable().optional(),
    pdf_data: z.record(z.string(), z.unknown()).optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export type PretixOrderPosition = z.infer<typeof pretixOrderPositionSchema>

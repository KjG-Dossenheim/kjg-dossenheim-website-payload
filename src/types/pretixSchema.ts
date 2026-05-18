import { z } from 'zod'

export const pretixOrderPositionSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order: z.string(),
    positionid: z.union([z.string(), z.number()]).optional(),
    canceled: z.boolean().optional(),
    item: z.number(),
    variation: z.union([z.string(), z.number()]).nullable().optional(),
    price: z.number(),
    attendee_name: z.string().nullable().optional(),
    attendee_name_parts: z.record(z.string(), z.unknown()).optional(),
    attendee_email: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
    tax_value: z.union([z.string(), z.number()]).nullable().optional(),
    secret: z.string().nullable().optional(),
    pseudonymization_id: z.string().nullable().optional(),
    seat: z.string().nullable().optional(),
    checkins: z.array(z.record(z.string(), z.unknown())).optional(),
    print_logs: z.array(z.record(z.string(), z.unknown())).optional(),
    answers: z.array(z.record(z.string(), z.unknown())).optional(),
    downloads: z.array(z.record(z.string(), z.unknown())).optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export const pretixOrderSchema = z
  .object({
    code: z.string(),
    event: z.string(),
    status: z.enum(['n', 'p', 'e', 'c']),
    secret: z.string(),
    testmode: z.boolean(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    locale: z.string(),
    sales_channel: z.string(),
    total: z.number(),
    datetime: z.iso.datetime(),
    expires: z.iso.datetime(),
    payment_date: z.iso.datetime().nullable().optional(),
    payment_provider: z.string().nullable().optional(),
    fees: z.array(z.record(z.string(), z.unknown())).optional(),
    tax_rounding_mode: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    custom_followup_at: z.iso.datetime().nullable().optional(),
    checkin_attention: z.boolean(),
    checkin_text: z.string().nullable().optional(),
    require_approval: z.boolean(),
    invoice_address: z.record(z.string(), z.unknown()).nullable().optional(),
    positions: z.array(pretixOrderPositionSchema).optional(),
    downloads: z.array(z.record(z.string(), z.unknown())).optional(),
    valid_if_pending: z.boolean(),
    url: z.string().nullable().optional(),
    payments: z.array(z.record(z.string(), z.unknown())).optional(),
    refunds: z.array(z.record(z.string(), z.unknown())).optional(),
    last_modified: z.iso.datetime().nullable().optional(),
    cancellation_date: z.iso.datetime().nullable().optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })

export const pretixOrderListSchema = z
  .object({
    count: z.number().optional(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(pretixOrderSchema),
  })

export type Pretix = z.infer<typeof pretixOrderSchema>
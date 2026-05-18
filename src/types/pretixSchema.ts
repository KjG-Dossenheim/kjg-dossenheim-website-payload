import { z } from 'zod'

export const pretixNamePartsSchema = z
  .object({
    _scheme: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
  })
  .partial()

export const pretixInvoiceAddressSchema = z.object({
  last_modified: z.string().nullable().optional(),
  is_business: z.boolean().optional(),
  company: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  name_parts: pretixNamePartsSchema.optional(),
  street: z.string().nullable().optional(),
  zipcode: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  vat_id: z.string().nullable().optional(),
  vat_id_validated: z.boolean().optional(),
  custom_field: z.unknown().nullable().optional(),
  internal_reference: z.string().nullable().optional(),
  transmission_type: z.string().nullable().optional(),
  transmission_info: z.unknown().nullable().optional(),
})

export const pretixOrderPositionSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order: z.string().optional(),
    positionid: z.union([z.string(), z.number()]).optional(),
    item: z.number().optional(),
    variation: z.union([z.string(), z.number()]).nullable().optional(),
    price: z.string().or(z.coerce.number()),
    attendee_name: z.string().nullable().optional(),
    attendee_name_parts: pretixNamePartsSchema.optional(),
    company: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    discount: z.unknown().nullable().optional(),
    attendee_email: z.string().nullable().optional(),
    voucher: z.unknown().nullable().optional(),
    tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
    tax_value: z.union([z.string(), z.number()]).nullable().optional(),
    secret: z.string().nullable().optional(),
    addon_to: z.unknown().nullable().optional(),
    subevent: z.unknown().nullable().optional(),
    checkins: z.array(z.unknown()).optional(),
    print_logs: z.array(z.unknown()).optional(),
    downloads: z.array(z.unknown()).optional(),
    answers: z.array(z.unknown()).optional(),
    tax_rule: z.unknown().nullable().optional(),
    pseudonymization_id: z.string().nullable().optional(),
    seat: z.unknown().nullable().optional(),
    canceled: z.boolean().optional(),
    tax_code: z.unknown().nullable().optional(),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
    blocked: z.unknown().nullable().optional(),
    voucher_budget_use: z.unknown().nullable().optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export const pretixPaymentSchema = z.object({
  local_id: z.number().optional(),
  state: z.string().optional(),
  amount: z.string().or(z.coerce.number()).optional(),
  created: z.string().optional(),
  payment_date: z.iso.datetime({ offset: true }).nullable().optional(),
  provider: z.string().optional(),
  payment_url: z.string().nullable().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const pretixRefundSchema = z.object({
  local_id: z.number().optional(),
  state: z.string().optional(),
  source: z.string().optional(),
  amount: z.string().or(z.coerce.number()).optional(),
  payment: z.unknown().nullable().optional(),
  created: z.string().optional(),
  execution_date: z.string().optional(),
  comment: z.string().nullable().optional(),
  provider: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const pretixOrderSchema = z.object({
  code: z.string(),
  event: z.string(),
  status: z.enum(['n', 'p', 'e', 'c']),
  testmode: z.boolean(),
  secret: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  locale: z.string().optional(),
  datetime: z.iso.datetime({ offset: true }).optional(),
  expires: z.iso.datetime({ offset: true }).optional(),
  payment_date: z.iso.date().nullable().optional(),
  payment_provider: z.string().nullable().optional(),
  fees: z.array(z.unknown()).optional(),
  total: z.coerce.number(),
  tax_rounding_mode: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  custom_followup_at: z.unknown().nullable().optional(),
  invoice_address: pretixInvoiceAddressSchema.nullable().optional(),
  positions: z.array(pretixOrderPositionSchema).optional(),
  downloads: z.array(z.unknown()).optional(),
  checkin_attention: z.boolean().optional(),
  checkin_text: z.string().nullable().optional(),
  last_modified: z.string().optional(),
  payments: z.array(pretixPaymentSchema).optional(),
  refunds: z.array(pretixRefundSchema).optional(),
  require_approval: z.boolean().optional(),
  sales_channel: z.string().optional(),
  url: z.string().nullable().optional(),
  customer: z.unknown().nullable().optional(),
  valid_if_pending: z.boolean().optional(),
  api_meta: z.record(z.string(), z.unknown()).optional(),
  cancellation_date: z.string().nullable().optional(),
  plugin_data: z.record(z.string(), z.unknown()).optional(),
})

export const pretixOrderListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(pretixOrderSchema),
})

export type PretixOrder = z.infer<typeof pretixOrderSchema>
export type PretixOrderList = z.infer<typeof pretixOrderListSchema>
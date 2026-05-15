import { z } from 'zod'
import { pretixNamePartsSchema, pretixOrderPositionSchema } from '@/jobs/pretix/schemas/orderPosition'

const pretixInvoiceAddressSchema = z
  .object({
    last_modified: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    is_business: z.boolean().optional(),
    name: z.string().nullable().optional(),
    name_parts: pretixNamePartsSchema.optional(),
    street: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    internal_reference: z.string().nullable().optional(),
    vat_id: z.string().nullable().optional(),
    vat_id_validated: z.boolean().optional(),
    transmission_type: z.string().nullable().optional(),
    transmission_info: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export const pretixIndividualOrderSchema = z
  .object({
    code: z.string(),
    event: z.union([z.string(), z.number()]),
    status: z.enum(['n', 'p', 'e', 'c']),
    testmode: z.boolean().optional(),
    secret: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    customer: z.union([z.string(), z.number(), z.record(z.string(), z.unknown())]).nullable().optional(),
    locale: z.string().nullable().optional(),
    sales_channel: z.string().nullable().optional(),
    datetime: z.string().nullable().optional(),
    expires: z.string().nullable().optional(),
    last_modified: z.string().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    payment_provider: z.string().nullable().optional(),
    fees: z.array(z.record(z.string(), z.unknown())).optional(),
    total: z.union([z.string(), z.number()]).nullable().optional(),
    tax_rounding_mode: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    api_meta: z.record(z.string(), z.unknown()).optional(),
    custom_followup_at: z.string().nullable().optional(),
    checkin_attention: z.boolean().optional(),
    checkin_text: z.string().nullable().optional(),
    require_approval: z.boolean().optional(),
    valid_if_pending: z.boolean().optional(),
    invoice_address: pretixInvoiceAddressSchema.nullable().optional(),
    positions: z.array(pretixOrderPositionSchema).optional(),
    downloads: z.array(z.record(z.string(), z.unknown())).optional(),
    payments: z.array(z.record(z.string(), z.unknown())).optional(),
    refunds: z.array(z.record(z.string(), z.unknown())).optional(),
    cancellation_date: z.string().nullable().optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose()

export type PretixIndividualOrder = z.infer<typeof pretixIndividualOrderSchema>

export class PretixOrderFetchError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'PretixOrderFetchError'
    this.status = status
  }
}

type FetchIndividualPretixOrderArgs = {
  baseUrl: string
  organizer: string
  event: string
  code: string
  token: string
  includeCanceledPositions?: boolean
  includeCanceledFees?: boolean
}

export async function fetchIndividualOrderJob(
  args: FetchIndividualPretixOrderArgs,
): Promise<PretixIndividualOrder> {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/events/${encodeURIComponent(args.event)}/orders/${encodeURIComponent(args.code)}/`,
    args.baseUrl,
  )

  if (args.includeCanceledPositions) {
    endpoint.searchParams.set('include_canceled_positions', 'true')
  }

  if (args.includeCanceledFees) {
    endpoint.searchParams.set('include_canceled_fees', 'true')
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${args.token}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const bodyText = await response.text()

    if (response.status === 401) {
      throw new PretixOrderFetchError(401, 'PRETIX_UNAUTHORIZED')
    }

    if (response.status === 403) {
      throw new PretixOrderFetchError(403, 'PRETIX_FORBIDDEN')
    }

    if (response.status === 404) {
      throw new PretixOrderFetchError(404, 'ORDER_NOT_FOUND')
    }

    throw new PretixOrderFetchError(
      response.status,
      `Pretix API returned ${response.status}: ${bodyText}`,
    )
  }

  const json = await response.json()
  return pretixIndividualOrderSchema.parse(json)
}
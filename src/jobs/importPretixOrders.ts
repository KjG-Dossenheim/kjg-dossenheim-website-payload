import type { PayloadRequest } from 'payload'
import { z } from 'zod'

const pretixOrderPositionSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order: z.string().nullable().optional(),
    positionid: z.union([z.string(), z.number()]).optional(),
    canceled: z.boolean().optional(),
    item: z.union([z.string(), z.number()]).nullable().optional(),
    variation: z.union([z.string(), z.number()]).nullable().optional(),
    price: z.union([z.string(), z.number()]).nullable().optional(),
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

const pretixOrderSchema = z
  .object({
    code: z.string().optional(),
    secret: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    testmode: z.boolean().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    sales_channel: z.string().nullable().optional(),
    total: z.union([z.string(), z.number()]).nullable().optional(),
    currency: z.string().nullable().optional(),
    datetime: z.string().nullable().optional(),
    expires: z.string().nullable().optional(),
    last_modified: z.string().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    payment_provider: z.string().nullable().optional(),
    fees: z.array(z.record(z.string(), z.unknown())).optional(),
    tax_rounding_mode: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    custom_followup_at: z.string().nullable().optional(),
    checkin_attention: z.boolean().optional(),
    checkin_text: z.string().nullable().optional(),
    require_approval: z.boolean().optional(),
    valid_if_pending: z.boolean().optional(),
    invoice_address: z.record(z.string(), z.unknown()).nullable().optional(),
    event: z.union([z.string(), z.number()]).nullable().optional(),
    positions: z.array(pretixOrderPositionSchema).optional(),
    downloads: z.array(z.record(z.string(), z.unknown())).optional(),
    payments: z.array(z.record(z.string(), z.unknown())).optional(),
    refunds: z.array(z.record(z.string(), z.unknown())).optional(),
    cancellation_date: z.string().nullable().optional(),
    plugin_data: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

const pretixOrderListSchema = z
  .object({
    count: z.number().optional(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(pretixOrderSchema),
  })
  .passthrough()

type ImportPretixOrdersInput = {
  maxPages?: number
  pretixEventId?: string
  statuses?: string
  updateExisting?: boolean
}

type SommerfreizeitOrderDoc = {
  id: string
}

function toNonEmpty(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function toOptionalIsoDate(value: unknown): string | null {
  const stringValue = toNonEmpty(value)

  if (!stringValue) {
    return null
  }

  const date = new Date(stringValue)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()

    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toOptionalString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function parseStatuses(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

async function fetchOrdersPage(args: {
  baseUrl: string
  organizer: string
  token: string
  page: number
  pretixEventId?: string
  statuses?: string[]
}) {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/orders/`,
    args.baseUrl,
  )

  endpoint.searchParams.set('page', String(args.page))

  if (args.pretixEventId) {
    endpoint.searchParams.set('event', args.pretixEventId)
  }

  for (const status of args.statuses ?? []) {
    endpoint.searchParams.append('status', status)
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${args.token}`,
    },
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`Pretix API returned ${response.status}: ${bodyText}`)
  }

  const json = await response.json()
  return pretixOrderListSchema.parse(json)
}

export const importPretixOrdersJob = {
  slug: 'importPretixOrders',
  interfaceName: 'ImportPretixOrdersJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    try {
      const jobInput = (input ?? {}) as ImportPretixOrdersInput
      const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()
      const organizer = (process.env.NEXT_PUBLIC_PRETIX_ORGANIZER || '').trim()
      const token = (process.env.NEXT_PUBLIC_PRETIX_API_TOKEN || '').trim()
      const maxPages =
        typeof jobInput.maxPages === 'number' && Number.isFinite(jobInput.maxPages)
          ? Math.max(1, Math.floor(jobInput.maxPages))
          : undefined
      const pretixEventIdFilter = toNonEmpty(jobInput.pretixEventId)
      const statusFilter = parseStatuses(toNonEmpty(jobInput.statuses))
      const updateExisting = jobInput.updateExisting ?? true

      if (!organizer || !token) {
        throw new Error(
          'Missing NEXT_PUBLIC_PRETIX_ORGANIZER or NEXT_PUBLIC_PRETIX_API_TOKEN. Configure both environment variables.',
        )
      }

      req.payload.logger.info(
        `Starting Pretix order import (organizer=${organizer}, pretixEventId=${pretixEventIdFilter || 'none'}, statuses=${statusFilter.length > 0 ? statusFilter.join(',') : 'none'}, updateExisting=${updateExisting})`,
      )

      let page = 1
      let imported = 0
      let updated = 0
      let skippedExisting = 0
      let skippedNoOrderCode = 0

      while (true) {
        if (maxPages && page > maxPages) {
          break
        }

        const pageResult = await fetchOrdersPage({
          baseUrl,
          organizer,
          token,
          page,
          pretixEventId: pretixEventIdFilter || undefined,
          statuses: statusFilter.length > 0 ? statusFilter : undefined,
        })

        for (const order of pageResult.results) {
          const orderCode = toNonEmpty(order.code)

          if (!orderCode) {
            skippedNoOrderCode += 1
            continue
          }

          const email = toOptionalString(order.email)
          const pretixEventId = toOptionalString(order.event)

          const data = {
            organizer,
            orderCode,
            status: toOptionalString(order.status),
            testMode: Boolean(order.testmode),
            email: email ?? undefined,
            total: toOptionalNumber(order.total) ?? undefined,
            currency: toOptionalString(order.currency) ?? undefined,
            datetime: toOptionalIsoDate(order.datetime) ?? undefined,
            expires: toOptionalIsoDate(order.expires) ?? undefined,
            pretixEventId: pretixEventId ?? undefined,
            positions: order.positions ?? undefined,
            pretixPayload: order,
            lastImportedAt: new Date().toISOString(),
          }

          const existingResult = await req.payload.find({
            collection: 'sommerfreizeitOrders',
            where: {
              orderCode: {
                equals: orderCode,
              },
            },
            limit: 1,
            depth: 0,
            pagination: false,
            overrideAccess: true,
          })

          const existing = (existingResult.docs[0] as SommerfreizeitOrderDoc | undefined) ?? null

          if (!existing) {
            await req.payload.create({
              collection: 'sommerfreizeitOrders',
              data,
              depth: 0,
              draft: false,
              overrideAccess: true,
            })

            imported += 1
            continue
          }

          if (!updateExisting) {
            skippedExisting += 1
            continue
          }

          await req.payload.update({
            collection: 'sommerfreizeitOrders',
            id: existing.id,
            data,
            depth: 0,
            draft: false,
            overrideAccess: true,
          })

          updated += 1
        }

        if (!pageResult.next) {
          break
        }

        page += 1
      }

      req.payload.logger.info(
        `Pretix order import finished (imported=${imported}, updated=${updated}, skippedExisting=${skippedExisting}, skippedNoOrderCode=${skippedNoOrderCode})`,
      )

      return {
        output: {
          imported,
          updated,
          skippedExisting,
          skippedNoOrderCode,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      req.payload.logger.error(`Error in importPretixOrders job: ${errorMessage}`)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
  inputSchema: [
    {
      name: 'maxPages',
      type: 'number',
      required: false,
    },
    {
      name: 'pretixEventId',
      type: 'text',
      required: false,
    },
    {
      name: 'statuses',
      type: 'text',
      required: false,
    },
    {
      name: 'updateExisting',
      type: 'checkbox',
      required: false,
      defaultValue: true,
    },
  ],
  retries: 2,
} satisfies import('payload').TaskConfig

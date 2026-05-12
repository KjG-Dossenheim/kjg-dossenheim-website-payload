import type { PayloadRequest } from 'payload'
import { z } from 'zod'

type SyncPretixStatusInput = {
  maxPages?: number
  pretixEventId?: string
  orderCode?: string
}

type PretixOrderSummary = {
  code: string
  status: string | null
  event: string | null
}

const pretixOrderSchema = z
  .object({
    code: z.string().optional(),
    status: z.string().nullable().optional(),
    event: z.union([z.string(), z.number()]).nullable().optional(),
  })

const pretixOrderListSchema = z
  .object({
    count: z.number().optional(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(pretixOrderSchema),
  })

function toNonEmpty(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
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

function normalizeOrderCode(value: unknown): string {
  return toNonEmpty(value).toUpperCase()
}

function mapPretixStatusToGerman(status: string | null): string {
  const normalized = toNonEmpty(status).toLowerCase()

  if (!normalized) {
    return 'unbekannt'
  }

  if (['p', 'paid'].includes(normalized)) {
    return 'bezahlt'
  }

  if (['n', 'pending'].includes(normalized)) {
    return 'offen'
  }

  if (['c', 'canceled', 'cancelled', 'e', 'expired'].includes(normalized)) {
    return 'storniert'
  }

  return 'unbekannt'
}

async function fetchOrdersPage(args: {
  baseUrl: string
  organizer: string
  token: string
  page: number
  pretixEventId?: string
}) {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/orders/`,
    args.baseUrl,
  )

  endpoint.searchParams.set('page', String(args.page))

  if (args.pretixEventId) {
    endpoint.searchParams.set('event', args.pretixEventId)
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

export const syncPretixStatusJob = {
  slug: 'syncPretixStatus',
  interfaceName: 'SyncPretixStatusJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    try {
      const jobInput = (input ?? {}) as SyncPretixStatusInput
      const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()
      const organizer = (process.env.NEXT_PUBLIC_PRETIX_ORGANIZER || '').trim()
      const token = (process.env.PRETIX_API_TOKEN || '').trim()
      const maxPages =
        typeof jobInput.maxPages === 'number' && Number.isFinite(jobInput.maxPages)
          ? Math.max(1, Math.floor(jobInput.maxPages))
          : undefined
      const pretixEventIdFilter = toNonEmpty(jobInput.pretixEventId)
      const orderCodeFilter = normalizeOrderCode(jobInput.orderCode)

      if (!organizer || !token) {
        throw new Error(
          'Missing NEXT_PUBLIC_PRETIX_ORGANIZER or PRETIX_API_TOKEN. Configure both environment variables.',
        )
      }

      req.payload.logger.info(
        `Starting Pretix status sync (organizer=${organizer}, pretixEventId=${pretixEventIdFilter || 'none'}, orderCode=${orderCodeFilter || 'none'})`,
      )

      let page = 1
      let fetchedOrders = 0
      let matchedRegistrations = 0
      let updatedRegistrations = 0
      let unchangedRegistrations = 0
      let skippedWithoutOrderCode = 0

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
        })

        const mappedOrders: PretixOrderSummary[] = pageResult.results
          .map((order) => ({
            code: normalizeOrderCode(order.code),
            status: toOptionalString(order.status),
            event: toOptionalString(order.event),
          }))
          .filter((order) => {
            if (!order.code) {
              skippedWithoutOrderCode += 1
              return false
            }

            if (orderCodeFilter && order.code !== orderCodeFilter) {
              return false
            }

            return true
          })

        fetchedOrders += mappedOrders.length

        for (const order of mappedOrders) {
          const mappedStatus = mapPretixStatusToGerman(order.status)

          const registrations = await req.payload.find({
            collection: 'sommerfreizeitAnmeldung',
            where: {
              pretixOrderCode: {
                equals: order.code,
              },
            },
            limit: 1000,
            depth: 0,
            pagination: false,
            overrideAccess: true,
          })

          if (registrations.docs.length === 0) {
            continue
          }

          matchedRegistrations += registrations.docs.length

          for (const registration of registrations.docs as Array<{
            id: string
            pretixStatus?: string | null
          }>) {
            if (toNonEmpty(registration.pretixStatus) === mappedStatus) {
              unchangedRegistrations += 1
              continue
            }

            await req.payload.update({
              collection: 'sommerfreizeitAnmeldung',
              id: registration.id,
              data: {
                pretixStatus: mappedStatus,
              },
              depth: 0,
              draft: false,
              overrideAccess: true,
            })

            updatedRegistrations += 1
          }
        }

        if (!pageResult.next) {
          break
        }

        page += 1
      }

      req.payload.logger.info(
        `Pretix status sync finished (fetchedOrders=${fetchedOrders}, matchedRegistrations=${matchedRegistrations}, updatedRegistrations=${updatedRegistrations}, unchangedRegistrations=${unchangedRegistrations}, skippedWithoutOrderCode=${skippedWithoutOrderCode})`,
      )

      return {
        output: {
          fetchedOrders,
          matchedRegistrations,
          updatedRegistrations,
          unchangedRegistrations,
          skippedWithoutOrderCode,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      req.payload.logger.error(`Error in syncPretixStatus job: ${errorMessage}`)

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
      name: 'orderCode',
      type: 'text',
      required: false,
    },
  ],
  retries: 2,
} as unknown as import('payload').TaskConfig

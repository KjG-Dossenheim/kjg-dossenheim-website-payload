import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import type { SommerfreizeitOrder } from '@/payload-types'
import {
  buildPretixEndpoint,
  fetchPretixPage,
  getPretixConfig,
  normalizeOrderCode,
  parseMaxPages,
  toOptionalNonEmpty,
} from '@/utilities/pretix'

type SyncPretixStatusInput = {
  maxPages?: number
  pretixEventId?: string
  orderCode?: string
}

type PretixOrderSummary = {
  code: string
  status: SommerfreizeitOrder['status']
  event: string | null
}

type SommerfreizeitAnmeldungDoc = {
  id: string
  pretixOrderCode: string
  pretixStatus?: string | null
}

const pretixOrderSchema = z
  .object({
    code: z.string().optional(),
    status: z.enum(['n', 'p', 'e', 'c']).optional(),
    event: z.union([z.string(), z.number()]).nullable().optional(),
  })

const pretixOrderListSchema = z
  .object({
    count: z.number().optional(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(pretixOrderSchema),
  })

async function fetchOrdersPage(args: {
  baseUrl: string
  organizer: string
  token: string
  page: number
  pretixEventId?: string
}) {
  const endpoint = buildPretixEndpoint({
    baseUrl: args.baseUrl,
    organizer: args.organizer,
    resource: 'orders',
    page: args.page,
    pretixEventId: args.pretixEventId,
  })

  const json = await fetchPretixPage<unknown>(endpoint, args.token)
  return pretixOrderListSchema.parse(json)
}

export const syncPretixStatusJob = {
  slug: 'syncPretixStatus',
  interfaceName: 'SyncPretixStatusJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    try {
      const jobInput = (input ?? {}) as SyncPretixStatusInput

      // Validate environment configuration early
      const { baseUrl, organizer, token } = getPretixConfig()

      const maxPages = parseMaxPages(jobInput.maxPages)
      const pretixEventIdFilter = toOptionalNonEmpty(jobInput.pretixEventId)
      const orderCodeFilter = normalizeOrderCode(jobInput.orderCode)

      req.payload.logger.info(
        `Starting Pretix status sync (organizer=${organizer}, pretixEventId=${pretixEventIdFilter || 'none'}, orderCode=${orderCodeFilter || 'none'})`,
      )

      let page = 1
      let fetchedOrders = 0
      let matchedRegistrations = 0
      let updatedRegistrations = 0
      let unchangedRegistrations = 0
      let skippedWithoutOrderCode = 0
      const pendingOrders: PretixOrderSummary[] = []

      while (true) {
        if (maxPages && page > maxPages) {
          break
        }

        const pageResult = await fetchOrdersPage({
          baseUrl,
          organizer,
          token,
          page,
          pretixEventId: pretixEventIdFilter,
        })

        const mappedOrders: PretixOrderSummary[] = pageResult.results
          .map((order) => ({
            code: normalizeOrderCode(order.code),
            status: order.status,
            event:
              typeof order.event === 'number'
                ? String(order.event)
                : (toOptionalNonEmpty(order.event) ?? null),
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
          pendingOrders.push(order)
        }

        if (!pageResult.next) {
          break
        }

        page += 1
      }

      const orderCodes = Array.from(new Set(pendingOrders.map((order) => order.code)))

      const registrationsResult = orderCodes.length
        ? await req.payload.find({
          collection: 'sommerfreizeitAnmeldung',
          where: {
            pretixOrderCode: {
              in: orderCodes,
            },
          },
          limit: orderCodes.length,
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })
        : { docs: [] as SommerfreizeitAnmeldungDoc[] }

      const registrationsByOrderCode = new Map<string, SommerfreizeitAnmeldungDoc[]>()

      for (const registration of registrationsResult.docs as SommerfreizeitAnmeldungDoc[]) {
        const normalizedOrderCode = normalizeOrderCode(registration.pretixOrderCode)

        const currentRegistrations = registrationsByOrderCode.get(normalizedOrderCode)
        if (currentRegistrations) {
          currentRegistrations.push(registration)
        } else {
          registrationsByOrderCode.set(normalizedOrderCode, [registration])
        }
      }

      for (const order of pendingOrders) {
        if (!order.status) {
          continue
        }

        const registrations = registrationsByOrderCode.get(order.code) ?? []

        if (registrations.length === 0) {
          continue
        }

        matchedRegistrations += registrations.length

        for (const registration of registrations) {
          if (normalizeOrderCode(registration.pretixStatus) === normalizeOrderCode(order.status)) {
            unchangedRegistrations += 1
            continue
          }

          await req.payload.update({
            collection: 'sommerfreizeitAnmeldung',
            id: registration.id,
            data: {
              pretixStatus: order.status,
            },
            depth: 0,
            draft: false,
            overrideAccess: true,
          })

          updatedRegistrations += 1
        }
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

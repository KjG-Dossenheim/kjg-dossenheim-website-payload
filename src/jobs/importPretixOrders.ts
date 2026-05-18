import type { PayloadRequest } from 'payload'
import { pretixOrderListSchema } from '@/types/pretixSchema'

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
      const token = (process.env.PRETIX_API_TOKEN || '').trim()
      const maxPages =
        typeof jobInput.maxPages === 'number' && Number.isFinite(jobInput.maxPages)
          ? Math.max(1, Math.floor(jobInput.maxPages))
          : undefined
      const pretixEventIdFilter = toNonEmpty(jobInput.pretixEventId)
      const statusFilter = parseStatuses(toNonEmpty(jobInput.statuses))
      const updateExisting = jobInput.updateExisting ?? true

      req.payload.logger.info(
        `Starting Pretix order import (organizer=${organizer}, pretixEventId=${pretixEventIdFilter || 'none'}, statuses=${statusFilter.length > 0 ? statusFilter.join(',') : 'none'}, updateExisting=${updateExisting})`,
      )

      let page = 1
      let imported = 0
      let updated = 0
      let skippedExisting = 0

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

          const data = {
            organizer,
            orderCode: order.code,
            status: order.status,
            testMode: order.testmode,
            email: order.email,
            total: order.total,
            datetime: order.datetime,
            expires: order.expires,
            pretixEventId: order.event,
            positions: order.positions ?? undefined,
            pretixPayload: order,
            lastImportedAt: new Date().toISOString(),
            requireApproval: order.require_approval,
          }

          const existingResult = await req.payload.find({
            collection: 'sommerfreizeitOrders',
            where: {
              orderCode: {
                equals: order.code,
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
        `Pretix order import finished (imported=${imported}, updated=${updated}, skippedExisting=${skippedExisting})`,
      )

      return {
        output: {
          imported,
          updated,
          skippedExisting,
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

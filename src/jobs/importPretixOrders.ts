import type { Payload, PayloadRequest } from 'payload'
import { pretixOrderListSchema, type PretixOrder } from '@/types/pretixSchema'
import {
  buildPretixEndpoint,
  fetchPretixPage,
  getPretixConfig,
  normalizeOrderCode,
  parseMaxPages,
  parseStatuses,
  toNonEmpty,
  toOptionalNonEmpty,
} from '@/utilities/pretix'

type ImportPretixOrdersInput = {
  maxPages?: number
  pretixEventId?: string
  statuses?: string
  updateExisting?: boolean
}

type SommerfreizeitOrderDoc = {
  id: string
  orderCode: string
}

/** Fetches a single page of orders from the Pretix API, validated against the orders schema. */
async function fetchOrdersPage(args: {
  baseUrl: string
  organizer: string
  token: string
  page: number
  pretixEventId?: string
  statuses?: string[]
}) {
  const endpoint = buildPretixEndpoint({
    baseUrl: args.baseUrl,
    organizer: args.organizer,
    resource: 'orders',
    page: args.page,
    pretixEventId: args.pretixEventId,
    statuses: args.statuses,
  })

  const json = await fetchPretixPage<unknown>(endpoint, args.token)
  return pretixOrderListSchema.parse(json)
}

/** Order data to persist, derived from PretixOrder fields plus organizer. */
type OrderCreateData = {
  organizer: string
  orderCode: string
  status: PretixOrder['status']
  testMode: PretixOrder['testmode']
  email: PretixOrder['email']
  total: PretixOrder['total']
  datetime: PretixOrder['datetime']
  expires: PretixOrder['expires']
  pretixEventId: PretixOrder['event']
  requireApproval: PretixOrder['require_approval']
}

/** Tracking info for an order that was created or updated, used for relationship resolution. */
type OrderTrackingInfo = {
  id: string
  orderCode: string
  pretixEventId: string | undefined
}

/**
 * Creates a batch of new order documents in parallel.
 * Returns the count of successfully created orders and their tracking info.
 */
async function batchCreateOrders(
  payload: Payload,
  orders: OrderCreateData[],
  errors: string[],
): Promise<{ created: number; createdOrders: OrderTrackingInfo[] }> {
  if (orders.length === 0) {
    return { created: 0, createdOrders: [] }
  }

  const results = await Promise.allSettled(
    orders.map((data) =>
      payload.create({
        collection: 'sommerfreizeitOrders',
        data,
        depth: 0,
        draft: false,
        overrideAccess: true,
      }),
    ),
  )

  let created = 0
  const createdOrders: OrderTrackingInfo[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      created += 1
      const doc = result.value as { id: string; orderCode: string; pretixEventId?: string }
      createdOrders.push({
        id: doc.id,
        orderCode: doc.orderCode,
        pretixEventId: doc.pretixEventId ?? undefined,
      })
    } else {
      errors.push(`Create failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
    }
  }

  return { created, createdOrders }
}

/**
 * Updates a batch of existing order documents in parallel.
 * Returns the count of successfully updated orders.
 */
async function batchUpdateOrders(
  payload: Payload,
  updates: Array<{
    id: string
    data: Record<string, unknown>
  }>,
  errors: string[],
): Promise<number> {
  if (updates.length === 0) {
    return 0
  }

  const results = await Promise.allSettled(
    updates.map(({ id, data }) =>
      payload.update({
        collection: 'sommerfreizeitOrders',
        id,
        data,
        depth: 0,
        draft: false,
        overrideAccess: true,
      }),
    ),
  )

  let updated = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      updated += 1
    } else {
      errors.push(`Update failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
    }
  }

  return updated
}

/**
 * Resolves the `event` relationship for a batch of orders by looking up
 * `sommerfreizeitEvents` documents matching each order's `pretixEventId`.
 */
async function batchResolveEventRelationships(
  payload: Payload,
  orders: OrderTrackingInfo[],
  errors: string[],
): Promise<number> {
  if (orders.length === 0) {
    return 0
  }

  // Collect unique non-empty pretixEventIds
  const pretixEventIds = Array.from(
    new Set(
      orders
        .map((o) => o.pretixEventId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  )

  if (pretixEventIds.length === 0) {
    return 0
  }

  // Look up matching events
  const eventsResult = await payload.find({
    collection: 'sommerfreizeitEvents',
    where: {
      pretixEventId: {
        in: pretixEventIds,
      },
    },
    limit: pretixEventIds.length,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  // Build lookup: pretixEventId → event document id
  const eventIdByPretixId = new Map<string, string>()

  for (const event of eventsResult.docs) {
    const pretixId = (event as { pretixEventId?: string }).pretixEventId

    if (pretixId && !eventIdByPretixId.has(pretixId)) {
      eventIdByPretixId.set(pretixId, event.id as string)
    }
  }

  // Batch-update orders with the resolved event
  const updates = orders
    .filter((o) => o.pretixEventId && eventIdByPretixId.has(o.pretixEventId))
    .map((o) => ({
      id: o.id,
      data: { event: eventIdByPretixId.get(o.pretixEventId!) },
    }))

  if (updates.length === 0) {
    return 0
  }

  const results = await Promise.allSettled(
    updates.map(({ id, data }) =>
      payload.update({
        collection: 'sommerfreizeitOrders',
        id,
        data,
        depth: 0,
        draft: false,
        overrideAccess: true,
      }),
    ),
  )

  let resolved = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      resolved += 1
    } else {
      errors.push(`Event resolution failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
    }
  }

  return resolved
}

/**
 * Resolves the `sommerfreizeitAnmeldungen` relationship for a batch of orders
 * by looking up `sommerfreizeitAnmeldung` documents matching each order's `orderCode`.
 */
async function batchResolveAnmeldungenRelationships(
  payload: Payload,
  orders: OrderTrackingInfo[],
  errors: string[],
): Promise<number> {
  if (orders.length === 0) {
    return 0
  }

  const orderCodes = orders
    .map((o) => o.orderCode)
    .filter((code) => code.length > 0)

  if (orderCodes.length === 0) {
    return 0
  }

  // Look up Anmeldungen that reference any of these order codes
  const anmeldungenResult = await payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      pretixOrderCode: {
        in: orderCodes,
      },
    },
    limit: 0, // fetch all matching
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  // Group Anmeldung IDs by order code
  const anmeldungIdsByOrderCode = new Map<string, string[]>()

  for (const anmeldung of anmeldungenResult.docs) {
    const pretixOrderCode = normalizeOrderCode(
      (anmeldung as { pretixOrderCode?: string }).pretixOrderCode,
    )

    if (!pretixOrderCode) {
      continue
    }

    const list = anmeldungIdsByOrderCode.get(pretixOrderCode)

    if (list) {
      list.push(anmeldung.id as string)
    } else {
      anmeldungIdsByOrderCode.set(pretixOrderCode, [anmeldung.id as string])
    }
  }

  // Build updates: each order gets the list of Anmeldung IDs matching its orderCode
  const updates = orders.map((o) => ({
    id: o.id,
    data: {
      sommerfreizeitAnmeldungen: anmeldungIdsByOrderCode.get(o.orderCode) ?? [],
    },
  }))

  if (updates.length === 0) {
    return 0
  }

  const results = await Promise.allSettled(
    updates.map(({ id, data }) =>
      payload.update({
        collection: 'sommerfreizeitOrders',
        id,
        data,
        depth: 0,
        draft: false,
        overrideAccess: true,
      }),
    ),
  )

  let linked = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      linked += 1
    } else {
      errors.push(`Anmeldungen resolution failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
    }
  }

  return linked
}

export const importPretixOrdersJob = {
  slug: 'importPretixOrders',
  interfaceName: 'ImportPretixOrdersJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    const errors: string[] = []

    try {
      const jobInput = (input ?? {}) as ImportPretixOrdersInput

      // Validate environment configuration early
      const { baseUrl, organizer, token } = getPretixConfig()

      const maxPages = parseMaxPages(jobInput.maxPages)
      const pretixEventId = toOptionalNonEmpty(jobInput.pretixEventId)
      const statusFilter = parseStatuses(
        toNonEmpty(jobInput.statuses),
        req.payload.logger,
      )
      const updateExisting = jobInput.updateExisting ?? true

      req.payload.logger.info(
        `Starting Pretix order import (organizer=${organizer}, pretixEventId=${pretixEventId || 'none'}, statuses=${statusFilter.length > 0 ? statusFilter.join(',') : 'none'}, updateExisting=${updateExisting})`,
      )

      // ── Phase 1: Fetch all pages ──────────────────────────────────────
      let page = 1
      let imported = 0
      let updated = 0
      let skippedExisting = 0
      const allOrders: Awaited<ReturnType<typeof fetchOrdersPage>>['results'] = []

      while (true) {
        if (maxPages !== undefined && page > maxPages) {
          break
        }

        const pageResult = await fetchOrdersPage({
          baseUrl,
          organizer,
          token,
          page,
          pretixEventId,
          statuses: statusFilter.length > 0 ? statusFilter : undefined,
        })

        for (const order of pageResult.results) {
          allOrders.push(order)
        }

        if (!pageResult.next) {
          break
        }

        page += 1
      }

      // ── Phase 2: Look up existing orders ──────────────────────────────
      // Normalize order codes once; deduplicate with a Map for O(1) lookup
      const normalizedCodeToOrder = new Map<string, (typeof allOrders)[number]>()

      for (const order of allOrders) {
        const code = normalizeOrderCode(order.code)

        if (code) {
          // First occurrence wins (shouldn't have duplicates, but be safe)
          if (!normalizedCodeToOrder.has(code)) {
            normalizedCodeToOrder.set(code, order)
          }
        }
      }

      const orderCodes = Array.from(normalizedCodeToOrder.keys())

      const existingOrders = orderCodes.length > 0
        ? await req.payload.find({
          collection: 'sommerfreizeitOrders',
          where: {
            orderCode: {
              in: orderCodes,
            },
          },
          limit: orderCodes.length,
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })
        : { docs: [] as SommerfreizeitOrderDoc[] }

      const existingOrdersByCode = new Map(
        existingOrders.docs.map((doc) => [normalizeOrderCode(doc.orderCode), doc]),
      )

      // ── Phase 3: Batch-create new orders & batch-update existing ones ─
      const toCreate: Parameters<typeof batchCreateOrders>[1] = []
      const toUpdate: Parameters<typeof batchUpdateOrders>[1] = []

      for (const [orderCode, order] of normalizedCodeToOrder) {
        const data = {
          organizer,
          orderCode,
          status: order.status,
          testMode: order.testmode,
          email: order.email,
          total: order.total,
          datetime: order.datetime,
          expires: order.expires,
          pretixEventId: order.event,
          requireApproval: order.require_approval,
        }

        const existing = existingOrdersByCode.get(orderCode) ?? null

        if (!existing) {
          toCreate.push(data)
        } else if (!updateExisting) {
          skippedExisting += 1
        } else {
          toUpdate.push({ id: existing.id, data })
        }
      }

      // Run creates and updates in parallel batches
      const [createResult, updatedCount] = await Promise.all([
        batchCreateOrders(req.payload, toCreate, errors),
        batchUpdateOrders(req.payload, toUpdate, errors),
      ])

      imported += createResult.created
      updated += updatedCount

      // Build combined tracking info for relationship resolution
      const updatedTracking: OrderTrackingInfo[] = toUpdate.map((u) => ({
        id: u.id,
        orderCode: normalizeOrderCode(u.data.orderCode as string),
        pretixEventId: typeof u.data.pretixEventId === 'string' ? u.data.pretixEventId : undefined,
      }))

      const allProcessedOrders: OrderTrackingInfo[] = [
        ...createResult.createdOrders,
        ...updatedTracking,
      ]

      // ── Phase 4: Resolve relationships (event + Anmeldungen) ───────────
      const [eventsResolved, anmeldungenLinked] = await Promise.all([
        batchResolveEventRelationships(req.payload, allProcessedOrders, errors),
        batchResolveAnmeldungenRelationships(req.payload, allProcessedOrders, errors),
      ])

      // ── Phase 5: Report results ───────────────────────────────────────
      const summaryParts = [
        `Pretix order import finished (imported=${imported}, updated=${updated}, skippedExisting=${skippedExisting})`,
      ]

      if (eventsResolved > 0 || anmeldungenLinked > 0) {
        summaryParts.push(
          `relationships resolved (events=${eventsResolved}, anmeldungen=${anmeldungenLinked})`,
        )
      }

      if (errors.length > 0) {
        summaryParts.push(`${errors.length} error(s) during import: ${errors.join('; ')}`)
      }

      req.payload.logger.info(summaryParts.join('. '))

      return {
        output: {
          imported,
          updated,
          skippedExisting,
          eventsResolved,
          anmeldungenLinked,
          errors: errors.length > 0 ? errors : undefined,
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

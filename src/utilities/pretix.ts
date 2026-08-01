/**
 * Shared utilities for Pretix API integration jobs.
 *
 * These helpers are used across multiple background jobs:
 * - importPretixOrders
 * - importPretixCustomers
 * - syncPretixStatus
 */

/** Known Pretix order status codes. */
// fallow-ignore-next-line unused-export
export const PRETIX_ORDER_STATUSES = ['n', 'p', 'e', 'c'] as const

/** Pretix order status code. */
export type PretixOrderStatus = (typeof PRETIX_ORDER_STATUSES)[number]

/**
 * Coerces a value to a non-empty, trimmed string.
 * Returns `''` for non-string or whitespace-only values.
 */
export function toNonEmpty(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

/**
 * Coerces a value to a trimmed string, returning `undefined` when empty.
 */
export function toOptionalNonEmpty(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Normalizes a Pretix order code: trims whitespace and uppercases.
 * Returns `''` for non-string or whitespace-only input.
 */
export function normalizeOrderCode(value: unknown): string {
  return toNonEmpty(value).toUpperCase()
}

/**
 * Parses and validates a comma-separated list of Pretix order statuses.
 * Silently drops invalid status values (logs a warning if a logger is provided).
 */
export function parseStatuses(
  value: string,
  logger?: { warn: (msg: string) => void },
): PretixOrderStatus[] {
  const statuses = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  const valid = statuses.filter((s): s is PretixOrderStatus =>
    (PRETIX_ORDER_STATUSES as readonly string[]).includes(s),
  )

  const invalid = statuses.filter(
    (s) => !(PRETIX_ORDER_STATUSES as readonly string[]).includes(s),
  )

  if (invalid.length > 0 && logger) {
    logger.warn(
      `Ignoring invalid Pretix status values: ${invalid.join(', ')}. Valid values: ${PRETIX_ORDER_STATUSES.join(', ')}`,
    )
  }

  return valid
}

/**
 * Reads and validates required Pretix environment variables.
 * Throws if organizer or token are missing/empty.
 */
export function getPretixConfig(): {
  baseUrl: string
  organizer: string
  token: string
} {
  const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()
  const organizer = (process.env.NEXT_PUBLIC_PRETIX_ORGANIZER || '').trim()
  const token = (process.env.PRETIX_API_TOKEN || '').trim()

  if (!organizer || !token) {
    throw new Error(
      'Missing NEXT_PUBLIC_PRETIX_ORGANIZER or PRETIX_API_TOKEN. Configure both environment variables.',
    )
  }

  return { baseUrl, organizer, token }
}

/**
 * Builds a Pretix API endpoint URL for order or customer list endpoints.
 *
 * @param extraParams - Additional query parameters (e.g. `{ email: 'user@example.com' }`)
 */
export function buildPretixEndpoint(
  args: {
    baseUrl: string
    organizer: string
    resource: 'orders' | 'customers'
    page: number
    pretixEventId?: string
    statuses?: string[]
    extraParams?: Record<string, string>
  },
): URL {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/${encodeURIComponent(args.resource)}/`,
    args.baseUrl,
  )

  endpoint.searchParams.set('page', String(args.page))

  if (args.pretixEventId) {
    endpoint.searchParams.set('event', args.pretixEventId)
  }

  for (const status of args.statuses ?? []) {
    endpoint.searchParams.append('status', status)
  }

  for (const [key, value] of Object.entries(args.extraParams ?? {})) {
    endpoint.searchParams.set(key, value)
  }

  return endpoint
}

/**
 * Fetches a Pretix API page, validates the HTTP response, and returns parsed JSON.
 * Throws on non-OK responses with the response body included in the error message.
 */
export async function fetchPretixPage<T>(
  endpoint: URL,
  token: string,
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${token}`,
    },
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`Pretix API returned ${response.status}: ${bodyText}`)
  }

  return response.json() as T
}

/**
 * Parses a maxPages input, clamping to a positive integer or undefined.
 */
export function parseMaxPages(input: unknown): number | undefined {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Math.max(1, Math.floor(input))
  }

  return undefined
}

/**
 * Background job for importing customers from Pretix ticketing system
 * into the Sommerfreizeit (summer camp) user database.
 *
 * This job periodically syncs customer data from Pretix to keep our
 * Sommerfreizeit user database up-to-date with registration information.
 */
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import {
  ensureSommerfreizeitUser,
  normalizeSommerfreizeitEmail,
} from '@/utilities/sommerfreizeitAccount'

// Zod schema to validate individual customer objects from Pretix API
const pretixCustomerSchema = z.object({
  identifier: z.string().optional(), // Pretix customer identifier
  email: z.string().nullable().optional(), // Customer email address
  phone: z.string().nullable().optional(), // Phone number
  name: z.string().nullable().optional(), // Full display name
  name_parts: z.record(z.string(), z.string()).nullable().optional(), // Parsed name components (given_name, family_name, etc.)
  is_active: z.boolean().optional(), // Whether the customer is active
  is_verified: z.boolean().optional(), // Whether email is verified
})

// Zod schema to validate the paginated customer list response from Pretix API
const pretixCustomerListSchema = z.object({
  count: z.number().optional(), // Total number of customers
  next: z.string().nullable().optional(), // URL for next page (null if no more pages)
  results: z.array(pretixCustomerSchema), // Array of customers on this page
})

// Inferred type from pretixCustomerSchema
type PretixCustomer = z.infer<typeof pretixCustomerSchema>

// Input parameters for the import job
type ImportPretixCustomersInput = {
  customerEmail?: string // Optional: filter by specific email
  maxPages?: number // Optional: limit number of pages to fetch
  updateExisting?: boolean // Optional: whether to update existing users
}

// Minimal type for Sommerfreizeit user documents we fetch from database
type SommerfreizeitUserDoc = {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  phone?: string | null
  emailVerified?: boolean | null
  pretix_Identifier?: string | null // Stores the Pretix customer identifier
}

/**
 * Converts a value to a non-empty string.
 * Returns empty string if value is not a string or is whitespace-only.
 */
function toNonEmpty(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

/**
 * Splits a display name string into first and last name.
 * Uses the first word as first name and remaining words as last name.
 * Falls back to empty strings if no valid name parts found.
 */
function splitDisplayName(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ')

  if (!normalized) {
    return { firstName: '', lastName: '' }
  }

  const parts = normalized.split(' ')

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

/**
 * Extracts first and last name from a Pretix customer.
 * Tries to use name_parts (structured data) first, with multiple field name variations.
 * Falls back to splitting the display name if structured parts aren't available.
 */
function buildNameParts(customer: PretixCustomer) {
  const parts = customer.name_parts ?? {}
  // Try multiple naming conventions for first name
  const firstNameFromParts =
    toNonEmpty(parts.given_name) ||
    toNonEmpty(parts.givenName) ||
    toNonEmpty(parts.first_name) ||
    toNonEmpty(parts.firstName)
  // Try multiple naming conventions for last name
  const lastNameFromParts =
    toNonEmpty(parts.family_name) ||
    toNonEmpty(parts.familyName) ||
    toNonEmpty(parts.last_name) ||
    toNonEmpty(parts.lastName)

  if (firstNameFromParts || lastNameFromParts) {
    return {
      firstName: firstNameFromParts,
      lastName: lastNameFromParts,
    }
  }

  // Fall back to parsing the display name
  return splitDisplayName(toNonEmpty(customer.name))
}

/**
 * Builds a display name from first and last name components.
 * Falls back to the email local part (before @) if no name is available.
 */
function buildDisplayName(firstName: string, lastName: string, fallbackEmail: string) {
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName) {
    return fullName
  }

  // Fall back to the part before @ in the email address
  return fallbackEmail.split('@')[0] || fallbackEmail
}

/**
 * Fetches a single page of customers from the Pretix API.
 * Handles authentication, pagination, and optional email filtering.
 */
async function fetchCustomerPage(args: {
  baseUrl: string
  organizer: string
  token: string
  page: number
  email?: string // Optional: filter by specific email
}) {
  const endpoint = new URL(
    `/api/v1/organizers/${encodeURIComponent(args.organizer)}/customers/`,
    args.baseUrl,
  )

  endpoint.searchParams.set('page', String(args.page))

  // Add email filter if provided
  if (args.email) {
    endpoint.searchParams.set('email', args.email)
  }

  // Fetch with Pretix API token authentication
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
  // Validate response against expected schema
  return pretixCustomerListSchema.parse(json)
}

/**
 * Payload background job that imports Pretix customers into the Sommerfreizeit database.
 *
 * Behavior:
 * - Fetches paginated customer data from Pretix API
 * - Creates new Sommerfreizeit users for customers not yet in the database
 * - Optionally updates existing users with latest data from Pretix
 * - Skips inactive customers and customers without email addresses
 *
 * Input parameters:
 * - email: Filter import to a specific email address
 * - maxPages: Limit the number of pages to fetch (for testing/debugging)
 * - updateExisting: Whether to update existing users with new Pretix data
 */
export const importPretixCustomersJob = {
  slug: 'importPretixCustomers',
  interfaceName: 'ImportPretixCustomersJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    try {
      // Parse and validate job input parameters
      const jobInput = (input ?? {}) as ImportPretixCustomersInput
      const baseUrl = (process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.eu').trim()
      const organizer = (process.env.NEXT_PUBLIC_PRETIX_ORGANIZER || '').trim()
      const token = (process.env.PRETIX_API_TOKEN || '').trim()
      const maxPages =
        typeof jobInput.maxPages === 'number' && Number.isFinite(jobInput.maxPages)
          ? Math.max(1, Math.floor(jobInput.maxPages))
          : undefined
      const emailFilter = toNonEmpty(jobInput.customerEmail)
      const updateExisting = Boolean(jobInput.updateExisting)

      // Validate required Pretix configuration
      if (!organizer || !token) {
        throw new Error(
          'Missing NEXT_PUBLIC_PRETIX_ORGANIZER or PRETIX_API_TOKEN. Configure both environment variables.',
        )
      }

      req.payload.logger.info(
        `Starting Pretix customer import (organizer=${organizer}, emailFilter=${emailFilter || 'none'}, updateExisting=${updateExisting})`,
      )

      // Initialize counters for import statistics
      let page = 1
      let imported = 0 // New users created
      let updated = 0 // Existing users updated
      let skippedNoEmail = 0 // Skipped: no email address
      let skippedInactive = 0 // Skipped: is_active = false
      let skippedExisting = 0 // Skipped: already exists and updateExisting=false
      const preparedCustomers: Array<{
        customer: PretixCustomer
        normalizedEmail: string
        firstName: string
        lastName: string
        identifier: string | null
      }> = []
      const normalizedEmails = new Set<string>()

      // Fetch customers page by page
      while (true) {
        // Stop if we've reached the max page limit
        if (maxPages && page > maxPages) {
          break
        }

        // Fetch the next page of customers from Pretix
        const pageResult = await fetchCustomerPage({
          baseUrl,
          organizer,
          token,
          page,
          email: emailFilter || undefined,
        })

        // Process each customer on this page
        for (const customer of pageResult.results) {
          const email = toNonEmpty(customer.email)

          // Skip customers without email addresses
          if (!email) {
            skippedNoEmail += 1
            continue
          }

          // Skip inactive customers
          if (customer.is_active === false) {
            skippedInactive += 1
            continue
          }

          // Normalize email and parse name components
          const normalizedEmail = normalizeSommerfreizeitEmail(email)
          const nameParts = buildNameParts(customer)
          const firstName = nameParts.firstName || normalizedEmail.split('@')[0] || 'Pretix'
          const lastName = nameParts.lastName || 'Kunde'
          const identifier = toNonEmpty(customer.identifier) || null

          normalizedEmails.add(normalizedEmail)
          preparedCustomers.push({
            customer,
            normalizedEmail,
            firstName,
            lastName,
            identifier,
          })
        }

        // Stop pagination if there's no next page
        if (!pageResult.next) {
          break
        }

        // Move to next page
        page += 1
      }

      const existingUsers = normalizedEmails.size
        ? await req.payload.find({
          collection: 'sommerfreizeitUsers',
          where: {
            email: {
              in: Array.from(normalizedEmails),
            },
          },
          limit: normalizedEmails.size,
          depth: 0,
          pagination: false,
        })
        : { docs: [] as SommerfreizeitUserDoc[] }

      const existingUsersByEmail = new Map(
        existingUsers.docs.map((doc) => [normalizeSommerfreizeitEmail(doc.email), doc]),
      )

      for (const { customer, normalizedEmail, firstName, lastName, identifier } of preparedCustomers) {
        const existingDoc = existingUsersByEmail.get(normalizedEmail) ?? null

        // Create new user if not found in database
        if (!existingDoc) {
          const created = await ensureSommerfreizeitUser(req.payload, {
            email: normalizedEmail,
            firstName,
            lastName,
            phone: toNonEmpty(customer.phone) || null,
            pretix_Identifier: identifier,
          })

          if (created.created) {
            imported += 1
          }

          continue
        }

        // Skip existing users if updateExisting is false
        if (!updateExisting) {
          skippedExisting += 1
          continue
        }

        // Prepare updates for the existing user
        const updateData: Record<string, unknown> = {}
        const nextDisplayName = buildDisplayName(firstName, lastName, normalizedEmail)
        const phone = toNonEmpty(customer.phone)

        // Only add fields to updateData if they've changed
        if (firstName && firstName !== toNonEmpty(existingDoc.firstName)) {
          updateData.firstName = firstName
        }

        if (lastName && lastName !== toNonEmpty(existingDoc.lastName)) {
          updateData.lastName = lastName
        }

        if (nextDisplayName && nextDisplayName !== toNonEmpty(existingDoc.name)) {
          updateData.name = nextDisplayName
        }

        if (phone && phone !== toNonEmpty(existingDoc.phone)) {
          updateData.phone = phone
        }

        // Mark email as verified if it's verified in Pretix
        if (customer.is_verified && !existingDoc.emailVerified) {
          updateData.emailVerified = true
        }

        if (identifier && identifier !== toNonEmpty(existingDoc.pretix_Identifier)) {
          updateData.pretix_Identifier = identifier
        }

        // If nothing changed, skip the update
        if (Object.keys(updateData).length === 0) {
          skippedExisting += 1
          continue
        }

        // Update the user with new data from Pretix
        await req.payload.update({
          collection: 'sommerfreizeitUsers',
          id: existingDoc.id,
          data: updateData,
        })

        updated += 1
      }

      req.payload.logger.info(
        `Pretix customer import finished (imported=${imported}, updated=${updated}, skippedExisting=${skippedExisting}, skippedNoEmail=${skippedNoEmail}, skippedInactive=${skippedInactive})`,
      )

      return {
        output: {
          imported,
          updated,
          skippedExisting,
          skippedNoEmail,
          skippedInactive,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      req.payload.logger.error(`Error in importPretixCustomers job: ${errorMessage}`)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
  inputSchema: [
    {
      name: 'customerEmail',
      type: 'text',
      required: false,
    },
    {
      name: 'maxPages',
      type: 'number',
      required: false,
    },
    {
      name: 'updateExisting',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
  ],
  retries: 2,
} as import('payload').TaskConfig
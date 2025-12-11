import type { TaskConfig } from 'payload'

/**
 * One-time migration job to move waitlist data from registration fields
 * to the new knallbonbonWaitlist collection
 *
 * This job should be run once after deploying the new waitlist collection.
 * It will:
 * 1. Find all registrations where isWaitlist = true
 * 2. Create corresponding entries in knallbonbonWaitlist collection
 * 3. Preserve all timestamps and status information
 * 4. Skip entries that have already been migrated
 *
 * To run this job manually:
 * ```typescript
 * import { getPayload } from 'payload'
 * import config from '@payload-config'
 *
 * const payload = await getPayload({ config })
 * await payload.jobs.queue({
 *   task: 'migrateWaitlistData',
 *   input: {},
 * })
 * ```
 */
export const migrateWaitlistDataJob: TaskConfig = {
  slug: 'migrateWaitlistData',
  interfaceName: 'MigrateWaitlistData',
  handler: async ({ req }) => {
    try {
      req.payload.logger.info('[Migration] Starting waitlist data migration...')

      // Find all registrations currently on waitlist
      const waitlistRegistrations = await req.payload.find({
        collection: 'knallbonbonRegistration',
        where: {
          isWaitlist: { equals: true },
        },
        limit: 1000,
        depth: 0,
      })

      req.payload.logger.info(
        `[Migration] Found ${waitlistRegistrations.docs.length} registrations to migrate`,
      )

      let migrated = 0
      let skipped = 0
      const errors: string[] = []

      for (const registration of waitlistRegistrations.docs) {
        try {
          const eventId =
            typeof registration.event === 'string' ? registration.event : registration.event?.id

          if (!eventId) {
            req.payload.logger.warn(`[Migration] Skipping registration ${registration.id}: no event`)
            skipped++
            continue
          }

          // Fetch event to get title
          let eventTitle = 'Unknown Event'
          try {
            const event = await req.payload.findByID({
              collection: 'knallbonbonEvents',
              id: eventId,
            })
            eventTitle = event.title || eventTitle
          } catch (error) {
            req.payload.logger.warn(
              `[Migration] Could not fetch event ${eventId}, using default title`,
            )
          }

          // Check if waitlist entry already exists for this registration
          const existing = await req.payload.find({
            collection: 'knallbonbonWaitlist',
            where: {
              registrationId: { equals: registration.id },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            req.payload.logger.info(
              `[Migration] Skipping registration ${registration.id}: already migrated`,
            )
            skipped++
            continue
          }

          // Determine status based on current state
          let status = 'pending'
          let expiredAt = null

          if (registration.confirmedAt) {
            status = 'confirmed'
          } else if (registration.promotionSentAt && registration.confirmationDeadline) {
            const now = new Date()
            const deadline = new Date(registration.confirmationDeadline)
            if (deadline < now) {
              status = 'expired'
              expiredAt = new Date().toISOString()
            } else {
              status = 'promoted'
            }
          }

          // Create waitlist entry with full data snapshot
          await req.payload.create({
            collection: 'knallbonbonWaitlist',
            data: {
              // Reference IDs
              registrationId: registration.id,
              eventId: eventId,
              eventTitle: eventTitle,

              // Parent/Guardian Information (full snapshot)
              parentName: `${registration.firstName} ${registration.lastName}`,
              firstName: registration.firstName,
              lastName: registration.lastName,
              email: registration.email,
              phone: registration.phone,
              address: registration.address || '',
              postalCode: registration.postalCode || '',
              city: registration.city || '',

              // Children (full array snapshot)
              children: registration.child || [],
              childrenCount: registration.child?.length || 0,

              // Waitlist Status
              status,
              queuePosition: 999999, // Will be recalculated by hook

              // Timestamps
              promotionSentAt: registration.promotionSentAt || undefined,
              confirmationDeadline: registration.confirmationDeadline || undefined,
              confirmedAt: registration.confirmedAt || undefined,
              expiredAt: expiredAt || undefined,
            },
          })

          migrated++
          req.payload.logger.info(
            `[Migration] Migrated registration ${registration.id} with status: ${status}`,
          )
        } catch (error) {
          const errorMsg = `Error migrating registration ${registration.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          req.payload.logger.error(`[Migration] ${errorMsg}`)
          errors.push(errorMsg)
        }
      }

      // Queue positions will be recalculated automatically by hooks

      req.payload.logger.info(
        `[Migration] Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors.length} errors`,
      )

      if (errors.length > 0) {
        req.payload.logger.warn(`[Migration] Errors encountered:\n${errors.join('\n')}`)
      }

      return {
        output: {
          migrated,
          skipped,
          errors: errors.length,
          total: waitlistRegistrations.docs.length,
          errorMessages: errors,
        },
      }
    } catch (error) {
      req.payload.logger.error('[Migration] Critical error in migration job:', error)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
  inputSchema: [],
  retries: 0, // Don't retry migration to avoid duplicates
}

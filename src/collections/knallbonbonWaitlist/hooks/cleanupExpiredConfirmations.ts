import type { PayloadRequest } from 'payload'
import { render } from '@react-email/render'
import { adminExpirationNotificationEmailTemplate } from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

/**
 * Cleanup expired waitlist promotion confirmations
 *
 * This function should be run as a scheduled job (daily at 1:00 AM recommended).
 * It finds waitlist entries where:
 * - Status is 'promoted'
 * - Confirmation deadline has passed
 * - Not yet confirmed
 *
 * For each expired confirmation:
 * - Update status to 'expired'
 * - Set expiredAt timestamp
 * - Send admin notification
 */
export async function cleanupExpiredConfirmations(payload: any): Promise<void> {
  try {
    payload.logger.info('[Waitlist] Starting cleanup of expired waitlist confirmations...')

    const now = new Date()

    // Find expired confirmations in the waitlist collection
    const expiredEntries = await payload.find({
      collection: 'knallbonbonWaitlist',
      where: {
        and: [
          { status: { equals: 'promoted' } },
          { confirmationDeadline: { less_than: now.toISOString() } },
        ],
      },
      limit: 100,
      depth: 1, // Populate event relationship
    })

    if (expiredEntries.docs.length === 0) {
      payload.logger.info('[Waitlist] No expired confirmations found')
      return
    }

    payload.logger.info(
      `[Waitlist] Found ${expiredEntries.docs.length} expired confirmation(s)`,
    )

    // Process each expired entry
    for (const entry of expiredEntries.docs) {
      try {
        // Get event data from relationship
        const eventTitle = typeof entry.event === 'object' ? entry.event.title : 'Unknown Event'

        // Update entry status to expired
        await payload.update({
          collection: 'knallbonbonWaitlist',
          id: entry.id,
          data: {
            status: 'expired',
            expiredAt: now.toISOString(),
          },
        })

        payload.logger.info(
          `[Waitlist] Set entry ${entry.id} to expired status (${entry.email})`,
        )

        // Send admin notification using self-contained waitlist data
        try {
          // Create a registration-like object from waitlist data for email template
          const registrationData = {
            firstName: entry.firstName,
            lastName: entry.lastName,
            email: entry.email,
            child: entry.children,
          }

          const adminNotificationHtml = await render(
            adminExpirationNotificationEmailTemplate(registrationData, eventTitle),
          )

          await payload.sendEmail({
            to: 'ben.wallner@kjg-dossenheim.org',
            subject: `Bestätigung abgelaufen: ${eventTitle}`,
            html: adminNotificationHtml,
          })

          payload.logger.info('[Waitlist] Sent admin expiration notification')
        } catch (error) {
          payload.logger.error(
            `[Waitlist] Failed to send admin expiration notification: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      } catch (error) {
        payload.logger.error(
          `[Waitlist] Failed to process expired entry ${entry.id}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    payload.logger.info(
      `[Waitlist] Cleanup complete: ${expiredEntries.docs.length} expired confirmation(s) processed`,
    )
  } catch (error) {
    payload.logger.error(
      `[Waitlist] Error in cleanupExpiredConfirmations: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Wrapper for use in Payload hooks
 */
export async function cleanupExpiredConfirmationsHook(req: PayloadRequest): Promise<void> {
  await cleanupExpiredConfirmations(req.payload)
}

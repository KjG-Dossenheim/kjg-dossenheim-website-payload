import type { PayloadRequest } from 'payload'
import { render } from '@react-email/render'
import { adminExpirationNotificationEmailTemplate } from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'
import { promoteFromWaitlist } from './promoteFromWaitlist'

/**
 * Cleanup expired waitlist promotion confirmations
 *
 * This function should be run as a scheduled job (daily at 1:00 AM recommended).
 * It finds registrations where:
 * - They're on the waitlist
 * - They were promoted (promotionSentAt is set)
 * - They haven't confirmed (confirmedAt is null)
 * - The deadline has passed (confirmationDeadline < now)
 *
 * For each expired confirmation:
 * - Reset promotion fields
 * - Send admin notification
 * - Trigger promotion for next person in line
 */
export async function cleanupExpiredConfirmations(
  payload: any,
  req?: PayloadRequest,
): Promise<void> {
  try {
    console.log('Starting cleanup of expired waitlist confirmations...')

    const now = new Date()

    // Find expired confirmations
    const expiredRegistrations = await payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        and: [
          {
            isWaitlist: {
              equals: true,
            },
          },
          {
            promotionSentAt: {
              not_equals: null,
            },
          },
          {
            confirmedAt: {
              equals: null,
            },
          },
          {
            confirmationDeadline: {
              less_than: now.toISOString(),
            },
          },
        ],
      },
      depth: 1, // Include event relationship
      limit: 100,
    })

    if (expiredRegistrations.docs.length === 0) {
      console.log('No expired confirmations found')
      return
    }

    console.log(`Found ${expiredRegistrations.docs.length} expired confirmation(s)`)

    // Track unique events that need promotion check
    const eventsToPromote = new Set<string>()

    // Process each expired registration
    for (const registration of expiredRegistrations.docs) {
      try {
        const event = typeof registration.event === 'object' ? registration.event : null
        const eventId = typeof registration.event === 'string' ? registration.event : event?.id
        const eventTitle = event?.title || 'Unknown Event'

        // Reset promotion fields
        await payload.update({
          collection: 'knallbonbonRegistration',
          id: registration.id,
          data: {
            promotionSentAt: null,
            confirmationDeadline: null,
            // Keep isWaitlist: true (they go back to regular waitlist)
          },
        })

        console.log(
          `Reset expired confirmation for registration ${registration.id} (${registration.email})`,
        )

        // Send admin notification
        try {
          const adminNotificationHtml = await render(
            adminExpirationNotificationEmailTemplate(registration, eventTitle),
          )

          await payload.sendEmail({
            to: 'ben.wallner@kjg-dossenheim.org',
            subject: `Bestätigung abgelaufen: ${eventTitle}`,
            html: adminNotificationHtml,
          })

          console.log('Sent admin expiration notification')
        } catch (error) {
          console.error('Failed to send admin expiration notification:', error)
        }

        // Track event for promotion check
        if (eventId) {
          eventsToPromote.add(eventId)
        }
      } catch (error) {
        console.error(`Failed to process expired registration ${registration.id}:`, error)
      }
    }

    // Trigger promotion for affected events
    if (eventsToPromote.size > 0 && req) {
      console.log(`Triggering waitlist promotion for ${eventsToPromote.size} event(s)`)
      for (const eventId of eventsToPromote) {
        await promoteFromWaitlist(req, eventId)
      }
    }

    console.log(
      `Cleanup complete: ${expiredRegistrations.docs.length} expired confirmation(s) processed`,
    )
  } catch (error) {
    console.error('Error in cleanupExpiredConfirmations:', error)
  }
}

/**
 * Wrapper for use in Payload hooks
 */
export async function cleanupExpiredConfirmationsHook(req: PayloadRequest): Promise<void> {
  await cleanupExpiredConfirmations(req.payload, req)
}

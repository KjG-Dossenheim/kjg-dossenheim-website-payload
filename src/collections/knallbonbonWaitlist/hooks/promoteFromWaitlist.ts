import type { PayloadRequest } from 'payload'
import { createHash } from 'crypto'
import { render } from '@react-email/render'
import {
  spotAvailableEmailTemplate,
  adminPromotionNotificationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

/**
 * Generate secure confirmation token for waitlist promotion
 * Now uses waitlist entry ID instead of registration ID
 */
function generateConfirmationToken(waitlistEntryId: string, createdAt: string): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined')
  }
  return createHash('sha256').update(`${waitlistEntryId}${secret}${createdAt}`).digest('hex')
}

/**
 * Promote eligible waitlist entries when spots become available
 *
 * This function:
 * 1. Calculates available spots for an event
 * 2. Finds waitlist entries that can be promoted (FIFO order via queuePosition)
 * 3. Ensures families aren't split (all children or none)
 * 4. Sends confirmation emails with secure tokens (based on waitlist entry ID)
 * 5. Notifies admins of promotions
 * 6. Updates waitlist entry status to 'promoted'
 */
export async function promoteFromWaitlist(req: PayloadRequest, eventId: string): Promise<void> {
  try {
    // Fetch event details
    const event = await req.payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event.maxParticipants) {
      req.payload.logger.info(
        `[Waitlist] Event ${eventId} has no maxParticipants set, skipping promotion`,
      )
      return
    }

    // Fetch settings to check if auto-promotion is enabled
    const settings = await req.payload.findGlobal({
      slug: 'knallbonbonSettings',
    })

    if (!settings.enableAutoPromotion) {
      req.payload.logger.info('[Waitlist] Auto-promotion is disabled in settings, skipping')
      return
    }

    const confirmationDeadlineDays = settings.confirmationDeadlineDays || 7

    // Calculate available spots
    const currentParticipantCount = event.participantCount || 0
    let availableSpots = event.maxParticipants - currentParticipantCount

    if (availableSpots <= 0) {
      req.payload.logger.info(
        `[Waitlist] Event ${eventId} has no available spots, skipping promotion`,
      )
      return
    }

    req.payload.logger.info(
      `[Waitlist] Event ${event.title} has ${availableSpots} available spots, checking waitlist...`,
    )

    // Fetch waitlist entries - self-contained, no relationships needed
    const waitlistEntries = await req.payload.find({
      collection: 'knallbonbonWaitlist',
      where: {
        and: [
          { eventId: { equals: eventId } },
          {
            or: [
              { status: { equals: 'pending' } },
              { status: { equals: 'expired' } }, // Retry expired promotions
            ],
          },
        ],
      },
      sort: 'queuePosition', // FIFO order
      limit: 100,
    })

    if (waitlistEntries.docs.length === 0) {
      req.payload.logger.info(
        `[Waitlist] No eligible waitlist entries found for event ${event.title}`,
      )
      return
    }

    req.payload.logger.info(
      `[Waitlist] Found ${waitlistEntries.docs.length} eligible waitlist entries for event ${event.title}`,
    )

    // Process each waitlist entry in order
    const now = new Date()
    let promotedCount = 0

    for (const entry of waitlistEntries.docs) {
      if (availableSpots <= 0) {
        req.payload.logger.info('[Waitlist] No more available spots, stopping promotion')
        break
      }

      const childrenCount = entry.childrenCount || 0

      // Check if there are enough spots for ALL children
      if (childrenCount > availableSpots) {
        req.payload.logger.info(
          `[Waitlist] Skipping entry ${entry.id} (position ${entry.queuePosition}): needs ${childrenCount} spots but only ${availableSpots} available`,
        )
        continue // Skip this family, try next one
      }

      // This family can be promoted!
      const confirmationDeadline = new Date()
      confirmationDeadline.setDate(confirmationDeadline.getDate() + confirmationDeadlineDays)

      // Generate secure token based on waitlist entry ID
      const token = generateConfirmationToken(entry.id, entry.createdAt)

      // Build confirmation URL using waitlist entry ID
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const confirmationUrl = `${siteUrl}/knallbonbon/bestatigen/${entry.id}?token=${token}`

      // Update waitlist entry to promoted status
      await req.payload.update({
        collection: 'knallbonbonWaitlist',
        id: entry.id,
        data: {
          status: 'promoted',
          promotionSentAt: now.toISOString(),
          confirmationDeadline: confirmationDeadline.toISOString(),
        },
      })

      // Send email to parents using data from waitlist entry (self-contained)
      try {
        // Create a registration-like object from waitlist data for email template
        const registrationData = {
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
          child: entry.children,
        }

        const spotAvailableHtml = await render(
          spotAvailableEmailTemplate(
            registrationData,
            entry.eventTitle,
            confirmationUrl,
            confirmationDeadline,
          ),
        )

        await req.payload.sendEmail({
          to: entry.email,
          subject: `Gute Nachricht! Ein Platz ist frei geworden - ${entry.eventTitle}`,
          html: spotAvailableHtml,
        })

        req.payload.logger.info(`[Waitlist] Sent spot-available email to ${entry.email}`)
      } catch (error) {
        req.payload.logger.error(
          `[Waitlist] Failed to send spot-available email to ${entry.email}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      // Send admin notification
      try {
        const registrationData = {
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
          child: entry.children,
        }

        const adminNotificationHtml = await render(
          adminPromotionNotificationEmailTemplate(
            registrationData,
            entry.eventTitle,
            confirmationDeadline,
          ),
        )

        await req.payload.sendEmail({
          to: 'ben.wallner@kjg-dossenheim.org',
          subject: `Neue Wartelisten-Beförderung: ${entry.eventTitle}`,
          html: adminNotificationHtml,
        })

        req.payload.logger.info('[Waitlist] Sent admin promotion notification')
      } catch (error) {
        req.payload.logger.error(
          `[Waitlist] Failed to send admin promotion notification: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      availableSpots -= childrenCount
      promotedCount++

      req.payload.logger.info(
        `[Waitlist] Promoted entry ${entry.id} at position ${entry.queuePosition} (${childrenCount} children), ${availableSpots} spots remaining`,
      )
    }

    if (promotedCount > 0) {
      req.payload.logger.info(
        `[Waitlist] Successfully promoted ${promotedCount} registration(s) from waitlist for event ${event.title}`,
      )
    } else {
      req.payload.logger.info(
        `[Waitlist] No registrations were promoted from waitlist for event ${event.title}`,
      )
    }
  } catch (error) {
    req.payload.logger.error(
      `[Waitlist] Error in promoteFromWaitlist: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Don't throw - we don't want to break the main operation
  }
}

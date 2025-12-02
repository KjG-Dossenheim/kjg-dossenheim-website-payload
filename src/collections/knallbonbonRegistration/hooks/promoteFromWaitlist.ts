import type { PayloadRequest } from 'payload'
import { createHash } from 'crypto'
import { render } from '@react-email/render'
import {
  spotAvailableEmailTemplate,
  adminPromotionNotificationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

/**
 * Generate secure confirmation token for waitlist promotion
 */
function generateConfirmationToken(registrationId: string, createdAt: string): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined')
  }
  return createHash('sha256').update(`${registrationId}${secret}${createdAt}`).digest('hex')
}

/**
 * Promote eligible waitlist entries when spots become available
 *
 * This function:
 * 1. Calculates available spots for an event
 * 2. Finds waitlist entries that can be promoted (FIFO order)
 * 3. Ensures families aren't split (all children or none)
 * 4. Sends confirmation emails with secure tokens
 * 5. Notifies admins of promotions
 */
export async function promoteFromWaitlist(req: PayloadRequest, eventId: string): Promise<void> {
  try {
    // Fetch event details
    const event = await req.payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event.maxParticipants) {
      console.log(`Event ${eventId} has no maxParticipants set, skipping waitlist promotion`)
      return
    }

    // Fetch settings to check if auto-promotion is enabled
    const settings = await req.payload.findGlobal({
      slug: 'knallbonbonSettings',
    })

    if (!settings.enableAutoPromotion) {
      console.log('Auto-promotion is disabled in settings, skipping waitlist promotion')
      return
    }

    const confirmationDeadlineDays = settings.confirmationDeadlineDays || 7

    // Calculate available spots
    const currentParticipantCount = event.participantCount || 0
    let availableSpots = event.maxParticipants - currentParticipantCount

    if (availableSpots <= 0) {
      console.log(`Event ${eventId} has no available spots, skipping waitlist promotion`)
      return
    }

    console.log(
      `Event ${event.title} has ${availableSpots} available spots, checking waitlist...`,
    )

    // Fetch waitlist entries
    // Include entries that:
    // 1. Are on waitlist (isWaitlist: true)
    // 2. Haven't been promoted yet (promotionSentAt: null)
    // OR have expired confirmation (confirmationDeadline < now)
    const now = new Date()
    const waitlistRegistrations = await req.payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            isWaitlist: {
              equals: true,
            },
          },
          {
            or: [
              {
                promotionSentAt: {
                  equals: null,
                },
              },
              {
                and: [
                  {
                    promotionSentAt: {
                      not_equals: null,
                    },
                  },
                  {
                    confirmationDeadline: {
                      less_than: now.toISOString(),
                    },
                  },
                  {
                    confirmedAt: {
                      equals: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      sort: 'createdAt', // FIFO order
      limit: 100,
    })

    if (waitlistRegistrations.docs.length === 0) {
      console.log(`No eligible waitlist entries found for event ${event.title}`)
      return
    }

    console.log(
      `Found ${waitlistRegistrations.docs.length} eligible waitlist entries for event ${event.title}`,
    )

    // Process each waitlist entry in order
    let promotedCount = 0
    for (const registration of waitlistRegistrations.docs) {
      if (availableSpots <= 0) {
        console.log('No more available spots, stopping promotion')
        break
      }

      const childrenCount = registration.child?.length || 0

      // Check if there are enough spots for ALL children
      if (childrenCount > availableSpots) {
        console.log(
          `Skipping registration ${registration.id}: needs ${childrenCount} spots but only ${availableSpots} available`,
        )
        continue // Skip this family, try next one
      }

      // This family can be promoted!
      const confirmationDeadline = new Date()
      confirmationDeadline.setDate(confirmationDeadline.getDate() + confirmationDeadlineDays)

      // Generate secure token
      const token = generateConfirmationToken(registration.id, registration.createdAt)

      // Build confirmation URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const confirmationUrl = `${siteUrl}/knallbonbon/bestatigen/${registration.id}?token=${token}`

      // Update registration
      await req.payload.update({
        collection: 'knallbonbonRegistration',
        id: registration.id,
        data: {
          promotionSentAt: now.toISOString(),
          confirmationDeadline: confirmationDeadline.toISOString(),
        },
      })

      // Send email to parents
      try {
        const spotAvailableHtml = await render(
          spotAvailableEmailTemplate(
            registration,
            event.title,
            confirmationUrl,
            confirmationDeadline,
          ),
        )

        await req.payload.sendEmail({
          to: registration.email,
          subject: `Gute Nachricht! Ein Platz ist frei geworden - ${event.title}`,
          html: spotAvailableHtml,
        })

        console.log(`Sent spot-available email to ${registration.email}`)
      } catch (error) {
        console.error(`Failed to send spot-available email to ${registration.email}:`, error)
      }

      // Send admin notification
      try {
        const adminNotificationHtml = await render(
          adminPromotionNotificationEmailTemplate(registration, event.title, confirmationDeadline),
        )

        await req.payload.sendEmail({
          to: 'ben.wallner@kjg-dossenheim.org',
          subject: `Neue Wartelisten-Beförderung: ${event.title}`,
          html: adminNotificationHtml,
        })

        console.log('Sent admin promotion notification')
      } catch (error) {
        console.error('Failed to send admin promotion notification:', error)
      }

      availableSpots -= childrenCount
      promotedCount++

      console.log(
        `Promoted registration ${registration.id} (${childrenCount} children), ${availableSpots} spots remaining`,
      )
    }

    if (promotedCount > 0) {
      console.log(
        `Successfully promoted ${promotedCount} registration(s) from waitlist for event ${event.title}`,
      )
    } else {
      console.log(`No registrations were promoted from waitlist for event ${event.title}`)
    }
  } catch (error) {
    console.error('Error in promoteFromWaitlist:', error)
    // Don't throw - we don't want to break the main operation
  }
}

'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { promoteFromWaitlist } from '@/collections/knallbonbonWaitlist/hooks/promoteFromWaitlist'
import { createHash } from 'crypto'
import { render } from '@react-email/render'
import {
  spotAvailableEmailTemplate,
  adminPromotionNotificationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

/**
 * Generate secure confirmation token for waitlist promotion
 */
function generateConfirmationToken(waitlistEntryId: string, createdAt: string): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined')
  }
  return createHash('sha256').update(`${waitlistEntryId}${secret}${createdAt}`).digest('hex')
}

/**
 * Directly move a waitlist entry to registrations without email confirmation
 * This allows admins to manually register users immediately
 */
export async function moveWaitlistToRegistration(waitlistEntryId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const payload = await getPayload({ config })

    // Fetch the waitlist entry
    const entry = await payload.findByID({
      collection: 'knallbonbonWaitlist',
      id: waitlistEntryId,
      depth: 1,
    })

    if (!entry) {
      return { success: false, error: 'Waitlist entry not found' }
    }

    // Check if already confirmed (can't move twice)
    if (entry.status === 'confirmed') {
      return { success: false, error: 'Eintrag schon bestätigt' }
    }

    // Get event details
    const eventId = typeof entry.event === 'string' ? entry.event : entry.event?.id
    if (!eventId) {
      return { success: false, error: 'Event not found for this waitlist entry' }
    }

    const event = await payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Create registration from waitlist data
    // Note: No spot availability check - admins can override capacity manually
    const registration = await payload.create({
      collection: 'knallbonbonRegistration',
      data: {
        event: eventId,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        phone: entry.phone,
        address: entry.address || '',
        postalCode: entry.postalCode || '',
        city: entry.city || '',
        child: entry.children || [],
      },
    })

    if (!registration) {
      return { success: false, error: 'Failed to create registration' }
    }

    // Update waitlist entry to confirmed status
    await payload.update({
      collection: 'knallbonbonWaitlist',
      id: entry.id,
      data: {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      },
    })

    payload.logger.info(
      `[Manual Move] Successfully moved waitlist entry ${entry.id} to registration ${registration.id} for event ${event.title}`,
    )

    return { success: true }
  } catch (error) {
    console.error('[Manual Move] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Manually promote a specific waitlist entry
 * This allows admins to promote users even if auto-promotion is disabled
 */
export async function promoteWaitlistEntry(waitlistEntryId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const payload = await getPayload({ config })

    // Fetch the waitlist entry
    const entry = await payload.findByID({
      collection: 'knallbonbonWaitlist',
      id: waitlistEntryId,
      depth: 1,
    })

    if (!entry) {
      return { success: false, error: 'Waitlist entry not found' }
    }

    // Check if already promoted or confirmed
    if (entry.status === 'promoted') {
      return { success: false, error: 'This entry has already been promoted' }
    }

    if (entry.status === 'confirmed') {
      return { success: false, error: 'This entry has already been confirmed' }
    }

    // Get event details
    const eventId = typeof entry.event === 'string' ? entry.event : entry.event?.id
    if (!eventId) {
      return { success: false, error: 'Event not found for this waitlist entry' }
    }

    const event = await payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Check if there are enough spots available
    const currentParticipantCount = event.participantCount || 0
    const maxParticipants = event.maxParticipants || 0
    const availableSpots = maxParticipants - currentParticipantCount
    const childrenCount = entry.childrenCount || 0

    if (maxParticipants > 0 && childrenCount > availableSpots) {
      return {
        success: false,
        error: `Not enough spots available. Need ${childrenCount} spots but only ${availableSpots} available.`,
      }
    }

    // Get settings for confirmation deadline
    const settings = await payload.findGlobal({
      slug: 'knallbonbonSettings',
    })

    const confirmationDeadlineDays = settings.confirmationDeadlineDays || 7

    // Calculate confirmation deadline
    const now = new Date()
    const confirmationDeadline = new Date()
    confirmationDeadline.setDate(confirmationDeadline.getDate() + confirmationDeadlineDays)

    // Generate secure token
    const token = generateConfirmationToken(entry.id, entry.createdAt)

    // Build confirmation URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const confirmationUrl = `${siteUrl}/knallbonbon/bestatigen/${entry.id}?token=${token}`

    // Update waitlist entry to promoted status
    await payload.update({
      collection: 'knallbonbonWaitlist',
      id: entry.id,
      data: {
        status: 'promoted',
        promotionSentAt: now.toISOString(),
        confirmationDeadline: confirmationDeadline.toISOString(),
      },
    })

    // Send email to parents
    try {
      const registrationData = {
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        child: entry.children,
      }

      const eventTitle = typeof entry.event === 'object' ? entry.event.title : event.title

      const spotAvailableHtml = await render(
        spotAvailableEmailTemplate(
          registrationData,
          eventTitle,
          confirmationUrl,
          confirmationDeadline,
        ),
      )

      await payload.sendEmail({
        to: entry.email,
        subject: `Gute Nachricht! Ein Platz ist frei geworden - ${eventTitle}`,
        html: spotAvailableHtml,
      })

      payload.logger.info(`[Manual Promotion] Sent spot-available email to ${entry.email}`)
    } catch (error) {
      payload.logger.error(
        `[Manual Promotion] Failed to send spot-available email to ${entry.email}: ${error instanceof Error ? error.message : String(error)}`,
      )
      return {
        success: false,
        error: `Failed to send confirmation email: ${error instanceof Error ? error.message : String(error)}`,
      }
    }

    // Send admin notification
    try {
      const registrationData = {
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        child: entry.children,
      }

      const eventTitle = typeof entry.event === 'object' ? entry.event.title : event.title

      const adminNotificationHtml = await render(
        adminPromotionNotificationEmailTemplate(
          registrationData,
          eventTitle,
          confirmationDeadline,
        ),
      )

      await payload.sendEmail({
        to: 'ben.wallner@kjg-dossenheim.org',
        subject: `Manuelle Wartelisten-Einladung: ${eventTitle}`,
        html: adminNotificationHtml,
      })

      payload.logger.info('[Manual Promotion] Sent admin promotion notification')
    } catch (error) {
      payload.logger.error(
        `[Manual Promotion] Failed to send admin promotion notification: ${error instanceof Error ? error.message : String(error)}`,
      )
      // Don't fail the whole operation if admin notification fails
    }

    payload.logger.info(
      `[Manual Promotion] Successfully promoted waitlist entry ${entry.id} for event ${event.title}`,
    )

    return { success: true }
  } catch (error) {
    console.error('[Manual Promotion] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

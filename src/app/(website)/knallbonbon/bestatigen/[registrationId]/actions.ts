'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createHash } from 'crypto'

/**
 * Generate confirmation token for validation
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
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

type ConfirmationResult =
  | { success: true; message: string; eventTitle: string }
  | { success: false; error: string; message: string }

export async function confirmRegistrationAction(
  waitlistEntryId: string,
  token: string,
): Promise<ConfirmationResult> {
  try {
    if (!token) {
      return { success: false, error: 'missing_token', message: 'Missing token' }
    }

    const payload = await getPayload({ config })

    // Find waitlist entry by ID with event relationship populated
    const entry = await payload.findByID({
      collection: 'knallbonbonWaitlist',
      id: waitlistEntryId,
      depth: 1,
    })

    if (!entry) {
      return { success: false, error: 'not_found', message: 'Waitlist entry not found' }
    }

    // Validate token
    const expectedToken = generateConfirmationToken(entry.id, entry.createdAt)
    if (!secureCompare(token, expectedToken)) {
      console.error('Invalid confirmation token for waitlist entry:', waitlistEntryId)
      return { success: false, error: 'invalid_token', message: 'Invalid token' }
    }

    // Check if in promoted state
    if (entry.status !== 'promoted') {
      return {
        success: false,
        error: 'not_promoted',
        message: 'Diese Anmeldung wurde nicht befördert oder wurde bereits bestätigt.',
      }
    }

    // Check if already confirmed (prevent replay)
    if (entry.confirmedAt) {
      return {
        success: false,
        error: 'already_confirmed',
        message: 'Diese Anmeldung wurde bereits bestätigt.',
      }
    }

    // Check if deadline has passed
    const now = new Date()
    if (entry.confirmationDeadline && new Date(entry.confirmationDeadline) < now) {
      return {
        success: false,
        error: 'deadline_expired',
        message: 'Die Bestätigungsfrist ist leider abgelaufen.',
      }
    }

    // Get event from relationship
    const eventId = typeof entry.event === 'string' ? entry.event : entry.event.id
    const event = typeof entry.event === 'object' ? entry.event : await payload.findByID({
      collection: 'knallbonbonEvents',
      id: eventId,
    })

    if (!event) {
      return { success: false, error: 'event_not_found', message: 'Event not found' }
    }

    // Check if event still has enough spots for all children
    const childrenCount = entry.childrenCount || 0
    const currentParticipantCount = event.participantCount || 0
    const availableSpots = event.maxParticipants
      ? event.maxParticipants - currentParticipantCount
      : Infinity

    if (availableSpots < childrenCount) {
      return {
        success: false,
        error: 'insufficient_spots',
        message: `Leider sind nicht mehr genügend Plätze verfügbar. Benötigt: ${childrenCount}, Verfügbar: ${availableSpots}`,
      }
    }

    // All validations passed - create registration from waitlist data
    const newRegistration = await payload.create({
      collection: 'knallbonbonRegistration',
      data: {
        event: eventId,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        phone: entry.phone,
        address: entry.address,
        postalCode: entry.postalCode,
        city: entry.city,
        child: entry.children, // Copy children array from waitlist
        isWaitlist: false, // No longer on waitlist
      },
    })

    // Update waitlist entry with confirmed status
    await payload.update({
      collection: 'knallbonbonWaitlist',
      id: entry.id,
      data: {
        status: 'confirmed',
        confirmedAt: now.toISOString(),
      },
    })

    console.log(
      `Waitlist entry ${entry.id} confirmed successfully, created registration ${newRegistration.id}`,
    )

    // Queue confirmation email sending job
    await payload.jobs.queue({
      task: 'sendConfirmationEmails',
      input: {
        registration: JSON.parse(JSON.stringify(newRegistration)), // Serialize for job queue
        eventTitle: event.title,
      },
    })

    // The afterChange hook on knallbonbonRegistration will automatically:
    // 1. Update participant count
    // 2. Check if more promotions are needed
    // 3. Promote next person in line if spots available

    return {
      success: true,
      message: 'Ihre Teilnahme wurde erfolgreich bestätigt!',
      eventTitle: event.title,
    }
  } catch (error) {
    console.error('Error confirming registration:', error)
    return {
      success: false,
      error: 'server_error',
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    }
  }
}

'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createHash } from 'crypto'

/**
 * Generate confirmation token for validation
 */
function generateConfirmationToken(registrationId: string, createdAt: string): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined')
  }
  return createHash('sha256').update(`${registrationId}${secret}${createdAt}`).digest('hex')
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
  registrationId: string,
  token: string,
): Promise<ConfirmationResult> {
  try {
    if (!token) {
      return { success: false, error: 'missing_token', message: 'Missing token' }
    }

    const payload = await getPayload({ config })

    // Fetch registration with event details
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      depth: 1,
    })

    if (!registration) {
      return { success: false, error: 'not_found', message: 'Registration not found' }
    }

    // Validate token
    const expectedToken = generateConfirmationToken(registration.id, registration.createdAt)
    if (!secureCompare(token, expectedToken)) {
      console.error('Invalid confirmation token for registration:', registrationId)
      return { success: false, error: 'invalid_token', message: 'Invalid token' }
    }

    // Check if already confirmed (prevent replay)
    if (registration.confirmedAt) {
      return {
        success: false,
        error: 'already_confirmed',
        message: 'Diese Anmeldung wurde bereits bestätigt.',
      }
    }

    // Check if deadline has passed
    const now = new Date()
    if (registration.confirmationDeadline && new Date(registration.confirmationDeadline) < now) {
      return {
        success: false,
        error: 'deadline_expired',
        message: 'Die Bestätigungsfrist ist leider abgelaufen.',
      }
    }

    // Check if still on waitlist
    if (!registration.isWaitlist) {
      return {
        success: false,
        error: 'not_on_waitlist',
        message: 'Diese Anmeldung ist nicht auf der Warteliste.',
      }
    }

    // Fetch event to check if spots are still available
    const event =
      typeof registration.event === 'object'
        ? registration.event
        : await payload.findByID({
            collection: 'knallbonbonEvents',
            id: registration.event,
          })

    if (!event) {
      return { success: false, error: 'event_not_found', message: 'Event not found' }
    }

    // Check if event still has enough spots for all children
    const childrenCount = registration.child?.length || 0
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

    // All validations passed - confirm the registration
    await payload.update({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      data: {
        confirmedAt: now.toISOString(),
        isWaitlist: false, // Remove from waitlist
      },
    })

    console.log(`Registration ${registrationId} confirmed successfully`)

    // Queue confirmation email sending job to run asynchronously
    // This improves response time and handles email failures gracefully
    await payload.jobs.queue({
      task: 'sendConfirmationEmails',
      input: {
        registration: JSON.parse(JSON.stringify(registration)), // Serialize for job queue
        eventTitle: event.title,
      },
    })

    // The afterChange hook will automatically:
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

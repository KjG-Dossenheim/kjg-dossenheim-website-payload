import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createHash } from 'crypto'
import { render } from '@react-email/render'
import {
  confirmationSuccessEmailTemplate,
  adminConfirmationNotificationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  try {
    const { registrationId } = await params
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Fetch registration with event details
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      depth: 1,
    })

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 })
    }

    // Validate token
    const expectedToken = generateConfirmationToken(registration.id, registration.createdAt)
    if (!secureCompare(token, expectedToken)) {
      console.error('Invalid confirmation token for registration:', registrationId)
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 })
    }

    // Check if already confirmed (prevent replay)
    if (registration.confirmedAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'already_confirmed',
          message: 'Diese Anmeldung wurde bereits bestätigt.',
        },
        { status: 400 },
      )
    }

    // Check if deadline has passed
    const now = new Date()
    if (registration.confirmationDeadline && new Date(registration.confirmationDeadline) < now) {
      return NextResponse.json(
        {
          success: false,
          error: 'deadline_expired',
          message: 'Die Bestätigungsfrist ist leider abgelaufen.',
        },
        { status: 400 },
      )
    }

    // Check if still on waitlist
    if (!registration.isWaitlist) {
      return NextResponse.json(
        {
          success: false,
          error: 'not_on_waitlist',
          message: 'Diese Anmeldung ist nicht auf der Warteliste.',
        },
        { status: 400 },
      )
    }

    // Fetch event to check if spots are still available
    const event =
      typeof registration.event === 'object' ? registration.event : await payload.findByID({
          collection: 'knallbonbonEvents',
          id: registration.event,
        })

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
    }

    // Check if event still has enough spots for all children
    const childrenCount = registration.child?.length || 0
    const currentParticipantCount = event.participantCount || 0
    const availableSpots = event.maxParticipants ? event.maxParticipants - currentParticipantCount : Infinity

    if (availableSpots < childrenCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'insufficient_spots',
          message: `Leider sind nicht mehr genügend Plätze verfügbar. Benötigt: ${childrenCount}, Verfügbar: ${availableSpots}`,
        },
        { status: 400 },
      )
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

    // Send confirmation success email to parents
    try {
      const confirmationHtml = await render(
        confirmationSuccessEmailTemplate(registration, event.title),
      )

      await payload.sendEmail({
        to: registration.email,
        subject: `Teilnahme bestätigt - ${event.title}`,
        html: confirmationHtml,
      })

      console.log(`Sent confirmation success email to ${registration.email}`)
    } catch (error) {
      console.error('Failed to send confirmation success email:', error)
    }

    // Send admin notification
    try {
      const adminNotificationHtml = await render(
        adminConfirmationNotificationEmailTemplate(registration, event.title),
      )

      await payload.sendEmail({
        to: 'ben.wallner@kjg-dossenheim.org',
        subject: `Teilnahme bestätigt: ${event.title}`,
        html: adminNotificationHtml,
      })

      console.log('Sent admin confirmation notification')
    } catch (error) {
      console.error('Failed to send admin confirmation notification:', error)
    }

    // The afterChange hook will automatically:
    // 1. Update participant count
    // 2. Check if more promotions are needed
    // 3. Promote next person in line if spots available

    return NextResponse.json({
      success: true,
      message: 'Ihre Teilnahme wurde erfolgreich bestätigt!',
      eventTitle: event.title,
    })
  } catch (error) {
    console.error('Error confirming registration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      },
      { status: 500 },
    )
  }
}

'use server'

import { getPayload } from 'payload'
import { render } from '@react-email/render'
import config from '@payload-config'
import crypto from 'crypto'

export interface RegistrationData {
  id: string
  event: {
    id: string
    title: string
    date: string
  }
  firstName: string
  lastName: string
  email: string
  children: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    dateOfBirth: string
  }>
}

// Temporary in-memory store for verification tokens
// In production, you should use Redis or a database
const verificationTokens = new Map<
  string,
  { email: string; expiresAt: number }
>()

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(token)
    }
  }
}, 5 * 60 * 1000)

/**
 * Generate a verification token and send email
 */
export async function sendVerificationEmail(email: string) {
  try {
    const payload = await getPayload({ config })

    // Check if email has any registrations
    const result = await payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return {
        success: false,
        error: 'no-registrations',
        message: 'Keine Anmeldungen für diese E-Mail-Adresse gefunden.',
      }
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Store token
    verificationTokens.set(token, {
      email: email.toLowerCase().trim(),
      expiresAt,
    })

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/knallbonbon/abmelden?token=${token}`

    // Import email template dynamically to avoid circular dependencies
    const { verificationEmailTemplate } = await import('./emailTemplate')

    const emailHtml = await render(
      verificationEmailTemplate({
        verificationUrl,
      })
    )

    // Send email
    await payload.sendEmail({
      to: email,
      subject: 'Bestätigen Sie Ihre Abmeldung vom Knallbonbon',
      html: emailHtml,
    })

    return {
      success: true,
      message: 'Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet.',
    }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return {
      success: false,
      error: 'server-error',
      message: 'Fehler beim Senden der Bestätigungs-E-Mail.',
    }
  }
}

/**
 * Verify token and return email if valid
 */
export async function verifyToken(token: string) {
  const data = verificationTokens.get(token)

  if (!data) {
    return {
      success: false,
      error: 'invalid-token',
      message: 'Ungültiger oder abgelaufener Bestätigungslink.',
    }
  }

  if (data.expiresAt < Date.now()) {
    verificationTokens.delete(token)
    return {
      success: false,
      error: 'expired-token',
      message: 'Der Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen an.',
    }
  }

  return {
    success: true,
    email: data.email,
  }
}

/**
 * Fetch registrations for a given email with token verification
 */
export async function fetchRegistrationsByEmail(email: string, token: string) {
  // Verify token
  const tokenVerification = await verifyToken(token)

  if (!tokenVerification.success) {
    return tokenVerification
  }

  // Verify email matches token
  if (tokenVerification.email !== email.toLowerCase().trim()) {
    return {
      success: false,
      error: 'email-mismatch',
      message: 'Die E-Mail-Adresse stimmt nicht mit dem Bestätigungslink überein.',
    }
  }
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        email: {
          equals: email.toLowerCase().trim(),
        },
      },
      depth: 2,
      limit: 100,
    })

    if (result.docs.length === 0) {
      return {
        success: false,
        error: 'no-registrations',
        message: 'Keine Anmeldungen für diese E-Mail-Adresse gefunden.',
      }
    }

    // Format the data
    const registrations: RegistrationData[] = result.docs.map((doc) => {
      const event = typeof doc.event === 'object' ? doc.event : null

      return {
        id: doc.id,
        event: {
          id: event?.id || '',
          title: event?.title || 'Knallbonbon',
          date: event?.date || '',
        },
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        children:
          doc.child?.map((child) => ({
            id: child.id || '',
            firstName: child.firstName,
            lastName: child.lastName,
            fullName: child.fullName || `${child.firstName} ${child.lastName}`,
            dateOfBirth: child.dateOfBirth,
          })) || [],
      }
    })

    return {
      success: true,
      data: registrations,
    }
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return {
      success: false,
      error: 'server-error',
      message: 'Fehler beim Abrufen der Anmeldungen.',
    }
  }
}

/**
 * Delete specific children from a registration
 * If all children are deleted, the entire registration is removed
 */
export async function deleteChildren(registrationId: string, childrenIds: string[], token: string) {
  // Verify token
  const tokenVerification = await verifyToken(token)

  if (!tokenVerification.success) {
    return tokenVerification
  }
  try {
    const payload = await getPayload({ config })

    // Fetch the current registration
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      depth: 1,
    })

    if (!registration) {
      return {
        success: false,
        error: 'not-found',
        message: 'Anmeldung nicht gefunden.',
      }
    }

    // Check if the event has started
    const event = typeof registration.event === 'object' ? registration.event : null
    if (event?.date) {
      const eventDate = new Date(event.date)
      const now = new Date()
      if (eventDate <= now) {
        return {
          success: false,
          error: 'event-started',
          message: 'Die Veranstaltung hat bereits begonnen. Eine Abmeldung ist nicht mehr möglich.',
        }
      }
    }

    // Filter out the children to delete
    const remainingChildren = registration.child?.filter((child) => {
      return !childrenIds.includes(child.id || '')
    })

    // If no children remain, delete the entire registration
    if (!remainingChildren || remainingChildren.length === 0) {
      await payload.delete({
        collection: 'knallbonbonRegistration',
        id: registrationId,
      })

      return {
        success: true,
        deletedRegistration: true,
        message: 'Anmeldung wurde vollständig gelöscht.',
      }
    }

    // Otherwise, update the registration with the remaining children
    await payload.update({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      data: {
        child: remainingChildren,
      },
    })

    return {
      success: true,
      deletedRegistration: false,
      message: `${childrenIds.length} ${childrenIds.length === 1 ? 'Kind wurde' : 'Kinder wurden'} erfolgreich abgemeldet.`,
    }
  } catch (error) {
    console.error('Error deleting children:', error)
    return {
      success: false,
      error: 'server-error',
      message: 'Fehler beim Löschen der Anmeldung.',
    }
  }
}

/**
 * Delete an entire registration
 */
export async function deleteRegistration(registrationId: string, token: string) {
  // Verify token
  const tokenVerification = await verifyToken(token)

  if (!tokenVerification.success) {
    return tokenVerification
  }
  try {
    const payload = await getPayload({ config })

    // Fetch the registration to check the event date
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
      depth: 1,
    })

    if (!registration) {
      return {
        success: false,
        error: 'not-found',
        message: 'Anmeldung nicht gefunden.',
      }
    }

    // Check if the event has started
    const event = typeof registration.event === 'object' ? registration.event : null
    if (event?.date) {
      const eventDate = new Date(event.date)
      const now = new Date()
      if (eventDate <= now) {
        return {
          success: false,
          error: 'event-started',
          message: 'Die Veranstaltung hat bereits begonnen. Eine Abmeldung ist nicht mehr möglich.',
        }
      }
    }

    await payload.delete({
      collection: 'knallbonbonRegistration',
      id: registrationId,
    })

    return {
      success: true,
      message: 'Anmeldung wurde erfolgreich gelöscht.',
    }
  } catch (error) {
    console.error('Error deleting registration:', error)
    return {
      success: false,
      error: 'server-error',
      message: 'Fehler beim Löschen der Anmeldung.',
    }
  }
}

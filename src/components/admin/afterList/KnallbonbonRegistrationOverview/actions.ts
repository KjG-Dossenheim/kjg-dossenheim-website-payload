'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render'
import { emailTemplate } from '@/collections/knallbonbonRegistration/beforeDocumentControls/emailTemplate'

type SendEmailResult = {
  success: boolean
  sentCount?: number
  failedCount?: number
  error?: string
  emails?: string[]
}

export async function sendEmailToAllEventRegistrations(
  eventId: string,
  subject: string,
  message: string,
): Promise<SendEmailResult> {
  try {
    const payload = await getPayload({ config })

    // Fetch all registrations for this event
    const registrations = await payload.find({
      collection: 'knallbonbonRegistration',
      where: {
        event: {
          equals: eventId,
        },
      },
      limit: 1000,
    })

    if (!registrations.docs.length) {
      return { success: false, error: 'Keine Anmeldungen für diesen Termin gefunden' }
    }

    const sentEmails: string[] = []
    const failedEmails: string[] = []

    // Send email to each registration
    for (const registration of registrations.docs) {
      if (!registration.email) {
        failedEmails.push(`${registration.firstName} ${registration.lastName} (keine E-Mail)`)
        continue
      }

      try {
        // Render the email template
        const emailHtml = await render(
          emailTemplate({
            firstName: registration.firstName,
            lastName: registration.lastName,
            subject,
            message,
          }),
        )

        // Send the email
        await payload.sendEmail({
          to: registration.email,
          subject: subject,
          html: emailHtml,
        })

        sentEmails.push(registration.email)
      } catch (error) {
        console.error(`Error sending email to ${registration.email}:`, error)
        failedEmails.push(registration.email)
      }
    }

    return {
      success: true,
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
      emails: sentEmails,
    }
  } catch (error) {
    console.error('Error sending emails:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render'
import { emailTemplate } from './emailTemplate'

type SendEmailResult = {
  success: boolean
  email?: string
  error?: string
}

export async function sendEmailToRegistration(
  registrationId: string,
  subject: string,
  message: string,
): Promise<SendEmailResult> {
  try {
    const payload = await getPayload({ config })

    // Fetch the registration document
    const registration = await payload.findByID({
      collection: 'knallbonbonRegistration',
      id: registrationId,
    })

    if (!registration) {
      return { success: false, error: 'Anmeldung nicht gefunden' }
    }

    if (!registration.email) {
      return { success: false, error: 'Keine E-Mail-Adresse vorhanden' }
    }

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

    return { success: true, email: registration.email }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

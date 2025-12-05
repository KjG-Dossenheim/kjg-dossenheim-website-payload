import { render } from '@react-email/render'
import {
  confirmationSuccessEmailTemplate,
  adminConfirmationNotificationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'

/**
 * Job to send confirmation emails asynchronously
 *
 * This job sends two emails when a waitlist registration is confirmed:
 * 1. User confirmation success email
 * 2. Admin notification email
 *
 * This offloads email sending from the confirmation flow,
 * improving response times and handling email failures gracefully.
 */

type SendConfirmationEmailsInput = {
  registration: any
  eventTitle: string
}

export const sendConfirmationEmailsJob = {
  slug: 'sendConfirmationEmails',
  interfaceName: 'SendConfirmationEmailsJob',
  handler: async ({ req, input }: any) => {
    try {
      const { registration, eventTitle } = input as SendConfirmationEmailsInput

      req.payload.logger.info(
        `Sending confirmation emails for registration ${registration.id} - Event: ${eventTitle}`,
      )

      // Send confirmation success email to parents
      try {
        const confirmationHtml = await render(
          confirmationSuccessEmailTemplate(registration, eventTitle),
        )

        await req.payload.sendEmail({
          to: registration.email,
          subject: `Teilnahme bestätigt - ${eventTitle}`,
          html: confirmationHtml,
        })

        req.payload.logger.info(`Sent confirmation success email to ${registration.email}`)
      } catch (error) {
        req.payload.logger.error('Failed to send confirmation success email:', error)
        // Don't throw - we still want to try sending the admin email
      }

      // Send admin notification
      try {
        const adminNotificationHtml = await render(
          adminConfirmationNotificationEmailTemplate(registration, eventTitle),
        )

        await req.payload.sendEmail({
          to: 'ben.wallner@kjg-dossenheim.org',
          subject: `Teilnahme bestätigt: ${eventTitle}`,
          html: adminNotificationHtml,
        })

        req.payload.logger.info('Sent admin confirmation notification')
      } catch (error) {
        req.payload.logger.error('Failed to send admin confirmation notification:', error)
        throw error // Throw here so job can be retried
      }

      req.payload.logger.info('All confirmation emails sent successfully')

      return {
        output: {},
      }
    } catch (error) {
      req.payload.logger.error('Error in sendConfirmationEmails job:', error)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
  inputSchema: [
    {
      name: 'registration',
      type: 'json',
      required: true,
    },
    {
      name: 'eventTitle',
      type: 'text',
      required: true,
    },
  ],
  retries: 3,
} satisfies import('payload').TaskConfig

import { render } from '@react-email/render'
import {
  adminNotificationEmailTemplate,
  confirmationEmailTemplate,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'
import type { FormValues } from '@/app/(website)/knallbonbon/anmeldung/schema'
import type { PayloadRequest } from 'payload'

/**
 * Job to send registration emails asynchronously
 *
 * This job sends two emails when a Knallbonbon registration is created:
 * 1. Admin notification email
 * 2. User confirmation email
 *
 * This offloads email sending from the user-facing form submission,
 * improving response times and handling email failures gracefully.
 */

type SendRegistrationEmailsInput = {
  formValues: Omit<FormValues, 'captchaToken'>
  eventTitle: string
  isWaitlist: boolean
}

export const sendRegistrationEmailsJob = {
  slug: 'sendRegistrationEmails',
  interfaceName: 'SendRegistrationEmailsJob',
  handler: async ({ req, input }: { req: PayloadRequest; input: unknown }) => {
    try {
      const { formValues, eventTitle, isWaitlist } = input as SendRegistrationEmailsInput

      req.payload.logger.info(
        `Sending registration emails for ${formValues.email} - Event: ${eventTitle}`,
      )

      // Send admin notification email
      try {
        const adminNotificationHtml = await render(
          adminNotificationEmailTemplate(formValues, eventTitle, isWaitlist),
        )

        await req.payload.sendEmail({
          to: 'ben.wallner@kjg-dossenheim.org',
          subject: `Neue Knallbonbon-Anmeldung${isWaitlist ? ' (Warteliste)' : ''}`,
          html: adminNotificationHtml,
        })

        req.payload.logger.info('Admin notification email sent successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        req.payload.logger.error(`Failed to send admin notification email: ${errorMessage}`)
        // Don't throw - we still want to try sending the user email
      }

      // Send user confirmation email
      try {
        const confirmationHtml = await render(
          confirmationEmailTemplate(
            {
              ...formValues,
              child: formValues.child?.map((child: FormValues['child'][number]) => ({
                ...child,
              })),
            },
            eventTitle,
            isWaitlist,
          ),
        )

        await req.payload.sendEmail({
          to: formValues.email,
          subject: isWaitlist
            ? 'Deine Anmeldung auf der Warteliste'
            : 'Vielen Dank für deine Anmeldung',
          html: confirmationHtml,
        })

        req.payload.logger.info(`Confirmation email sent successfully to ${formValues.email}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        req.payload.logger.error(`Failed to send confirmation email: ${errorMessage}`)
        throw error // Throw here so job can be retried
      }

      req.payload.logger.info('All registration emails sent successfully')

      return {
        output: {},
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      req.payload.logger.error(`Error in sendRegistrationEmails job: ${errorMessage}`)
      return {
        state: 'failed' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
  inputSchema: [
    {
      name: 'formValues',
      type: 'json',
      required: true,
    },
    {
      name: 'eventTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'isWaitlist',
      type: 'checkbox',
      required: true,
    },
  ],
  retries: 3,
} satisfies import('payload').TaskConfig

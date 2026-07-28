'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render';
import { confirmationEmailTemplate, adminNotificationEmailTemplate } from './emailTemplate';
import { verifyCaptchaToken } from '@/utilities/verifyCaptcha'

import { FormValues } from './schema';

type SendMailResult = {
  success: boolean
  error?: 'invalid-captcha'
}

export async function sendMail(values: FormValues): Promise<SendMailResult> {
  const { captchaToken, ...formValues } = values

  const isValidCaptcha = await verifyCaptchaToken(captchaToken)
  if (!isValidCaptcha) {
    return { success: false, error: 'invalid-captcha' }
  }

  const payload = await getPayload({ config })
  const adminNotificationHtml = await render(adminNotificationEmailTemplate(formValues))

  await payload.sendEmail({
    to: 'ben.wallner@kjg-dossenheim.org',
    subject: 'Neue Kontaktanfrage',
    html: adminNotificationHtml,
  })

  try {
    const confirmationHtml = await render(confirmationEmailTemplate(formValues))
    await payload.sendEmail({
      to: formValues.email,
      subject: 'Vielen Dank für deine Nachricht',
      html: confirmationHtml,
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }

  return { success: true }
}
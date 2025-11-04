'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render';
import { confirmationEmailTemplate, adminNotificationEmailTemplate } from './emailTemplate';

import { FormValues } from './schema';

type SendMailResult = {
  success: boolean
  error?: 'invalid-captcha'
}

type VerificationResponse = {
  success: boolean
}

const CAPTCHA_VERIFY_ENDPOINT = 'https://captcha.gurl.eu.org/api/verify'

async function verifyCaptchaToken(token: string): Promise<boolean> {
  if (!token) {
    return false
  }

  try {
    const response = await fetch(CAPTCHA_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Captcha verification failed with status:', response.status)
      return false
    }

    const result = (await response.json()) as VerificationResponse
    return Boolean(result?.success)
  } catch (error) {
    console.error('Captcha verification error:', error)
    return false
  }
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
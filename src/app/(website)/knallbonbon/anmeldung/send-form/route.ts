import { NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { getPayload } from 'payload'
import config from '@payload-config'

import { formSchema } from '../../anmeldung/schema'


import {
  adminNotificationEmailTemplate,
  confirmationEmailTemplate,
} from '../../anmeldung/emailTemplate'

const CAPTCHA_VERIFY_ENDPOINT = 'https://captcha.gurl.eu.org/api/validate'

type VerificationResponse = {
  success: boolean
}

async function verifyCaptchaToken(token: string): Promise<boolean> {
  if (!token) {
    return false
  }

  try {
    const response = await fetch(CAPTCHA_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = formSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation-error',
          message: 'Bitte prüfen Sie Ihre Eingaben.',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { captchaToken, ...formValues } = parsed.data
    const isValidCaptcha = await verifyCaptchaToken(captchaToken)

    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'invalid-captcha', message: 'Bitte bestätigen Sie die Captcha-Prüfung erneut.' },
        { status: 400 },
      )
    }

    const payloadClient = await getPayload({ config })

    await payloadClient.create({
      collection: 'knallbonbonRegistration',
      data: formValues,
    })

    const adminNotificationHtml = await render(adminNotificationEmailTemplate(formValues))

    await payloadClient.sendEmail({
      to: 'ben.wallner@kjg-dossenheim.org',
      subject: 'Neue Knallbonbon-Anmeldung',
      html: adminNotificationHtml,
    })

    try {
      const confirmationHtml = await render(
        confirmationEmailTemplate({
          ...formValues,
          child: formValues.child?.map((child) => ({
            ...child,
          })),
        }),
      )

      await payloadClient.sendEmail({
        to: formValues.email,
        subject: 'Vielen Dank für deine Anmeldung',
        html: confirmationHtml,
      })
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error while submitting registration:', error)
    return NextResponse.json(
      { error: 'server-error', message: 'Fehler beim Verarbeiten der Anmeldung.' },
      { status: 500 },
    )
  }
}

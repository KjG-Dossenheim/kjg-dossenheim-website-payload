'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { render } from '@react-email/render';
import { confirmationEmailTemplate, adminNotificationEmailTemplate } from './emailTemplate';

export async function sendMail(values: any) {
  const payload = await getPayload({ config })
  const html = await render(adminNotificationEmailTemplate(values));
  const email = await payload.sendEmail({
    to: 'ben.wallner@kjg-dossenheim.org',
    subject: 'This is a test email',
    html
  })
  try {
    const html = await render(confirmationEmailTemplate(values));
    await payload.sendEmail({
      to: values.email,
      subject: 'Vielen Dank für deine Nachricht',
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error);
  }
  return email
}
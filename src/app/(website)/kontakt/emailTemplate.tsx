import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { MailBase } from '@/components/email/Base'

export function confirmationEmailTemplate(props: any) {
  return (
    <MailBase>
      <Heading>Nachricht erhalten</Heading>
      <Text> Hallo {props.firstName},</Text>
      <Text>
        Vielen Dank für Deine Nachricht. Wir werden uns so schnell wie möglich bei Dir melden.
      </Text>
      <Text>Mit freundlichen Grüßen, Deine KjG Dossenheim</Text>
    </MailBase>
  )
}

export function adminNotificationEmailTemplate(props: any) {
  return (
    <MailBase>
      <Text>Neuer Mitgliedschaftsantrag eingegangen</Text>
      <Text>
        Name: {props.firstName} {props.lastName}
      </Text>
      <Text>E-Mail: {props.email}</Text>
      <Text>Telefon: {props.phone}</Text>
      <Text>Nachricht: {props.message}</Text>
    </MailBase>
  )
}

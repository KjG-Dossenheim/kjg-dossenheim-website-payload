import * as React from 'react'
import { Html, Button, Hr, Text, Heading } from '@react-email/components'
import { MembershipApplication } from '@/payload-types'
import { formatDate } from 'date-fns/format'

export function confirmationEmailTemplate(props: MembershipApplication) {
  return (
    <Html lang="de">
      <Heading>Mitgliedsantrag eingereicht</Heading>
      <Text> Hallo {props.firstName},</Text>
      <Text>
        Vielen Dank für die Einreichung Deines Mitgliedschaftsantrags bei der KjG Dossenheim! Wir
        haben Deinen Antrag erhalten und werden ihn so bald wie möglich bearbeiten.
      </Text>
      <Text>
        Sollten wir weitere Informationen benötigen, werden wir uns bei Dir melden. Ansonsten wirst
        Du in Kürze von uns hören.
      </Text>
      <Text>Mit freundlichen Grüßen,</Text>
      <Text>Deine KjG Dossenheim</Text>
      <Hr />
    </Html>
  )
}

export function adminNotificationEmailTemplate(props: MembershipApplication) {
  return (
    <Html lang="de">
      <Text>Neuer Mitgliedschaftsantrag eingegangen</Text>
      <Hr />
      <Text>
        Name: {props.firstName} {props.lastName}
      </Text>
      <Text>E-Mail: {props.email}</Text>
      <Text>Telefon: {props.phone}</Text>
      <Text>Adresse: {props.address}</Text>
      <Text>Geburtsdatum: {formatDate(props.birthDate, 'dd.MM.yyyy')}</Text>
      <Button
        className="bg-brand px-3 py-2 leading-4 font-medium text-white"
        href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/collections/membershipApplication/${props.id}`}
      >
        Antrag ansehen
      </Button>
    </Html>
  )
}

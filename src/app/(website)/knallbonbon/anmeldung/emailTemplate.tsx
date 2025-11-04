import * as React from 'react'
import { Text, Heading } from '@react-email/components'
import { MailBase } from '@/components/email/Base'
import { FormValues } from './schema'

const pickupInfoLabels: Record<NonNullable<FormValues['child'][number]['pickupInfo']>, string> = {
  pickedUp: 'Wird abgeholt',
  goesAlone: 'Geht allein nach Hause',
}

export function confirmationEmailTemplate(props: FormValues) {
  return (
    <MailBase>
      <Heading>Anmeldung erhalten</Heading>
      <Text> Hallo {props.firstName},</Text>
      <Text>
        Vielen Dank für Deine Anmeldung zum Knallbonbon der evangelischen Jugend Dossenheim. Hier
        sind die Details Deiner Anmeldung:
      </Text>
      <Text>
        <ul>
          <li>Vorname: {props.firstName}</li>
          <li>Nachname: {props.lastName}</li>
          <li>E-Mail: {props.email}</li>
          <li>Telefon: {props.phone}</li>
          <li>Adresse: {props.address}</li>
        </ul>
        <ul>
          {props.child?.map((child: FormValues['child'][number], index: number) => (
            <li key={index}>
              <ul>
                <li>Vorname: {child.firstName}</li>
                <li>Nachname: {child.lastName}</li>
                <li>Geburtsdatum: {child.dateOfBirth}</li>
                <li>Geschlecht: {child.gender}</li>
                <li>Fotoeinwilligung: {child.photoConsent ? 'Ja' : 'Nein'}</li>
                <li>
                  Abholinfo:{' '}
                  {child.pickupInfo ? pickupInfoLabels[child.pickupInfo] : 'Keine Angabe'}
                </li>
                <li>Gesundheitsinformationen: {child.healthInfo || 'Keine Angabe'}</li>
              </ul>
            </li>
          ))}
        </ul>
      </Text>
      <Text>
        Mit freundlichen Grüßen,
        <br />
        Deine evangelische Jugend Dossenheim
      </Text>
    </MailBase>
  )
}

export function adminNotificationEmailTemplate(props: FormValues) {
  return (
    <MailBase>
      <Heading>Neue Anmeldung</Heading>
      <Text>
        <ul>
          <li>Vorname: {props.firstName}</li>
          <li>Nachname: {props.lastName}</li>
          <li>E-Mail: {props.email}</li>
          <li>Telefon: {props.phone}</li>
          <li>Adresse: {props.address}</li>
        </ul>
        <ul>
          {props.child?.map((child: FormValues['child'][number], index: number) => (
            <li key={index}>
              <ul>
                <li>Vorname: {child.firstName}</li>
                <li>Nachname: {child.lastName}</li>
                <li>Geburtsdatum: {child.dateOfBirth}</li>
                <li>Geschlecht: {child.gender}</li>
                <li>Fotoeinwilligung: {child.photoConsent ? 'Ja' : 'Nein'}</li>
                <li>
                  Abholinfo:{' '}
                  {child.pickupInfo ? pickupInfoLabels[child.pickupInfo] : 'Keine Angabe'}
                </li>
                <li>Gesundheitsinformationen: {child.healthInfo || 'Keine Angabe'}</li>
              </ul>
            </li>
          ))}
        </ul>
      </Text>
    </MailBase>
  )
}

import * as React from 'react'
import { Text, Heading, Section, Button, Hr, Container } from '@react-email/components'
import MailBase from '@/components/email/Base'
import { FormValues, PICKUP_OPTIONS, GENDER_OPTIONS } from './schema'
import { format } from 'date-fns-tz/format'

export function confirmationEmailTemplate(
  props: Omit<FormValues, 'captchaToken'>,
  eventTitle: string,
  isWaitlist: boolean = false,
) {
  return (
    <MailBase>
      <Container className="px-6 py-8">
        {/* Header */}
        <Heading className="mb-6 text-center text-3xl font-bold text-gray-900">
          {isWaitlist ? 'Anmeldung auf Warteliste' : 'Anmeldung erhalten'}
        </Heading>

        <Hr className="my-6 border-gray-200" />

        {/* Main Content */}
        <div style={{ marginTop: '20px' }}>
          <Text className="text-lg font-medium text-gray-800" style={{ marginBottom: '20px' }}>
            Hallo {props.firstName},
          </Text>

          {isWaitlist ? (
            <Text
              className="text-base leading-relaxed text-gray-700"
              style={{ marginBottom: '20px' }}
            >
              Vielen Dank für Deine Anmeldung zum{' '}
              <strong className="text-gray-900">{eventTitle}</strong> der evangelischen Jugend
              Dossenheim.{' '}
              <strong className="text-orange-600">
                Da die Veranstaltung bereits ausgebucht ist, wurde Deine Anmeldung auf die
                Warteliste gesetzt.
              </strong>{' '}
              Wir werden uns bei Dir melden, sobald ein Platz frei wird.
            </Text>
          ) : (
            <Text
              className="text-base leading-relaxed text-gray-700"
              style={{ marginBottom: '20px' }}
            >
              Vielen Dank für Deine Anmeldung zum{' '}
              <strong className="text-gray-900">{eventTitle}</strong> der evangelischen Jugend
              Dossenheim. Hier sind die Details Deiner Anmeldung:
            </Text>
          )}

          {isWaitlist && (
            <div
              className="rounded-lg border border-orange-200 bg-orange-50 p-5"
              style={{ marginBottom: '20px' }}
            >
              <Text className="mb-2 text-sm font-semibold text-orange-900">
                ⚠️ Warteliste-Information
              </Text>
              <Text className="text-sm text-orange-800">
                Deine Anmeldung befindet sich auf der Warteliste. Wir informieren Dich
                umgehend per E-Mail, wenn ein Platz für Dich frei wird.
              </Text>
            </div>
          )}

          <Text
            className="text-base leading-relaxed text-gray-700"
            style={{ marginBottom: '20px' }}
          >
            Hier sind die Details Deiner Anmeldung:
          </Text>

          {/* Contact Information */}
          <div
            className="rounded-lg border border-blue-100 bg-blue-50 p-5"
            style={{ marginBottom: '20px' }}
          >
            <Text className="mb-3 text-sm font-semibold text-blue-900">Kontaktinformationen</Text>
            <table style={{ width: '100%', fontSize: '14px', color: '#374151' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Vorname:</strong> {props.firstName}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Nachname:</strong> {props.lastName}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>E-Mail:</strong> {props.email}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Telefon:</strong> {props.phone}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Adresse:</strong> {props.address}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Children Information */}
          {props.child && props.child.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <Text
                className="text-sm font-semibold text-gray-900"
                style={{ marginBottom: '16px' }}
              >
                Angemeldete Kinder ({props.child.length})
              </Text>
              {props.child.map((child: FormValues['child'][number], index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-green-100 bg-green-50 p-5"
                  style={{ marginBottom: '16px' }}
                >
                  <Text className="mb-3 text-sm font-semibold text-green-900">
                    Kind {index + 1}: {child.firstName} {child.lastName}
                  </Text>
                  <table style={{ width: '100%', fontSize: '14px', color: '#374151' }}>
                    <tbody>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Geburtsdatum:</strong> {format(child.dateOfBirth, 'dd.MM.yyyy')}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Geschlecht:</strong>{' '}
                          {child.gender
                            ? GENDER_OPTIONS.find((option) => option.value === child.gender)?.label
                            : 'Keine Angabe'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Fotoeinwilligung:</strong> {child.photoConsent ? 'Ja' : 'Nein'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Abholinfo:</strong>{' '}
                          {child.pickupInfo
                            ? PICKUP_OPTIONS.find((option) => option.value === child.pickupInfo)
                                ?.label
                            : 'Keine Angabe'}
                        </td>
                      </tr>
                      {child.healthInfo && (
                        <tr>
                          <td style={{ paddingTop: '8px', borderTop: '1px solid #bbf7d0' }}>
                            <strong>Gesundheitsinformationen:</strong> {child.healthInfo}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <Hr className="my-6 border-gray-200" />

          {/* Footer */}
          <div className="mt-6" style={{ marginBottom: '20px' }}>
            <Text className="mb-1 text-base text-gray-700">Mit freundlichen Grüßen,</Text>
            <Text className="mb-0 text-base font-semibold text-gray-900">
              Deine evangelische Jugend Dossenheim
            </Text>
          </div>

          {/* Unsubscribe Button */}
          <Section className="my-8 text-center">
            <Button
              href={process.env.NEXT_PUBLIC_SITE_URL + '/knallbonbon/abmelden'}
              className="inline-block rounded-lg bg-gray-600 px-6 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: '#4b5563', color: '#ffffff' }}
            >
              Vom Event abmelden
            </Button>
          </Section>
        </div>
      </Container>
    </MailBase>
  )
}

export function adminNotificationEmailTemplate(
  props: Omit<FormValues, 'captchaToken'>,
  eventTitle: string,
  isWaitlist: boolean = false,
) {
  return (
    <MailBase>
      <Container className="px-6 py-8">
        {/* Header */}
        <Heading className="mb-6 text-center text-3xl font-bold text-gray-900">
          {isWaitlist ? 'Neue Wartelisten-Anmeldung' : 'Neue Anmeldung'}
        </Heading>

        <Hr className="my-6 border-gray-200" />

        {/* Main Content */}
        <div style={{ marginTop: '20px' }}>
          <Text
            className="text-base leading-relaxed text-gray-700"
            style={{ marginBottom: '20px' }}
          >
            Es ist eine neue Anmeldung für das{' '}
            <strong className="text-gray-900">{eventTitle}</strong> eingegangen.
            {isWaitlist && (
              <strong className="text-orange-600">
                {' '}
                Diese Anmeldung wurde auf die Warteliste gesetzt, da die Veranstaltung bereits
                ausgebucht ist.
              </strong>
            )}
          </Text>

          {isWaitlist && (
            <div
              className="rounded-lg border border-orange-200 bg-orange-50 p-5"
              style={{ marginBottom: '20px' }}
            >
              <Text className="mb-2 text-sm font-semibold text-orange-900">
                ⚠️ Warteliste
              </Text>
              <Text className="text-sm text-orange-800">
                Diese Anmeldung befindet sich auf der Warteliste.
              </Text>
            </div>
          )}

          {/* Contact Information */}
          <div
            className="rounded-lg border border-purple-100 bg-purple-50 p-5"
            style={{ marginBottom: '20px' }}
          >
            <Text className="mb-3 text-sm font-semibold text-purple-900">Kontaktinformationen</Text>
            <table style={{ width: '100%', fontSize: '14px', color: '#374151' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Vorname:</strong> {props.firstName}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Nachname:</strong> {props.lastName}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>E-Mail:</strong> {props.email}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '8px' }}>
                    <strong>Telefon:</strong> {props.phone}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Adresse:</strong> {props.address}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Children Information */}
          {props.child && props.child.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <Text
                className="text-sm font-semibold text-gray-900"
                style={{ marginBottom: '16px' }}
              >
                Angemeldete Kinder ({props.child.length})
              </Text>
              {props.child.map((child: FormValues['child'][number], index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-indigo-100 bg-indigo-50 p-5"
                  style={{ marginBottom: '16px' }}
                >
                  <Text className="mb-3 text-sm font-semibold text-indigo-900">
                    Kind {index + 1}: {child.firstName} {child.lastName}
                  </Text>
                  <table style={{ width: '100%', fontSize: '14px', color: '#374151' }}>
                    <tbody>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Geburtsdatum:</strong> {format(child.dateOfBirth, 'dd.MM.yyyy')}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Geschlecht:</strong>{' '}
                          {child.gender
                            ? GENDER_OPTIONS.find((option) => option.value === child.gender)?.label
                            : 'Keine Angabe'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Fotoeinwilligung:</strong> {child.photoConsent ? 'Ja' : 'Nein'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBottom: '8px' }}>
                          <strong>Abholinfo:</strong>{' '}
                          {child.pickupInfo
                            ? PICKUP_OPTIONS.find((option) => option.value === child.pickupInfo)
                                ?.label
                            : 'Keine Angabe'}
                        </td>
                      </tr>
                      {child.healthInfo && (
                        <tr>
                          <td style={{ paddingTop: '8px', borderTop: '1px solid #c7d2fe' }}>
                            <strong>Gesundheitsinformationen:</strong> {child.healthInfo}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </MailBase>
  )
}

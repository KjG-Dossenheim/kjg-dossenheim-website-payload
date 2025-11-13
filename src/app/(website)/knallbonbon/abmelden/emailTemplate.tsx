import * as React from 'react'
import { Text, Heading, Button, Section, Hr, Container } from '@react-email/components'
import MailBase from '@/components/email/Base'

interface VerificationEmailProps {
  verificationUrl: string
}

export function verificationEmailTemplate({ verificationUrl }: VerificationEmailProps) {
  return (
    <MailBase>
      <Container className="px-6 py-8">
        {/* Header */}
        <Heading className="mb-6 text-center text-3xl font-bold text-gray-900">
          Abmeldung bestätigen
        </Heading>

        <Hr className="my-6 border-gray-200" />

        {/* Main Content */}
        <div style={{ marginTop: '20px' }}>
          <Text className="text-lg font-medium text-gray-800" style={{ marginBottom: '16px' }}>
            Hallo,
          </Text>

          <Text
            className="text-base leading-relaxed text-gray-700"
            style={{ marginBottom: '16px' }}
          >
            Sie haben eine Abmeldung vom{' '}
            <strong className="text-gray-900">Knallbonbon-Event</strong> beantragt. Um Ihre
            Identität zu bestätigen und fortzufahren, klicken Sie bitte auf den folgenden Button:
          </Text>

          {/* CTA Section */}
          <Section className="my-8 text-center">
            <Button
              href={verificationUrl}
              className="inline-block rounded-lg bg-red-600 px-8 py-3 font-semibold text-white"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              Abmeldung bestätigen
            </Button>
          </Section>

          {/* Info Box */}
          <div
            className="rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4"
            style={{ marginBottom: '16px' }}
          >
            <Text className="mb-0 text-sm text-amber-800">
              <strong>Wichtig:</strong> Dieser Link ist 15 Minuten lang gültig. Wenn Sie diese
              Abmeldung nicht beantragt haben, können Sie diese E-Mail ignorieren.
            </Text>
          </div>

          <Hr className="my-6 border-gray-200" />

          {/* Footer */}
          <div className="mt-6">
            <Text className="mb-1 text-base text-gray-700">Mit freundlichen Grüßen,</Text>
            <Text className="mb-0 text-base font-semibold text-gray-900">
              Deine evangelische Jugend Dossenheim
            </Text>
          </div>
        </div>
      </Container>
    </MailBase>
  )
}

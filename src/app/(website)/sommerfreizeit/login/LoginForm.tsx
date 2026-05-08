'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'
import { checkSommerfreizeitUserEmailAction } from './actions'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const defaultReturnTo = '/sommerfreizeit/account'

type LoginFormProps = {
  returnTo: string
}

type AuthStep = 'email' | 'otp'

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter()

  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState<string>('')
  const [otp, setOtp] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (step === 'email') {
        const result = await checkSommerfreizeitUserEmailAction(email)

        if (!result.success) {
          setError(result.message || 'E-Mail-Adresse konnte nicht geprueft werden.')
          return
        }

        if (!result.exists) {
          setError('Fuer diese E-Mail-Adresse existiert kein Konto.')
          return
        }

        const sendResult = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        })

        if (sendResult.error) {
          setError('Der Bestätigungscode konnte nicht gesendet werden. Bitte versuche es erneut.')
          return
        }

        setOtp('')
        setStep('otp')
        setSuccessMessage('Wir haben dir einen Bestätigungscode per E-Mail geschickt.')
        return
      }

      const signInResult = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (signInResult.error) {
        setError('Der Bestätigungscode ist ungültig oder abgelaufen. Bitte versuche es erneut.')
        return
      }

      router.push(returnTo || defaultReturnTo)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      const invalidOtp = /otp|code|invalid|expired/i.test(errorMessage)

      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')

      if (invalidOtp) {
        setError('Der Bestätigungscode ist ungültig oder abgelaufen. Bitte versuche es erneut.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEmailStep = step === 'email'
  const cardTitle = isEmailStep ? 'Anmeldung' : 'Bestätigungscode'
  const cardDescription = isEmailStep
    ? 'Gib deine E-Mail ein. Wir senden dir einen Bestätigungscode.'
    : 'Gib den Code aus deiner E-Mail ein, um dich anzumelden.'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                type="email"
                placeholder="beispiel@email.de"
                value={email}
                required
                disabled={isSubmitting}
              />
            </div>
            {!isEmailStep ? (
              <div className="space-y-2">
                <Label htmlFor="otp">Bestätigungscode</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isSubmitting}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {successMessage ? (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}
            {!isEmailStep ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError('')
                  setSuccessMessage('')
                }}
                disabled={isSubmitting}
              >
                Andere E-Mail verwenden
              </Button>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? isEmailStep
                  ? 'Code wird gesendet...'
                  : 'Code wird geprueft...'
                : isEmailStep
                  ? 'Code senden'
                  : 'Anmelden'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { sommerfreizeitAuthClient } from '@/lib/auth/client'
import { checkSommerfreizeitUserEmailAction, registerSommerfreizeitUserAction } from './actions'

const defaultReturnTo = '/sommerfreizeit/account'

type LoginFormProps = {
  returnTo: string
}

type AuthStep = 'email' | 'login' | 'register'

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter()

  const [step, setStep] = useState<AuthStep>('email')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [postalCode, setPostalCode] = useState<string>('')
  const [city, setCity] = useState<string>('')
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

        setStep(result.exists ? 'login' : 'register')
        return
      }

      if (step === 'login') {
        const result = await sommerfreizeitAuthClient.signIn.magicLink({
          email,
          callbackURL: returnTo || defaultReturnTo,
        })

        if (result.error) {
          setError('Magic Link konnte nicht gesendet werden. Bitte versuche es erneut.')
          return
        }

        setSuccessMessage('Wir haben dir einen Magic Link per E-Mail geschickt.')
        return
      }

      if (step === 'register') {
        const registerResult = await registerSommerfreizeitUserAction({
          firstName,
          lastName,
          email,
          phone,
          address,
          postalCode,
          city,
        })

        if (!registerResult.success) {
          setError(registerResult.message)
          return
        }

        const magicLinkResult = await sommerfreizeitAuthClient.signIn.magicLink({
          email,
          callbackURL: returnTo || defaultReturnTo,
        })

        if (magicLinkResult.error) {
          setError('Konto wurde erstellt, aber der Magic Link konnte nicht gesendet werden.')
          return
        }

        setSuccessMessage(
          'Dein Konto wurde erstellt. Wir haben dir einen Magic Link per E-Mail geschickt.',
        )
        return
      }

      router.push(returnTo || defaultReturnTo)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      const duplicateEmail = /already exists|duplicate|email/i.test(errorMessage)

      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')

      if (duplicateEmail) {
        setError('Fuer diese E-Mail-Adresse existiert bereits ein Konto.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isRegisterStep = step === 'register'
  const isEmailStep = step === 'email'
  const cardTitle = isEmailStep ? 'Anmeldung' : isRegisterStep ? 'Konto erstellen' : 'Anmelden'
  const cardDescription = isEmailStep
    ? 'Gib deine E-Mail ein. Wir pruefen automatisch, ob du schon ein Konto hast.'
    : isRegisterStep
      ? 'Lege zuerst ein Sommerfreizeit-Konto an, damit du die Anmeldung in mehreren Schritten ausfuellen kannst.'
      : 'Wir schicken dir einen Magic Link fuer die Anmeldung.'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterStep ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    value={firstName}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    value={lastName}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            {isRegisterStep ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer (optional)</Label>
                <Input
                  id="phone"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="0151 23456789"
                  value={phone}
                  disabled={isSubmitting}
                />
              </div>
            ) : null}
            {isRegisterStep ? (
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                  placeholder="Musterstrasse 12"
                  value={address}
                  required
                  disabled={isSubmitting}
                />
              </div>
            ) : null}
            {isRegisterStep ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postleitzahl</Label>
                  <Input
                    id="postalCode"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                    placeholder="69221"
                    value={postalCode}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                    placeholder="Dossenheim"
                    value={city}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : null}
            {isRegisterStep ? (
              <p className="text-muted-foreground text-sm">
                Nach dem Erstellen deines Kontos schicken wir dir direkt einen Magic Link per
                E-Mail.
              </p>
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
                  ? 'E-Mail wird geprueft...'
                  : isRegisterStep
                    ? 'Konto wird erstellt...'
                    : 'Magic Link wird gesendet...'
                : isEmailStep
                  ? 'Weiter'
                  : isRegisterStep
                    ? 'Konto erstellen'
                    : 'Magic Link senden'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

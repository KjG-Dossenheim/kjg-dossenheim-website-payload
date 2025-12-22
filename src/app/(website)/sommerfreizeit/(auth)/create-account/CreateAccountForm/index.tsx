'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../../_providers/Auth'
import Wortmarke from '@/graphics/logo/Wortmarke'

type FormData = {
  email: string
  firstName: string
  lastName: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<null | string>(null)
  const [isPending, startTransition] = useTransition()

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const password = useRef('')
  password.current = watch('password', '')

  const onSubmit = useCallback(
    (data: FormData) => {
      setError(null)
      const redirectParam = searchParams.get('redirect')
      startTransition(async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/sommerfreizeitUser`,
            {
              body: JSON.stringify(data),
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
            },
          )

          if (!response.ok) {
            let message =
              'Bei der Kontoerstellung ist ein Fehler aufgetreten. Bitte versuche es erneut.'

            try {
              const result = await response.json()
              const payloadMessage = result?.errors?.[0]?.message ?? result?.message

              if (typeof payloadMessage === 'string' && payloadMessage.trim().length > 0) {
                message = payloadMessage
              }
            } catch (_) {
              // ignore JSON parsing issues
            }

            setError(message)
            return
          }

          try {
            await login({ email: data.email, password: data.password })
          } catch (_) {
            setError('Dein Konto wurde erstellt, bitte melde dich manuell an.')
            router.push(`/sommerfreizeit/login${allParams}`)
            router.refresh()
            return
          }

          if (redirectParam) {
            router.push(redirectParam)
          } else {
            router.push(
              `/sommerfreizeit/account?success=${encodeURIComponent('Account erfolgreich erstellt')}`,
            )
          }

          router.refresh()
        } catch (_) {
          setError('Bei der Kontoerstellung ist ein unerwarteter Fehler aufgetreten.')
        }
      })
    },
    [allParams, login, router, searchParams, startTransition],
  )

  return (
    <section className="h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          {/* Logo */}
          <Link href="/">
            <Wortmarke className="max-w-sm min-w-sm px-6" />
          </Link>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-muted flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
          >
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertTitle>Anmeldefehler</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Input
              id="firstName"
              type="text"
              placeholder="Vorname"
              className="text-sm"
              {...register('firstName', { required: true })}
            />
            {errors.firstName && (
              <p className="w-full text-left text-sm text-red-600">
                {String(errors.firstName.message ?? 'Dieses Feld ist erforderlich')}
              </p>
            )}

            <Input
              id="lastName"
              type="text"
              placeholder="Nachname"
              className="text-sm"
              {...register('lastName', { required: true })}
            />
            {errors.lastName && (
              <p className="w-full text-left text-sm text-red-600">
                {String(errors.lastName.message ?? 'Dieses Feld ist erforderlich')}
              </p>
            )}

            <Input
              id="email"
              type="email"
              placeholder="E-Mail-Adresse"
              className="text-sm"
              {...register('email', { required: true })}
            />
            {errors.email && (
              <p className="w-full text-left text-sm text-red-600">
                {String(errors.email.message ?? 'Dieses Feld ist erforderlich')}
              </p>
            )}

            <Input
              id="password"
              type="password"
              placeholder="Passwort"
              className="text-sm"
              {...register('password', { required: true })}
            />
            {errors.password && (
              <p className="w-full text-left text-sm text-red-600">
                {String(errors.password.message ?? 'Dieses Feld ist erforderlich')}
              </p>
            )}

            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Passwort wiederholen"
              className="text-sm"
              {...register('passwordConfirm', {
                required: 'Dieses Feld ist erforderlich',
                validate: (value) =>
                  value === password.current || 'Die Passwörter stimmen nicht überein.',
              })}
            />
            {errors.passwordConfirm && (
              <p className="w-full text-left text-sm text-red-600">
                {String(errors.passwordConfirm.message ?? 'Dieses Feld ist erforderlich')}
              </p>
            )}

            <Button variant="default" disabled={isPending} type="submit" className="w-full">
              {isPending ? 'Wird verarbeitet...' : 'Registrieren'}
            </Button>
          </form>

          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>Bereits ein Konto?</p>
            <Link
              href={`/sommerfreizeit/login${allParams}`}
              className="text-primary font-medium hover:underline"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

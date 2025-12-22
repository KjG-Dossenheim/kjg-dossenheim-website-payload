'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { loginAction } from '../../_util/loginAction'
import { AuthForm } from '../../_components/AuthFrom'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)
  const [isPending, startTransition] = useTransition()

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      setError(null)
      startTransition(async () => {
        try {
          await loginAction(data)
          if (redirect?.current) {
            router.push(redirect.current)
          } else {
            router.push('/sommerfreizeit/account')
          }
          router.refresh()
        } catch (_err) {
          setError('Die eingegebenen Zugangsdaten sind falsch. Bitte versuche es erneut.')
        }
      })
    },
    [router, redirect],
  )

  return (
    <AuthForm>
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

        <Button variant="default" disabled={isPending} type="submit" className="w-full">
          {isPending ? 'Wird verarbeitet...' : 'Anmelden'}
        </Button>

        <Link
          href={`/sommerfreizeit/recover-password${allParams}`}
          className="text-muted-foreground text-sm hover:underline"
        >
          Passwort vergessen?
        </Link>
      </form>

      <div className="text-muted-foreground flex justify-center gap-1 text-sm">
        <p>Noch kein Konto?</p>
        <Link
          href={`/sommerfreizeit/create-account${allParams}`}
          className="text-primary font-medium hover:underline"
        >
          Registrieren
        </Link>
      </div>
    </AuthForm>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../../_providers/Auth'
import { AuthForm } from '../../_components/AuthFrom'

type FormData = {
  email: string
  firstName: string
  lastName: string
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)
  const router = useRouter()
  const currentEmail = user?.email

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/sommerfreizeitUser/${user.id}`,
          {
            // Make sure to include cookies with fetch
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'PATCH',
          },
        )

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          setSuccess('Successfully updated account.')
          setError('')
          setChangePassword(false)
          reset({
            firstName: json.doc.firstName,
            lastName: json.doc.lastName,
            email: json.doc.email,
            password: '',
            passwordConfirm: '',
          })
        } else {
          setError('There was a problem updating your account.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(`/login?unauthorized=account`)
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <AuthForm>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-muted flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
      >
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="w-full">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {currentEmail && (
          <p className="text-muted-foreground w-full text-left text-sm">
            Current email: <span className="text-foreground font-medium">{currentEmail}</span>
          </p>
        )}

        {!changePassword ? (
          <Fragment>
            <p className="text-muted-foreground w-full text-left text-sm">
              {'To change your password, '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
              >
                click here
              </button>
              .
            </p>
            <div className="w-full space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                className="text-sm"
                {...register('email', { required: true })}
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {String(errors.email.message ?? 'This field is required')}
                </p>
              )}
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <p className="text-muted-foreground w-full text-left text-sm">
              {'Change your password below, or '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
              >
                cancel
              </button>
              .
            </p>
            <div className="w-full space-y-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                className="text-sm"
                {...register('password', { required: true })}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {String(errors.password.message ?? 'This field is required')}
                </p>
              )}
            </div>
            <div className="w-full space-y-1">
              <label htmlFor="passwordConfirm" className="block text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="passwordConfirm"
                type="password"
                className="text-sm"
                {...register('passwordConfirm', {
                  required: true,
                  validate: (value: string) =>
                    value === password.current || 'The passwords do not match',
                })}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-600">
                  {String(errors.passwordConfirm.message ?? 'This field is required')}
                </p>
              )}
            </div>
          </Fragment>
        )}
        <Button variant="default" disabled={isLoading} type="submit" className="w-full">
          {isLoading ? 'Processing' : changePassword ? 'Change password' : 'Update account'}
        </Button>
      </form>
    </AuthForm>
  )
}

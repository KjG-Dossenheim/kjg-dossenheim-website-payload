'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2 } from 'lucide-react'

import { toast, Toaster } from 'sonner'

import { lookupOrderAndStartFlowAction } from './action'

export function OrderLookupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orderCode, setOrderCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const code = searchParams.get('orderCode')
    if (code) {
      setOrderCode(code.toUpperCase())
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const lookupResult = await lookupOrderAndStartFlowAction({ orderCode })
      if (!lookupResult.success || !lookupResult.orderCode) {
        toast.error(lookupResult.message || 'Bestellung konnte nicht abgerufen werden.', {
          toasterId: 'sommerfreizeit-order-lookup',
          closeButton: true,
          duration: Infinity,
          ...(lookupResult.wrongAccount && {
            action: {
              label: 'Abmelden',
              onClick: () => router.push('/sommerfreizeit/logout'),
            },
          }),
        })
        return
      }
      const nextCallbackURL = `/sommerfreizeit/anmelden/check?orderCode=${encodeURIComponent(lookupResult.orderCode)}${lookupResult.createdAccount ? '&createdAccount=1' : ''}`
      router.push(nextCallbackURL)
    } catch (_error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', {
        closeButton: true,
        duration: Infinity,
        toasterId: 'sommerfreizeit-order-lookup',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <Toaster richColors id="sommerfreizeit-order-lookup" />
      <Card>
        <CardHeader>
          <CardTitle>Anmeldung abschließen</CardTitle>
          <CardDescription>
            Gib deinen Pretix-Bestellcode ein, um die Anmeldung abzuschließen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="orderCode">Bestellcode</FieldLabel>
                <FieldContent>
                  <InputOTP
                    id="orderCode"
                    value={orderCode}
                    onChange={(value) => setOrderCode(value.toUpperCase())}
                    disabled={isSubmitting}
                    maxLength={5}
                    inputMode="text"
                    autoComplete="off"
                    pushPasswordManagerStrategy="none"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                    </InputOTPGroup>
                  </InputOTP>
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {isSubmitting ? 'Wird geprüft...' : 'Bestellung abrufen'}
              </Button>
              <Link href="/sommerfreizeit/buchen/" className={buttonVariants({ variant: 'link' })}>
                Noch keinen Bestellcode?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

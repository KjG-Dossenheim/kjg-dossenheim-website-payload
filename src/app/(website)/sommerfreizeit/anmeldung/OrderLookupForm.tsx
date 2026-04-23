'use client'

import { useState, useTransition } from 'react'
import { sommerfreizeitAuthClient } from '@/lib/auth/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { lookupOrderAndStartFlowAction } from './action'
import { Link } from 'lucide-react'

export function OrderLookupForm() {
  const [orderCode, setOrderCode] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccessMessage('')

    startTransition(async () => {
      const lookupResult = await lookupOrderAndStartFlowAction({ orderCode })

      if (!lookupResult.success || !lookupResult.email || !lookupResult.orderCode) {
        setError(lookupResult.message || 'Bestellung konnte nicht abgerufen werden.')
        return
      }

      const callbackURL = `/sommerfreizeit/anmeldung/check?orderCode=${encodeURIComponent(lookupResult.orderCode)}`

      const signInResult = await sommerfreizeitAuthClient.signIn.magicLink({
        email: lookupResult.email,
        callbackURL,
      })

      if (signInResult.error) {
        setError('Bestellung gefunden, aber der Magic Link konnte nicht versendet werden.')
        return
      }

      setSuccessMessage(
        'Bestellung gefunden. Wir haben dir einen Magic Link geschickt. Bitte oeffne die E-Mail und folge dem Link.',
      )
    })
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Anmeldung mit Bestellcode</CardTitle>
        <CardDescription>
          Gib deinen Pretix-Bestellcode ein um die Bestellung abzuschließen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderCode">Bestellcode</Label>
            <Input
              id="orderCode"
              value={orderCode}
              onChange={(event) => setOrderCode(event.target.value.toUpperCase())}
              placeholder="z. B. ABC12"
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <div>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Wird abgerufen...' : 'Bestellung abrufen'}
            </Button>
            <Button variant="link" asChild>
              <Link href="/sommerfreizeit/anmeldung" className="ml-4">
                Noch keine Bestellung?
              </Link>
            </Button>
          </div>
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
        </form>
      </CardContent>
    </Card>
  )
}

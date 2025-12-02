'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type ConfirmationState = 'loading' | 'success' | 'error' | 'already_confirmed' | 'deadline_expired' | 'insufficient_spots'

export default function ConfirmationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const registrationId = params.registrationId as string
  const token = searchParams.get('token')

  const [state, setState] = useState<ConfirmationState>('loading')
  const [message, setMessage] = useState<string>('')
  const [eventTitle, setEventTitle] = useState<string>('')

  useEffect(() => {
    async function confirmRegistration() {
      if (!token) {
        setState('error')
        setMessage('Ungültiger Bestätigungslink. Token fehlt.')
        return
      }

      try {
        const response = await fetch(`/api/knallbonbon/confirm/${registrationId}?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setState('success')
          setMessage(data.message || 'Ihre Teilnahme wurde erfolgreich bestätigt!')
          setEventTitle(data.eventTitle || '')
        } else {
          // Handle specific error cases
          if (data.error === 'already_confirmed') {
            setState('already_confirmed')
            setMessage(data.message || 'Diese Anmeldung wurde bereits bestätigt.')
          } else if (data.error === 'deadline_expired') {
            setState('deadline_expired')
            setMessage(data.message || 'Die Bestätigungsfrist ist leider abgelaufen.')
          } else if (data.error === 'insufficient_spots') {
            setState('insufficient_spots')
            setMessage(data.message || 'Leider sind nicht mehr genügend Plätze verfügbar.')
          } else {
            setState('error')
            setMessage(data.message || 'Ein Fehler ist aufgetreten.')
          }
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setState('error')
        setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      }
    }

    confirmRegistration()
  }, [registrationId, token])

  return (
    <div className="mx-auto min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {state === 'loading' && (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Bestätigung wird verarbeitet...</h1>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
          </div>
        )}

        {state === 'success' && (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Bestätigung erfolgreich!</h1>
              {eventTitle && (
                <p className="text-xl text-gray-700">
                  <strong>{eventTitle}</strong>
                </p>
              )}
            </div>

            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6">
              <p className="text-center text-lg text-green-800">{message}</p>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Was passiert jetzt?</strong>
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Sie erhalten eine Bestätigungs-E-Mail an Ihre angegebene E-Mail-Adresse</li>
                <li>Weitere Details zum Event erhalten Sie kurz vor der Veranstaltung</li>
                <li>
                  Bei Fragen können Sie sich jederzeit an uns wenden
                </li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/knallbonbon"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zurück zur Knallbonbon-Seite
              </Link>
            </div>
          </div>
        )}

        {state === 'already_confirmed' && (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="size-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Bereits bestätigt</h1>
            </div>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <p className="text-center text-lg text-blue-800">{message}</p>
            </div>

            <p className="mb-6 text-center text-gray-700">
              Ihre Anmeldung wurde bereits erfolgreich bestätigt. Sie brauchen nichts weiter zu tun.
            </p>

            <div className="text-center">
              <Link
                href="/knallbonbon"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zurück zur Knallbonbon-Seite
              </Link>
            </div>
          </div>
        )}

        {state === 'deadline_expired' && (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
                <svg
                  className="size-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Frist abgelaufen</h1>
            </div>

            <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-6">
              <p className="text-center text-lg text-orange-800">{message}</p>
            </div>

            <div className="mb-6 space-y-4 text-gray-700">
              <p>
                Die Bestätigungsfrist für Ihren Platz ist leider abgelaufen. Der Platz wurde an die
                nächste Person auf der Warteliste vergeben.
              </p>
              <p>
                <strong>Sie bleiben weiterhin auf der Warteliste.</strong> Sollte erneut ein Platz
                frei werden, erhalten Sie eine neue Benachrichtigung.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/knallbonbon"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zurück zur Knallbonbon-Seite
              </Link>
            </div>
          </div>
        )}

        {state === 'insufficient_spots' && (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="size-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Nicht genügend Plätze</h1>
            </div>

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-center text-lg text-red-800">{message}</p>
            </div>

            <div className="mb-6 space-y-4 text-gray-700">
              <p>
                Leider sind in der Zwischenzeit nicht mehr genügend Plätze für alle Ihre Kinder
                verfügbar.
              </p>
              <p>
                <strong>Sie bleiben weiterhin auf der Warteliste.</strong> Sollten wieder genügend
                Plätze frei werden, erhalten Sie eine neue Benachrichtigung.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/knallbonbon"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zurück zur Knallbonbon-Seite
              </Link>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="size-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Fehler</h1>
            </div>

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-center text-lg text-red-800">{message}</p>
            </div>

            <div className="mb-6 space-y-4 text-gray-700">
              <p>
                Bitte überprüfen Sie den Bestätigungslink oder versuchen Sie es später erneut. Bei
                anhaltenden Problemen kontaktieren Sie uns bitte.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/knallbonbon"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zurück zur Knallbonbon-Seite
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

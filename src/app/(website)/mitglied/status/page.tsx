'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { stringify } from 'qs-esm'
import type { Where } from 'payload'
import { useSearchParams } from 'next/navigation'

const ApplicationStatusPage = () => {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [id, setId] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const urlId = searchParams.get('id')
    const urlEmail = searchParams.get('email')
    if (urlId) setId(urlId)
    if (urlEmail) setEmail(urlEmail)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatus(null)

    const query: Where = {
      id: { equals: id },
      email: { equals: email },
    }

    const stringifiedQuery = stringify({ where: query }, { addQueryPrefix: true })

    try {
      const response = await fetch(`/api/membershipApplication${stringifiedQuery}`)
      if (!response.ok) throw new Error('Application not found or invalid credentials.')
      const data = await response.json()
      const application = Array.isArray(data.docs) ? data.docs[0] : data
      if (!application || !application.status) {
        throw new Error('Kein Antrag gefunden oder ungültige Zugangsdaten.')
      }
      setStatus(application.status)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Unbekannter Fehler.')
      } else {
        setError('Unbekannter Fehler.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Mitgliedsantrag Status prüfen</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <Label htmlFor="id">ID:</Label>
          <Input id="id" type="text" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">E-Mail-Adresse:</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          Status prüfen
        </Button>
      </form>
      {loading && <p>Wird geladen...</p>}
      {status && (
        <p>
          Status: <strong>{status}</strong>
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

// Wrap the page export in Suspense
export default function Page() {
  return (
    <Suspense fallback={<div>Wird geladen...</div>}>
      <ApplicationStatusPage />
    </Suspense>
  )
}

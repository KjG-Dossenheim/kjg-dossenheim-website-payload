'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import {
  sendVerificationEmail,
  verifyToken,
  fetchRegistrationsByEmail,
  deleteChildren,
  deleteRegistration,
  type RegistrationData,
} from './actions'

export function KnallbonbonAbmeldenForm() {
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token')

  const [step, setStep] = useState<'email' | 'verified'>('email')
  const [email, setEmail] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [token, setToken] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registrations, setRegistrations] = useState<RegistrationData[]>([])
  const [selectedChildren, setSelectedChildren] = useState<Map<string, Set<string>>>(new Map())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'registration' | 'children'
    registrationId: string
    childrenIds?: string[]
  } | null>(null)

  // Check for token in URL on mount
  const handleTokenVerification = useCallback(async (tokenValue: string) => {
    setIsLoading(true)
    try {
      const result = await verifyToken(tokenValue)

      if (!result.success) {
        toast.error(result.message || 'Ungültiger Bestätigungslink.')
        setStep('email')
        return
      }

      // Token is valid, set verified state
      setToken(tokenValue)
      setVerifiedEmail(result.email || '')
      setEmail(result.email || '')
      setStep('verified')

      // Auto-fetch registrations
      const registrationsResult = await fetchRegistrationsByEmail(result.email || '', tokenValue)

      if (registrationsResult.success && 'data' in registrationsResult) {
        setRegistrations(registrationsResult.data || [])
        toast.success('E-Mail-Adresse erfolgreich bestätigt.')
      } else {
        const message =
          'message' in registrationsResult
            ? registrationsResult.message
            : 'Fehler beim Abrufen der Anmeldungen.'
        toast.error(message)
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      toast.error('Ein Fehler ist aufgetreten.')
      setStep('email')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tokenFromUrl) {
      void handleTokenVerification(tokenFromUrl)
    }
  }, [tokenFromUrl, handleTokenVerification])

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setEmailError('')

      // Simple email validation
      if (!email || !email.includes('@')) {
        setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
        return
      }

      setIsLoading(true)

      try {
        const result = await sendVerificationEmail(email)

        if (!result.success) {
          toast.error(result.message || 'Fehler beim Senden der Bestätigungs-E-Mail.')
          return
        }

        toast.success(result.message || 'Bestätigungs-E-Mail wurde gesendet.')
      } catch (error) {
        console.error('Error sending verification email:', error)
        toast.error('Ein unerwarteter Fehler ist aufgetreten.')
      } finally {
        setIsLoading(false)
      }
    },
    [email],
  )

  const handleChildSelection = useCallback((registrationId: string, childId: string) => {
    setSelectedChildren((prev) => {
      const newMap = new Map(prev)
      const regChildren = newMap.get(registrationId) || new Set()

      if (regChildren.has(childId)) {
        regChildren.delete(childId)
      } else {
        regChildren.add(childId)
      }

      if (regChildren.size === 0) {
        newMap.delete(registrationId)
      } else {
        newMap.set(registrationId, regChildren)
      }

      return newMap
    })
  }, [])

  const handleSelectAllChildren = useCallback((registration: RegistrationData) => {
    setSelectedChildren((prev) => {
      const newMap = new Map(prev)
      const allChildIds = new Set(registration.children.map((c) => c.id))
      const currentSelection = newMap.get(registration.id) || new Set()

      // If all are selected, deselect all. Otherwise, select all
      if (currentSelection.size === registration.children.length) {
        newMap.delete(registration.id)
      } else {
        newMap.set(registration.id, allChildIds)
      }

      return newMap
    })
  }, [])

  const handleDeleteChildren = useCallback(
    (registrationId: string) => {
      const childrenIds = Array.from(selectedChildren.get(registrationId) || [])

      if (childrenIds.length === 0) {
        toast.error('Bitte wählen Sie mindestens ein Kind aus.')
        return
      }

      setDeleteTarget({
        type: 'children',
        registrationId,
        childrenIds,
      })
      setShowDeleteDialog(true)
    },
    [selectedChildren],
  )

  const handleDeleteRegistration = useCallback((registrationId: string) => {
    setDeleteTarget({
      type: 'registration',
      registrationId,
    })
    setShowDeleteDialog(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || !token) return

    setIsLoading(true)
    setShowDeleteDialog(false)

    try {
      let result

      if (deleteTarget.type === 'registration') {
        result = await deleteRegistration(deleteTarget.registrationId, token)
      } else if (deleteTarget.childrenIds) {
        result = await deleteChildren(deleteTarget.registrationId, deleteTarget.childrenIds, token)
      }

      if (result?.success) {
        toast.success(result.message)

        // Refresh registrations
        const refreshResult = await fetchRegistrationsByEmail(verifiedEmail, token)
        if (refreshResult.success && 'data' in refreshResult) {
          setRegistrations(refreshResult.data || [])
        } else {
          setRegistrations([])
        }

        // Clear selections
        setSelectedChildren(new Map())
      } else {
        const message = result && 'message' in result ? result.message : 'Fehler beim Löschen.'
        toast.error(message)
      }
    } catch (error) {
      console.error('Error during deletion:', error)
      toast.error('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, verifiedEmail, token])

  return (
    <div className="space-y-6">
      {step === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Von Knallbonbon-Event abmelden</CardTitle>
            <CardDescription>
              Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Bestätigungslink, um Ihre
              Identität zu verifizieren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Field data-invalid={!!emailError}>
                <FieldLabel htmlFor="email">E-Mail-Adresse</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                  }}
                  placeholder="ihre@email.de"
                  disabled={isLoading}
                  aria-invalid={!!emailError}
                />
                <FieldDescription>
                  Die E-Mail-Adresse, die Sie bei der Anmeldung verwendet haben.
                </FieldDescription>
                {emailError && <FieldError errors={[{ message: emailError }]} />}
              </Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? 'Wird gesendet...' : 'Bestätigungslink anfordern'}
              </Button>
            </form>

            <Alert className="bg-primary/10 border-primary/50 mt-6">
              <CheckCircle2 className="text-primary size-5" />
              <AlertTitle>Sicherheitshinweis</AlertTitle>
              <AlertDescription>
                Sie erhalten eine E-Mail mit einem Bestätigungslink, der 15 Minuten gültig ist.
                Klicken Sie auf den Link, um Ihre Anmeldungen zu verwalten.{' '}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {step === 'verified' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ihre Anmeldungen verwalten</CardTitle>
              <CardDescription>E-Mail-Adresse bestätigt: {verifiedEmail}</CardDescription>
            </CardHeader>
          </Card>

          {registrations.length > 0 && (
            <div className="space-y-4">
              <Alert className="bg-primary/10 border-primary/50 mt-6">
                <AlertCircle className="text-primary size-5" />
                <AlertTitle>Wichtig</AlertTitle>
                <AlertDescription>
                  Wenn Sie alle Kinder einer Anmeldung abmelden, wird die gesamte Anmeldung
                  gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDescription>
              </Alert>

              {registrations.map((registration) => {
                const selectedChildrenCount = selectedChildren.get(registration.id)?.size || 0
                const allSelected = selectedChildrenCount === registration.children.length

                return (
                  <Card key={registration.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{registration.event.title}</CardTitle>
                          <CardDescription>
                            {registration.event.date &&
                              format(new Date(registration.event.date), 'dd. MMMM yyyy, HH:mm', {
                                locale: de,
                              })}{' '}
                            Uhr
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium">
                          Anmeldung von: {registration.firstName} {registration.lastName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Angemeldete Kinder:</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllChildren(registration)}
                          >
                            {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
                          </Button>
                        </div>

                        {registration.children.map((child) => {
                          const isSelected =
                            selectedChildren.get(registration.id)?.has(child.id) || false

                          return (
                            <div
                              key={child.id}
                              className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3"
                            >
                              <Checkbox
                                id={`child-${child.id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleChildSelection(registration.id, child.id)
                                }
                              />
                              <label
                                htmlFor={`child-${child.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                <p className="font-medium">{child.fullName}</p>
                                <p className="text-muted-foreground text-xs">
                                  {format(new Date(child.dateOfBirth), 'dd.MM.yyyy', {
                                    locale: de,
                                  })}
                                </p>
                              </label>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex gap-2 border-t pt-4">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteChildren(registration.id)}
                          disabled={selectedChildrenCount === 0 || isLoading}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Ausgewählte abmelden ({selectedChildrenCount})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRegistration(registration.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Gesamte Anmeldung löschen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'registration'
                ? 'Diese Aktion löscht die gesamte Anmeldung mit allen Kindern. Diese Aktion kann nicht rückgängig gemacht werden.'
                : `Sie sind dabei, ${deleteTarget?.childrenIds?.length || 0} ${(deleteTarget?.childrenIds?.length || 0) === 1 ? 'Kind' : 'Kinder'} abzumelden. ${
                    deleteTarget?.childrenIds?.length ===
                    registrations.find((r) => r.id === deleteTarget?.registrationId)?.children
                      .length
                      ? 'Da dies alle Kinder dieser Anmeldung sind, wird die gesamte Anmeldung gelöscht. '
                      : ''
                  }Diese Aktion kann nicht rückgängig gemacht werden.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ja, löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
